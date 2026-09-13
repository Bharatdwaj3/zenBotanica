import React, { useState } from 'react';
import { Leaf } from 'lucide-react';

const MAX_RENEWALS = 2;

// Shared Active/History tendings table, used both for a signed-in user's own
// tendings and for curator's unresolved-tendings view. Pass `onWaivePenalty` to show
// the curator-only Waive Penalty action; omit it for the non-curator view.
// Pass `onRenew` to show the Renew action (non-curator view only — renewing
// someone else's tending isn't a thing admins do here).
const TendingsTable = ({
  tendings,
  isOverdue,
  onReturn,
  returningId,
  onRenew,
  renewingId,
  onWaivePenalty,
  waivingPenaltyForTendingId,
  checkedOutLabel = 'Tended',
  emptyNoun = 'tendings',
}) => {
  const [tab, setTab] = useState('active');
  const activeTendings = tendings.filter((tending) => !tending.returnedAt);
  const historyTendings = tendings.filter((tending) => tending.returnedAt);
  const unsortedVisibleTendings = tab === 'active' ? activeTendings : historyTendings;

  // Overdue tendings first, then earliest due date first within each group.
  // Numeric group keys (0/1) return 0 for equal-status pairs, which is
  // what makes this sort stable — unlike a bare -1/1 ternary.
  const visibleTendings = [...unsortedVisibleTendings].sort((a, b) => {
    const aGroup = isOverdue(a) ? 0 : 1;
    const bGroup = isOverdue(b) ? 0 : 1;
    if (aGroup !== bGroup) return aGroup - bGroup;
    return new Date(a.dueAt) - new Date(b.dueAt);
  });

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setTab('active')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            tab === 'active' ? 'bg-foreground/10 text-foreground' : 'text-foreground/50 hover:text-foreground'
          }`}
        >
          Active ({activeTendings.length})
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            tab === 'history' ? 'bg-foreground/10 text-foreground' : 'text-foreground/50 hover:text-foreground'
          }`}
        >
          History ({historyTendings.length})
        </button>
      </div>

      {visibleTendings.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center text-foreground/50 text-sm">
          No {tab === 'active' ? 'active' : 'returned'} {emptyNoun}.
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header-row">
                <th className="p-4">Cover</th>
                <th className="p-4">Specimen</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Penalty</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {visibleTendings.map((tending) => {
                const overdue = isOverdue(tending);
                return (
                  <tr key={tending.id} className="border-b border-border last:border-0 hover:bg-foreground/5">
                    <td className="p-4">
                      <div className="w-10 h-14 rounded bg-foreground/5 overflow-hidden flex items-center justify-center">
                        {tending.specimen?.coverUrl ? (
                          <img src={tending.specimen.coverUrl} className="w-full h-full object-cover" alt={tending.specimen.title} />
                        ) : (
                          <Leaf size={16} className="text-foreground/20" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-semibold">{tending.specimen?.title ?? `Specimen #${tending.specimenId}`}</td>
                    <td className="p-4 text-foreground/60">{new Date(tending.dueAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      {tending.returnedAt ? (
                        <span className="text-green-600">Returned</span>
                      ) : overdue ? (
                        <span className="text-red-500">Overdue</span>
                      ) : (
                        <span className="text-foreground/60">{checkedOutLabel}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {tending.penaltyAmount > 0 ? (
                        <span className="text-red-500 font-semibold">₹{tending.penaltyAmount}</span>
                      ) : (
                        <span className="text-foreground/40">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        {!tending.returnedAt && (
                          <button
                            onClick={() => onReturn(tending.id)}
                            disabled={returningId === tending.id}
                            className="btn-outline-sm disabled:opacity-50"
                          >
                            {returningId === tending.id ? 'Returning...' : 'Return'}
                          </button>
                        )}
                        {!tending.returnedAt && !overdue && onRenew && (tending.renewalCount ?? 0) < MAX_RENEWALS && (
                          <button
                            onClick={() => onRenew(tending.id)}
                            disabled={renewingId === tending.id}
                            className="btn-outline-sm disabled:opacity-50"
                          >
                            {renewingId === tending.id ? 'Renewing...' : 'Renew'}
                          </button>
                        )}
                        {onWaivePenalty && tending.penaltyAmount > 0 && (
                          <button
                            onClick={() => onWaivePenalty(tending.id)}
                            disabled={waivingPenaltyForTendingId === tending.id}
                            className="btn-outline-sm disabled:opacity-50"
                          >
                            {waivingPenaltyForTendingId === tending.id ? 'Waiving...' : 'Waive Penalty'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TendingsTable;
