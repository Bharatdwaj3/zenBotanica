import React from 'react';
import { BookOpen, Star, Repeat } from 'lucide-react';

const ToggleSwitch = ({ checked, onChange, label, activeColor }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onChange();
    }}
    className="flex items-center gap-2 text-left"
  >
    <span className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? activeColor : 'bg-foreground/15'}`}>
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-4' : ''}`}
      />
    </span>
    <span className="text-xs font-semibold text-foreground/70">{label}</span>
  </button>
);

const GENRE_LABELS = {
  SCIENCE_FICTION: 'Sci-Fi',
  NON_FICTION: 'Non-Fiction',
  SELF_HELP: 'Self-Help',
};
const formatGenre = (genre) => GENRE_LABELS[genre] || genre.charAt(0) + genre.slice(1).toLowerCase();

const BookListItem = ({ book, selected, onToggle, onToggleFeatured, onToggleWeeklyRead }) => {
  const outOfStock = book.availableCopies === 0;

  return (
    <div
      onClick={() => onToggle(book.id)}
      className={`bg-card rounded-2xl border p-3 cursor-pointer transition-all flex flex-col h-full ${
        selected ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/50'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(book.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 flex-shrink-0"
        />
        {outOfStock && (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">
            Out of stock
          </span>
        )}
      </div>

      <div className="relative aspect-[3/4] bg-foreground/5 overflow-hidden rounded-xl mb-3">
        {book.coverUrl ? (
          <img src={book.coverUrl} className="w-full h-full object-cover" alt={book.title} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/10 to-accent/10">
            <BookOpen size={40} className="text-foreground/20" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <p className="font-bold leading-snug mb-0.5 line-clamp-2">{book.title}</p>
      <p className="text-sm text-foreground/70 truncate mb-2">{book.author}</p>

      {book.genre?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {book.genre.map((g) => (
            <span key={g} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/60">
              {formatGenre(g)}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-foreground/50 mb-3">
        {book.availableCopies} / {book.totalCopies} available
      </p>

      <div className="mt-auto pt-3 border-t border-border space-y-2">
        <ToggleSwitch
          checked={book.featured}
          onChange={() => onToggleFeatured(book)}
          label={<span className="flex items-center gap-1"><Star size={12} /> Featured</span>}
          activeColor="bg-primary"
        />
        <ToggleSwitch
          checked={book.weeklyRead}
          onChange={() => onToggleWeeklyRead(book)}
          label={<span className="flex items-center gap-1"><Repeat size={12} /> Weekly Read</span>}
          activeColor="bg-green-500"
        />
      </div>
    </div>
  );
};

export default BookListItem;
