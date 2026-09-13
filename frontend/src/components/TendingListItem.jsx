import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

const TendingListItem = ({ tending, overdue, returning, onReturn, payingPenalty, onPayPenalty, isAdmin }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-4 flex gap-4 items-center"
    >
      <div className="w-14 h-20 rounded-lg bg-foreground/5 overflow-hidden flex-shrink-0">
        {tending.specimen?.coverUrl ? (
          <img src={tending.specimen.coverUrl} className="w-full h-full object-cover" alt={tending.specimen.title} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Leaf size={20} className="text-foreground/20" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold truncate">{tending.specimen?.title ?? 'Unknown specimen'}</p>
        <div className="flex items-center gap-1.5 text-sm text-foreground/60 mt-1">
          <Clock size={14} />
          <span>Due {new Date(tending.dueAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
        {tending.returnedAt ? (
          <span className="inline-flex items-center gap-1 text-xs text-primary mt-1">
            <CheckCircle2 size={12} /> Returned
          </span>
        ) : overdue ? (
          <span className="inline-flex items-center gap-1 text-xs text-red-500 mt-1">
            <AlertCircle size={12} /> Overdue
          </span>
        ) : null}
        {tending.penaltyAmount > 0 && (
          <div className="flex items-center gap-3 mt-1">
            <span className="inline-flex items-center gap-1 text-xs text-red-500 font-semibold">
              Penalty: ₹{tending.penaltyAmount}
            </span>
            {/* Curator only issues penalties, never pays them on a user's behalf. */}
            {!isAdmin && (
              <button
                onClick={() => onPayPenalty(tending)}
                disabled={payingPenalty}
                className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-500/90 transition-all disabled:opacity-50"
              >
                {payingPenalty ? 'Processing...' : 'Pay Penalty'}
              </button>
            )}
          </div>
        )}
      </div>

      {!tending.returnedAt && (
        <button
          onClick={() => onReturn(tending.id)}
          disabled={returning}
          className="btn-primary-sm disabled:opacity-50"
        >
          {returning ? 'Returning...' : 'Return'}
        </button>
      )}
    </motion.div>
  );
};

export default TendingListItem;
