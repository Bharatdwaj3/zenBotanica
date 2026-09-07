import React from 'react';

const GENRES = [
  { id: 'all', label: 'All Specimens' },
  { id: 'FLORA', label: 'Flora' },
  { id: 'FAUNA', label: 'Fauna' },
  { id: 'FUNGUS', label: 'Fungi' },
  { id: 'MINERAL', label: 'Minerals' },
  { id: 'ARTIFACT', label: 'Artifacts' },
  { id: 'HERB', label: 'Herbs' },
  { id: 'SEED', label: 'Seeds' },
  { id: 'UNKNOWN', label: 'Unknown' },
];

export default function CategoryFilter({ selected, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {GENRES.map((genre) => (
        <button
          key={genre.id}
          onClick={() => onChange(genre.id)}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap border ${
            selected === genre.id
              ? 'bg-[#4f8a6f]/10 border-[#4f8a6f] text-[#4f8a6f]'
              : 'bg-[#12201b] border-[#1a2e28] text-[#e7e3d8]/70 hover:border-[#4f8a6f] hover:text-[#4f8a6f]'
          }`}
        >
          {genre.label}
        </button>
      ))}
    </div>
  );
}
