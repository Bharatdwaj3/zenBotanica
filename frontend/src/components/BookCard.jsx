import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { BookOpen, Tag, Pencil, Trash2, ShoppingCart, Heart } from 'lucide-react';
import { deleteBook } from '../util/catalogApi';
import { addBookToCart, removeBookFromCart } from '../store/cartSlice';
import { addBookToWishlist, removeBookFromWishlist } from '../store/wishlistSlice';

const BookCard = ({ book, index = 0, showAdminActions = false, onDeleted }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.avatar);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isAdmin = showAdminActions && user?.role === 'admin';

  const inCart = cartItems.some((item) => item.bookId === book.id);
  const inWishlist = wishlistItems.some((item) => item.bookId === book.id);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Delete this book permanently?') === false) return;
    try {
      await deleteBook(book.id);
      onDeleted?.(book.id);
    } catch (err) {
      alert('Failed to delete book');
    }
  };

  const handleToggleCart = (e) => {
    e.stopPropagation();
    dispatch(inCart ? removeBookFromCart(book.id) : addBookToCart(book.id));
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    dispatch(inWishlist ? removeBookFromWishlist(book.id) : addBookToWishlist(book.id));
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="content-card group cursor-pointer flex flex-col h-full"
      onClick={() => navigate(`/content/${book.id}`)}
    >
      <div className="relative aspect-[3/4] bg-foreground/5 overflow-hidden rounded-t-xl flex-shrink-0">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            alt={book.title}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/10 to-accent/10">
            <BookOpen size={48} className="text-foreground/20" strokeWidth={1.5} />
          </div>
        )}

        {isAdmin && (
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/staff/new?edit=${book.id}`); }}
              className="p-2 rounded-full bg-card/90 border border-border text-foreground/60 hover:text-primary transition-all"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-full bg-card/90 border border-border text-foreground/60 hover:text-primary transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        {isAdmin === false && user && (
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <button
              onClick={handleToggleWishlist}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              className="p-2 rounded-full bg-card/90 border border-border text-foreground/60 hover:text-primary transition-all"
            >
              <Heart size={14} className={inWishlist ? 'fill-primary text-primary' : ''} />
            </button>
            <button
              onClick={handleToggleCart}
              aria-label={inCart ? 'Remove from cart' : 'Add to cart'}
              className="p-2 rounded-full bg-card/90 border border-border text-foreground/60 hover:text-primary transition-all"
            >
              <ShoppingCart size={14} className={inCart ? 'fill-primary text-primary' : ''} />
            </button>
          </div>
        )}

        {book.genre?.[0] && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/95 backdrop-blur-sm border border-border text-xs font-semibold text-foreground/70">
              <Tag size={11} />
              {book.genre[0].replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold leading-snug text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-foreground/60 mb-4">{book.author}</p>

        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between text-xs text-foreground/50">
          <span>{book.publisher}</span>
          <span className={book.availableCopies > 0 ? 'text-secondary font-semibold' : 'text-primary font-semibold'}>
            {book.availableCopies > 0 ? `${book.availableCopies} available` : 'Unavailable'}
          </span>
        </div>
      </div>
    </motion.article>
  );
};

export default BookCard;
