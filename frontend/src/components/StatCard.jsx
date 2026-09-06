import React from 'react';

const StatCard = ({ label, value, danger, onClick, active }) => (
  <div
    onClick={onClick}
    className={`bg-card rounded-2xl border p-4 ${onClick ? 'cursor-pointer hover:border-primary transition-all' : ''} ${
      active ? 'border-primary ring-1 ring-primary' : 'border-border'
    }`}
  >
    <p className="text-xs font-semibold text-foreground/50 uppercase mb-1">{label}</p>
    <p className={`text-2xl font-black ${danger ? 'text-red-500' : ''}`}>{value}</p>
  </div>
);

export default StatCard;
