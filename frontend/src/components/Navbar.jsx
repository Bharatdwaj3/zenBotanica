import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Menu, X, User, LogOut, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchUser, clearUser } from '../store/avatarSlice';
import { fetchCart } from '../store/cartSlice';
import { logoutUser } from '../util/membersApi';

const getProfile = (user) => user?.faculty || user?.student || null;

const getDisplayName = (user) => {
  const profile = getProfile(user);
  if (profile) return `${profile.Fname} ${profile.Lname}`;
  if (user?.role === 'admin') return 'System Administrator';
  return user?.email || 'User';
};

const getInitial = (user) => {
  const profile = getProfile(user);
  if (profile?.Fname) return profile.Fname[0].toUpperCase();
  return user?.email ? user.email[0].toUpperCase() : 'U';
};

const Navbar = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.avatar);
  const cartItems = useSelector((state) => state.cart.items);
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      dispatch(fetchCart());
    }
  }, [user, dispatch]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      dispatch(clearUser());
      setIsMenuOpen(false);
      navigate('/login');
    }
  };

  // Hands off to Explore's ?q= param, which useExploreBooks already reads
  // on mount — this was the missing half of that wiring.
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  if (loading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link
            to="/"
            className="font-display text-3xl tracking-wide text-foreground hover:text-primary transition-colors"
          >
            HonKhana
          </Link>
          <Link
            to="/explore"
            className="hidden sm:block font-display text-base tracking-wide text-foreground/70 hover:text-primary transition-colors"
          >
            Explore
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-foreground/5 border border-border rounded-xl hover:border-primary/30 transition-colors group">
              <Search size={18} className="text-foreground/40 group-hover:text-primary transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
                placeholder="Search books..."
                className="bg-transparent text-sm text-foreground placeholder:text-foreground/40 focus:outline-none w-48"
              />
            </div>

            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="sm:hidden p-2 hover:bg-foreground/5 rounded-lg transition-colors"
            >
              <Search size={20} className="text-foreground/60" />
            </button>

            {user && user.role !== 'admin' && (
              <Link
                to="/cart"
                className="relative p-2 hover:bg-foreground/5 rounded-lg transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart size={20} className="text-foreground/60" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-3 p-1.5 pr-4 rounded-xl hover:bg-foreground/5 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ring-2 ring-background font-bold text-sm text-primary">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={getDisplayName(user)}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitial(user)
                    )}
                  </div>
                  <span className="hidden md:block font-display text-base tracking-wide text-foreground">
                    {getDisplayName(user)}
                  </span>
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-border bg-foreground/[0.02]">
                          <p className="font-display text-base tracking-wide text-foreground">{getDisplayName(user)}</p>
                          <p className="text-xs text-foreground/50 capitalize">{user.role}</p>
                        </div>

                        <div className="py-2">
                          <Link
                            to="/profile"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/70 hover:bg-foreground/5 hover:text-primary transition-colors"
                          >
                            <User size={16} />
                            My Profile
                          </Link>
                          {user.role !== 'admin' && (
                            <Link
                              to="/wishlist"
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/70 hover:bg-foreground/5 hover:text-primary transition-colors"
                            >
                              <ShoppingCart size={16} />
                              My Wishlist
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-border py-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary hover:bg-primary/5 transition-colors w-full"
                          >
                            <LogOut size={16} />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-foreground/70 hover:text-primary transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary"
                >
                  Sign up
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-foreground/5 rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <X size={24} className="text-foreground/60" />
              ) : (
                <Menu size={24} className="text-foreground/60" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="sm:hidden pb-4 overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 py-2.5 bg-foreground/5 border border-border rounded-xl">
                <Search size={18} className="text-foreground/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchSubmit}
                  placeholder="Search books..."
                  className="bg-transparent text-sm text-foreground placeholder:text-foreground/40 focus:outline-none flex-grow"
                  autoFocus
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 hover:bg-foreground/5 rounded transition-colors"
                >
                  <X size={16} className="text-foreground/40" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
