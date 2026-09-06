import React from 'react';

const GENRES = [
  { id: 'all', label: 'All Genres' },
  { id: 'FICTION', label: 'Fiction' },
  { id: 'NON_FICTION', label: 'Non-Fiction' },
  { id: 'FANTASY', label: 'Fantasy' },
  { id: 'SCIENCE', label: 'Science' },
  { id: 'SCIENCE_FICTION', label: 'Science Fiction' },
  { id: 'MYSTERY', label: 'Mystery' },
  { id: 'ROMANCE', label: 'Romance' },
  { id: 'HORROR', label: 'Horror' },
  { id: 'HISTORY', label: 'History' },
  { id: 'BIOGRAPHY', label: 'Biography' },
  { id: 'POETRY', label: 'Poetry' },
  { id: 'DRAMA', label: 'Drama' },
  { id: 'SELF_HELP', label: 'Self-Help' },
  { id: 'TECHNOLOGY', label: 'Technology' },
  { id: 'PHILOSOPHY', label: 'Philosophy' },
  { id: 'CHILDREN', label: 'Children' },
];

export default function CategoryFilter({ selected, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {GENRES.map((genre) => (
        <button
          key={genre.id}
          onClick={() => onChange(genre.id)}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
            selected === genre.id
              ? 'bg-secondary/10 border border-secondary text-secondary'
              : 'bg-card border border-border text-foreground/70 hover:border-secondary hover:text-secondary'
          }`}
        >
          {genre.label}
        </button>
      ))}
    </div>
  );
}
