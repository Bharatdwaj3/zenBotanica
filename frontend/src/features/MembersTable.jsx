import React from 'react';

const CountCell = ({ count, tone }) => {
  if (count === 0) return <span className="text-foreground/40">—</span>;
  const styles = tone === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-foreground/5 text-foreground/70';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles}`}>{count}</span>;
};

const MembersTable = ({ rows, onSelect }) => (
  <div className="bg-card rounded-2xl border border-border overflow-hidden">
    <table className="w-full text-sm">
      <thead>
        <tr className="table-header-row">
          <th className="p-4">Member</th>
          <th className="p-4">Role</th>
          <th className="p-4">Active Loans</th>
          <th className="p-4">Overdue</th>
          <th className="p-4">Outstanding Fines</th>
          <th className="p-4"></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-b border-border last:border-0 hover:bg-foreground/5">
            <td className="p-4 font-semibold">{row.name}</td>
            <td className="p-4 text-foreground/60 capitalize">{row.role}</td>
            <td className="p-4"><CountCell count={row.activeLoans} /></td>
            <td className="p-4"><CountCell count={row.overdue} tone="danger" /></td>
            <td className="p-4">
              {row.outstandingFines > 0 ? (
                <span className="text-red-500 font-semibold">₹{row.outstandingFines}</span>
              ) : (
                <span className="text-foreground/40">—</span>
              )}
            </td>
            <td className="p-4">
              <button
                onClick={() => onSelect(row)}
                className="btn-outline-sm"
              >
                View Details
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default MembersTable;
