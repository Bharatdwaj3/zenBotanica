import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, IndianRupee } from 'lucide-react';

const FineListItem = ({ fine, paying, onPay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-4 flex gap-4 items-center"
    >
      <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center flex-shrink-0">
        {fine.paid ? <CheckCircle2 size={20} className="text-green-500" /> : <AlertCircle size={20} className="text-red-500" />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold truncate">{fine.reason}</p>
        <p className="text-sm text-foreground/60 mt-1">
          {new Date(fine.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        {fine.paid && (
          <span className="inline-flex items-center gap-1 text-xs text-green-500 mt-1 font-semibold">
            <CheckCircle2 size={12} /> Paid
          </span>
        )}
      </div>

      <span className="font-black flex items-center flex-shrink-0"><IndianRupee size={16} />{fine.amount}</span>

      {!fine.paid && (
        <button
          onClick={() => onPay(fine)}
          disabled={paying}
          className="btn-primary-sm disabled:opacity-50"
        >
          {paying ? 'Processing...' : 'Pay'}
        </button>
      )}
    </motion.div>
  );
};

export default FineListItem;
