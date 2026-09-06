import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Plus } from 'lucide-react';

export default function SimilarBooksRow({ title, books, emptyMessage }) {
  const navigate = useNavigate();

  if (!books || books.length === 0) {
    if (!emptyMessage) return null;
    return (
      <div className="mt-12">
        <h2 className="font-display text-lg tracking-wide text-foreground mb-4">{title}</h2>
        <div className="rounded-2xl border border-border bg-card/50 px-6 py-8 text-center text-sm text-foreground/50">
          {emptyMessage}
        </div>
      </div>
    );
  }

  const visibleBooks = books.slice(0, 6);

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg tracking-wide text-foreground">{title}</h2>
        <Link
          to="/explore"
          className="text-xs font-semibold text-foreground/50 hover:text-primary transition-colors whitespace-nowrap"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {visibleBooks.map((book, index) => (
          <motion.article
            key={book.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="content-card group cursor-pointer"
            onClick={() => navigate(`/content/${book.id}`)}
          >
            <div className="relative aspect-[2/3] bg-foreground/5 overflow-hidden rounded-t-xl">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt={book.title}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/10 to-accent/10">
                  <BookOpen size={32} className="text-foreground/20" strokeWidth={1.5} />
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/content/${book.id}`);
                }}
                className="btn-primary-sm absolute bottom-2 left-2 right-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Plus size={12} strokeWidth={2.5} />
                Borrow
              </button>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-bold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {book.title}
              </h3>
              <p className="text-xs text-foreground/60 mt-1">{book.author}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
