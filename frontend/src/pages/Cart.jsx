import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, BookOpen, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchCart, removeBookFromCart, checkout, clearCheckoutResults } from '../store/cartSlice';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error, checkoutResults, checkingOut } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleRemove = (bookId) => dispatch(removeBookFromCart(bookId));
  const handleCheckout = () => dispatch(checkout());

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
          <ShoppingCart size={28} /> My Cart
        </h1>

        {error && <p className="text-sm text-red-500 mb-6">{error}</p>}

        {checkoutResults && (
          <div className="bg-card rounded-2xl border border-border p-5 mb-6 space-y-2">
            <p className="font-bold mb-2">Checkout results</p>
            {checkoutResults.map((r) => (
              <div key={r.bookId} className="flex items-center gap-2 text-sm">
                {r.success ? <CheckCircle2 size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-red-500" />}
                <span>{r.message}</span>
              </div>
            ))}
            <button
              onClick={() => dispatch(clearCheckoutResults())}
              className="text-xs text-foreground/50 hover:text-foreground mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center text-foreground/60">
            <ShoppingCart size={32} className="mx-auto mb-3 text-foreground/20" />
            Your cart is empty.
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
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

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full btn-primary disabled:opacity-50"
            >
              {checkingOut ? 'Checking out...' : 'Checkout — Borrow All'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
