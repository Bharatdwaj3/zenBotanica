import React from 'react';
import { Filter, TrendingUp, Clock, Star } from 'lucide-react';

const SORTS = [
  { id: 'recent', label: 'Recent', icon: Clock },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'featured', label: 'Featured', icon: Star },
];

export default function SortButtons({ selected, onChange }) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground/50 flex-shrink-0">
        <Filter size={16} />
        <span>Sort by:</span>
      </div>
      <div className="flex gap-2">
        {SORTS.map((sort) => {
          const Icon = sort.icon;
          return (
            <button
              key={sort.id}
              onClick={() => onChange(sort.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                selected === sort.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-card border border-border text-foreground/70 hover:border-primary hover:text-primary'
              }`}
            >
              <Icon size={14} />
              {sort.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
