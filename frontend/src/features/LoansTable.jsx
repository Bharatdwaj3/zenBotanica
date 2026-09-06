import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

const MAX_RENEWALS = 2;

// Shared Active/History loans table, used both for a signed-in user's own
// loans and for admin's unresolved-loans view. Pass `onWaiveFine` to show
// the admin-only Waive Fine action; omit it for the non-admin view.
// Pass `onRenew` to show the Renew action (non-admin view only — renewing
// someone else's loan isn't a thing admins do here).
const LoansTable = ({
  loans,
  isOverdue,
  onReturn,
  returningId,
  onRenew,
  renewingId,
  onWaiveFine,
  waivingFineForLoanId,
  checkedOutLabel = 'Borrowed',
  emptyNoun = 'loans',
}) => {
  const [tab, setTab] = useState('active');
  const activeLoans = loans.filter((loan) => !loan.returnedAt);
  const historyLoans = loans.filter((loan) => loan.returnedAt);
  const unsortedVisibleLoans = tab === 'active' ? activeLoans : historyLoans;

  // Overdue loans first, then earliest due date first within each group.
  // Numeric group keys (0/1) return 0 for equal-status pairs, which is
  // what makes this sort stable — unlike a bare -1/1 ternary.
  const visibleLoans = [...unsortedVisibleLoans].sort((a, b) => {
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
          Active ({activeLoans.length})
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            tab === 'history' ? 'bg-foreground/10 text-foreground' : 'text-foreground/50 hover:text-foreground'
          }`}
        >
          History ({historyLoans.length})
        </button>
      </div>

      {visibleLoans.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center text-foreground/50 text-sm">
          No {tab === 'active' ? 'active' : 'returned'} {emptyNoun}.
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header-row">
                <th className="p-4">Cover</th>
                <th className="p-4">Book</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Fine</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {visibleLoans.map((loan) => {
                const overdue = isOverdue(loan);
                return (
                  <tr key={loan.id} className="border-b border-border last:border-0 hover:bg-foreground/5">
                    <td className="p-4">
                      <div className="w-10 h-14 rounded bg-foreground/5 overflow-hidden flex items-center justify-center">
                        {loan.book?.coverUrl ? (
                          <img src={loan.book.coverUrl} className="w-full h-full object-cover" alt={loan.book.title} />
                        ) : (
                          <BookOpen size={16} className="text-foreground/20" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-semibold">{loan.book?.title ?? `Book #${loan.bookId}`}</td>
                    <td className="p-4 text-foreground/60">{new Date(loan.dueAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      {loan.returnedAt ? (
                        <span className="text-green-600">Returned</span>
                      ) : overdue ? (
                        <span className="text-red-500">Overdue</span>
                      ) : (
                        <span className="text-foreground/60">{checkedOutLabel}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {loan.fineAmount > 0 ? (
                        <span className="text-red-500 font-semibold">₹{loan.fineAmount}</span>
                      ) : (
                        <span className="text-foreground/40">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        {!loan.returnedAt && (
                          <button
                            onClick={() => onReturn(loan.id)}
                            disabled={returningId === loan.id}
                            className="btn-outline-sm disabled:opacity-50"
                          >
                            {returningId === loan.id ? 'Returning...' : 'Return'}
                          </button>
                        )}
                        {!loan.returnedAt && !overdue && onRenew && (loan.renewalCount ?? 0) < MAX_RENEWALS && (
                          <button
                            onClick={() => onRenew(loan.id)}
                            disabled={renewingId === loan.id}
                            className="btn-outline-sm disabled:opacity-50"
                          >
                            {renewingId === loan.id ? 'Renewing...' : 'Renew'}
                          </button>
                        )}
                        {onWaiveFine && loan.fineAmount > 0 && (
                          <button
                            onClick={() => onWaiveFine(loan.id)}
                            disabled={waivingFineForLoanId === loan.id}
                            className="btn-outline-sm disabled:opacity-50"
                          >
                            {waivingFineForLoanId === loan.id ? 'Waiving...' : 'Waive Fine'}
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

export default LoansTable;
