import React, { useState } from 'react';
import { X } from 'lucide-react';

const STATUS_LABELS = { penalty: 'Penalty', tend: 'Tend', returned: 'Returned' };
const STATUS_BADGE_STYLES = {
  penalty: 'bg-red-500/10 text-red-500 border-red-500/20',
  tend: 'bg-foreground/5 text-foreground/70 border-border',
  returned: 'bg-green-500/10 text-green-600 border-green-500/20',
};

const splitTendingsByStatus = (tendings) => ({
  penalty: tendings.filter((tending) => (tending.penaltyAmount || 0) > 0),
  tend: tendings.filter((tending) => !tending.returnedAt),
  returned: tendings.filter((tending) => tending.returnedAt),
});

const GardenerDrawer = ({ gardener, renderTending, onClose }) => {
  const [activeStatus, setActiveStatus] = useState(null);
  if (!gardener) return null;
  const buckets = splitTendingsByStatus(gardener.tendings);

  const toggleStatus = (status) => {
    setActiveStatus((current) => (current === status ? null : status));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card h-full overflow-y-auto p-6 border-l border-border">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold">{gardener.name}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-foreground/5">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-foreground/60 capitalize mb-4">{gardener.role}</p>

        <div className="flex gap-2 flex-wrap">
          {Object.keys(STATUS_LABELS).map((status) => (
            <button
              key={status}
              onClick={() => toggleStatus(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${STATUS_BADGE_STYLES[status]} ${
                activeStatus === status ? 'ring-2 ring-offset-1 ring-primary' : ''
              }`}
            >
              {STATUS_LABELS[status]} · {buckets[status].length}
            </button>
          ))}
        </div>

        {activeStatus && (
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            {buckets[activeStatus].length === 0 ? (
              <p className="text-sm text-foreground/50">No tendings in this category.</p>
            ) : (
              buckets[activeStatus].map(renderTending)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GardenerDrawer;
