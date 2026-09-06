import React from 'react';
import { usePenaltys } from '../hooks/usePenaltys';

const PenaltysTable = ({ penaltys, payingId, onPay }) => {
  if (penaltys.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center text-foreground/50 text-sm">
        No penaltys.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="table-header-row">
            <th className="p-4 font-semibold">Reason</th>
            <th className="p-4 font-semibold">Date</th>
            <th className="p-4 font-semibold">Status</th>
            <th className="p-4 font-semibold">Amount</th>
            <th className="p-4 font-semibold"></th>
          </tr>
        </thead>
        <tbody>
          {penaltys.map((penalty) => (
            <tr key={penalty.id} className="border-b border-border last:border-0 hover:bg-foreground/5">
              <td className="p-4 font-semibold">{penalty.reason}</td>
              <td className="p-4 text-foreground/60">
                {new Date(penalty.createdAt).toLocaleDateString()}
              </td>
              <td className="p-4">
                {penalty.paid ? (
                  <span className="text-green-600">Paid</span>
                ) : (
                  <span className="text-red-500">Unpaid</span>
                )}
              </td>
              <td className="p-4">
                <span className={penalty.paid ? 'text-foreground/60' : 'text-red-500 font-semibold'}>
                  ₹{penalty.amount}
                </span>
              </td>
              <td className="p-4">
                {!penalty.paid && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => onPay(penalty)}
                      disabled={payingId === penalty.id}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      {payingId === penalty.id ? 'Processing...' : 'Pay'}
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PenaltysSection = () => {
  const { penaltys, loading, error, payingId, payError, handlePay } = usePenaltys();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-lg tracking-wide mb-3">Penaltys & Fee Ledger</h2>
      {error && <p className="text-sm text-primary mb-6">{error}</p>}
      {payError && <p className="text-sm text-red-500 mb-6">{payError}</p>}
      <PenaltysTable penaltys={penaltys} payingId={payingId} onPay={handlePay} />
    </div>
  );
};

export default PenaltysSection;
