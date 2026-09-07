import React from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import SpecimenCard from './SpecimenCard';
import SpecimenGridSkeleton from './SpecimenGridSkeleton';

const SpecimenGrid = ({ specimens, loading, showAdminActions = false, onSpecimenDeleted }) => {
  // 1. Show detailed skeleton while loading
  if (loading) {
    return <SpecimenGridSkeleton count={8} />;
  }

  // 2. Enhanced empty state matching the Mionchoillte theme
  if (!specimens || specimens.length === 0) {
    return (
      <div className="bg-[#12201b] border border-[#1a2e28] rounded-2xl p-12 text-center text-[#e7e3d8]/60">
        <Leaf size={32} className="mx-auto mb-3 text-[#4f8a6f]/40" />
        <p className="text-sm font-medium tracking-wide">No specimens found in the grove.</p>
      </div>
    );
  }

  // 3. Render the actual grid with smooth entrance animation
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
