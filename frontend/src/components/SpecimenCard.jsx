import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Leaf, Tag, Pencil, Trash2, ShoppingCart, Heart } from 'lucide-react';
import { deleteSpecimen } from '../util/groveApi';
import { addSpecimenToCart, removeSpecimenFromCart } from '../store/cartSlice';
import { addSpecimenToWishlist, removeSpecimenFromWishlist } from '../store/wishlistSlice';

const SpecimenCard = ({ specimen, index = 0, showAdminActions = false, onDeleted }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.avatar);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isAdmin = showAdminActions && user?.role === 'admin';

  const inCart = cartItems.some((item) => item.specimenId === specimen.id);
  const inWishlist = wishlistItems.some((item) => item.specimenId === specimen.id);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Delete this specimen permanently?') === false) return;
    try {
      await deleteSpecimen(specimen.id);
      onDeleted?.(specimen.id);
    } catch (err) {
      alert('Failed to delete specimen');
    }
  };

  const handleToggleCart = (e) => {
    e.stopPropagation();
    dispatch(inCart ? removeSpecimenFromCart(specimen.id) : addSpecimenToCart(specimen.id));
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    dispatch(inWishlist ? removeSpecimenFromWishlist(specimen.id) : addSpecimenToWishlist(specimen.id));
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="content-card group cursor-pointer flex flex-col h-full"
      onClick={() => navigate(`/content/${specimen.id}`)}
    >
      <div className="relative aspect-[3/4] bg-foreground/5 overflow-hidden rounded-t-xl flex-shrink-0">
        {specimen.coverUrl ? (
          <img
            src={specimen.coverUrl}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            alt={specimen.title}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/10 to-accent/10">
            <Leaf size={48} className="text-foreground/20" strokeWidth={1.5} />
          </div>
        )}

        {isAdmin && (
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/staff/new?edit=${specimen.id}`); }}
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

        {specimen.genre?.[0] && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/95 backdrop-blur-sm border border-border text-xs font-semibold text-foreground/70">
              <Tag size={11} />
              {specimen.genre[0].replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold leading-snug text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
          {specimen.title}
        </h3>
        <p className="text-sm text-foreground/60 mb-4">{specimen.author}</p>

        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between text-xs text-foreground/50">
          <span>{specimen.publisher}</span>
          <span className={specimen.availableCopies > 0 ? 'text-secondary font-semibold' : 'text-primary font-semibold'}>
            {specimen.availableCopies > 0 ? `${specimen.availableCopies} available` : 'Unavailable'}
          </span>
        </div>
      </div>
    </motion.article>
  );
};

export default SpecimenCard;
