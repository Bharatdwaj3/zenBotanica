import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Heart, BookOpen, X } from 'lucide-react';
import { fetchWishlist, removeBookFromWishlist } from '../store/wishlistSlice';

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = (bookId) => dispatch(removeBookFromWishlist(bookId));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl tracking-wide mb-8 flex items-center gap-3">
          <Heart size={28} /> My Wishlist
        </h1>

        {error && <p className="text-sm text-red-500 mb-6">{error}</p>}

        {items.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center text-foreground/60">
            <Heart size={32} className="mx-auto mb-3 text-foreground/20" />
            Your wishlist is empty.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-card rounded-2xl border border-border p-4 flex gap-4 items-center">
                <div
                  className="w-14 h-20 rounded-lg bg-foreground/5 overflow-hidden flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/content/${item.bookId}`)}
                >
                  {item.book?.coverUrl ? (
                    <img src={item.book.coverUrl} className="w-full h-full object-cover" alt={item.book.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={20} className="text-foreground/20" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{item.book?.title ?? 'Unknown book'}</p>
                  <p className="text-sm text-foreground/60">{item.book?.author}</p>
                </div>
                <button
                  onClick={() => handleRemove(item.bookId)}
                  className="p-2 rounded-lg hover:bg-foreground/5 text-foreground/40 hover:text-red-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
