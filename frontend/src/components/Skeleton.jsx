import React from 'react';

export default function Skeleton({ className = "", width = "w-full", height = "h-4", rounded = "rounded-lg" }) {
  return (
    <div 
      className={`${width} ${height} ${rounded} bg-[#1a2e28] animate-pulse`}
      aria-hidden="true"
    />
  );
}
