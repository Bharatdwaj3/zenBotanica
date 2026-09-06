import React from 'react';
import { motion } from 'framer-motion';
import { SpecimenOpen } from 'lucide-react';
import SpecimenCard from './SpecimenCard';

const SpecimenGrid = ({ specimens, loading, showAdminActions = false, onSpecimenDeleted }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="content-card h-[320px] animate-pulse">
            <div className="aspect-[3/4] bg-foreground/5 rounded-t-xl" />
            <div className="p-5 space-y-3">
              <div className="h-3 bg-foreground/5 rounded w-1/3" />
              <div className="h-6 bg-foreground/5 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (specimens.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center text-foreground/60">
        <SpecimenOpen size={32} className="mx-auto mb-3 text-foreground/20" />
        No specimens found.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {specimens.map((specimen, index) => (
        <SpecimenCard
          key={specimen.id}
          specimen={specimen}
          index={index}
          showAdminActions={showAdminActions}
          onDeleted={onSpecimenDeleted}
        />
      ))}
    </motion.div>
  );
};

export default SpecimenGrid;
