import React from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import BookGrid from '../components/BookGrid';
import SortButtons from '../components/SortButtons';
import CategoryFilter from '../components/CategoryFilter';
import { useExploreBooks } from '../hooks/useExploreBooks';

export default function Explore() {
  const { user } = useSelector((state) => state.avatar);
  const {
    filteredBooks,
    loading,
    error,
    selectedGenre,
    sortBy,
    searchQuery,
    setSearchQuery,
    setSelectedGenre,
    setSortBy,
  } = useExploreBooks();

  const isAdmin = user?.role === 'admin';

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="pt-24 pb-16">
        <div className="max-w-[1400px] mx-auto px-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl tracking-wide mb-3">Explore Books</h1>
            <p className="text-foreground/60 text-lg">Discover books from the HonKhana library</p>
          </motion.div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 mb-8">
          <div className="relative w-full sm:w-96 mb-4 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or author..."
              className="w-full bg-card border border-border rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <SortButtons selected={sortBy} onChange={setSortBy} />
            <CategoryFilter selected={selectedGenre} onChange={setSelectedGenre} />
          </div>
        </div>

        <div className="px-6 max-w-[1400px] mx-auto">
          <BookGrid books={filteredBooks} loading={loading} showAdminActions={isAdmin} />
          {error && <p className="text-sm text-primary text-center mt-6">{error}</p>}
        </div>
      </div>
    </main>
  );
}
