import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useMemberDirectory } from '../hooks/useMemberDirectory';
import { buildMemberRows } from '../util/buildMemberRows';
import LoanListItem from '../components/LoanListItem';
import StatCard from '../components/StatCard';
import LoansTable from './LoansTable';
import MembersTable from './MembersTable';
import MemberDrawer from './MemberDrawer';
import MemberSearchFilter from './MemberSearchFilter';
import FinesSection from './FinesSection';
import { issueLoan } from '../util/circulationApi';
import { useBooks } from '../hooks/useBooks';

const LoansSection = ({
  isAdmin,
  loans,
  loading,
  error,
  returnError,
  returningId,
  handleReturn,
  renewingId,
  renewError,
  handleRenew,
  isOverdue,
  totalFinesOwed,
  handlePayFine,
  payingFineForLoanId,
  payFineError,
  handleWaiveFine,
  waivingFineForLoanId,
  waiveFineError,
}) => {
  const { facultyList, studentList, directoryLoading } = useMemberDirectory(isAdmin);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueBook, setIssueBook] = useState(null);
  const [bookQuery, setBookQuery] = useState('');
  const [issueUserId, setIssueUserId] = useState('');
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState('');
  const [issueSuccess, setIssueSuccess] = useState('');
  const { bookList: issueBookOptions } = useBooks({ enabled: showIssueModal });
  const bookResults = bookQuery.trim()
    ? issueBookOptions
        .filter((b) => `${b.title} ${b.author}`.toLowerCase().includes(bookQuery.trim().toLowerCase()))
        .slice(0, 8)
    : [];

  if (loading || (isAdmin && directoryLoading)) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderLoanItem = (loan) => (
    <LoanListItem
      key={loan.id}
      loan={loan}
      overdue={isOverdue(loan)}
      returning={returningId === loan.id}
      onReturn={handleReturn}
      payingFine={payingFineForLoanId === loan.id}
      onPayFine={handlePayFine}
      isAdmin={isAdmin}
    />
  );

  if (!isAdmin) {
    return (
      <div>
        {error && <p className="text-sm text-primary mb-6">{error}</p>}
        {returnError && <p className="text-sm text-primary mb-6">{returnError}</p>}
        {renewError && <p className="text-sm text-primary mb-6">{renewError}</p>}
        {payFineError && <p className="text-sm text-red-500 mb-6">{payFineError}</p>}
        <LoansTable
          loans={loans}
          isOverdue={isOverdue}
          onReturn={handleReturn}
          returningId={returningId}
          onRenew={handleRenew}
          renewingId={renewingId}
        />
        <div className="mt-8">
          <FinesSection />
        </div>
      </div>
    );
  }

  const allRows = buildMemberRows(facultyList, studentList, loans, isOverdue);
  const directoryUserIds = new Set(allRows.map((row) => row.userId).filter(Boolean));
  const unresolvedLoans = loans.filter((loan) => !directoryUserIds.has(loan.userId));

  const visibleRows = allRows.filter((row) => {
    const matchesRole = roleFilter === 'all' || row.role === roleFilter;
    const matchesSearch = row.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOverdue = !showOverdueOnly || row.overdue > 0;
    return matchesRole && matchesSearch && matchesOverdue;
  });

  const activeLoanCount = loans.filter((loan) => !loan.returnedAt).length;
  const overdueCount = loans.filter(isOverdue).length;
  const totalMembers = facultyList.length + studentList.length;

  return (
    <div>
      {error && <p className="text-sm text-primary mb-6">{error}</p>}
      {returnError && <p className="text-sm text-primary mb-6">{returnError}</p>}
      {payFineError && <p className="text-sm text-red-500 mb-6">{payFineError}</p>}
      {waiveFineError && <p className="text-sm text-red-500 mb-6">{waiveFineError}</p>}

      {/* Admin quick-action buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          type="button"
          onClick={() => { setShowIssueModal(true); setIssueError(""); setIssueSuccess(""); }}
          className="btn-primary"
        >
          <span className="text-lg leading-none">+</span> Issue Loan
        </button>
        <button
          type="button"
          onClick={() => window.location.href = "/staff/new"}
          className="btn-outline"
        >
          <span className="text-lg leading-none">+</span> Add New Book
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Active Loans" value={activeLoanCount} />
        <StatCard
          label="Overdue Items"
          value={overdueCount}
          danger={overdueCount > 0}
          onClick={() => setShowOverdueOnly((prev) => !prev)}
          active={showOverdueOnly}
        />
        <StatCard label="Unpaid Fines" value={`₹${totalFinesOwed}`} danger={totalFinesOwed > 0} />
        <StatCard label="Total Members" value={totalMembers} />
      </div>

      <MemberSearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
      />

      {visibleRows.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center text-foreground/60">
          <BookOpen size={32} className="mx-auto mb-3 text-foreground/20" />
          No members match this search.
        </div>
      ) : (
        <MembersTable rows={visibleRows} onSelect={setSelectedMember} />
      )}

      {unresolvedLoans.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-1">Unresolved Loans</h3>
          <p className="text-sm text-foreground/50 mb-3">
            These loans reference a user not found in the current directory.
          </p>
          <LoansTable
            loans={unresolvedLoans}
            isOverdue={isOverdue}
            onReturn={handleReturn}
            returningId={returningId}
            onWaiveFine={handleWaiveFine}
            waivingFineForLoanId={waivingFineForLoanId}
            checkedOutLabel="Checked out"
            emptyNoun="orphaned loans"
          />
        </div>
      )}

      {/* Issue Loan Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4">Issue Loan</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Book</label>
                {issueBook ? (
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-border bg-background text-sm">
                    <span className="truncate">{issueBook.title} — {issueBook.author}</span>
                    <button type="button" onClick={() => setIssueBook(null)} className="text-xs text-foreground/50 hover:text-foreground ml-2">Change</button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={bookQuery}
                      onChange={(e) => setBookQuery(e.target.value)}
                      placeholder="Search title or author…"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    {bookResults.length > 0 && (
                      <div className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-border bg-background">
                        {bookResults.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => { setIssueBook(b); setBookQuery(''); }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-foreground/5"
                          >
                            {b.title} — {b.author}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Member</label>
                <select
                  value={issueUserId}
                  onChange={(e) => setIssueUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select a member…</option>
                  {[...facultyList, ...studentList].map((m) => (
                    <option key={m.id || m.userId} value={m.id || m.userId}>
                      {m.name || m.displayName || m.email} ({m.role || "member"})
                    </option>
                  ))}
                </select>
              </div>

              {issueError && <p className="text-sm text-red-500">{issueError}</p>}
              {issueSuccess && <p className="text-sm text-green-600">{issueSuccess}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                disabled={issuing || !issueBook || !issueUserId}
                onClick={async () => {
                  setIssuing(true);
                  setIssueError("");
                  setIssueSuccess("");
                  try {
                    await issueLoan({ bookId: issueBook.id, userId: Number(issueUserId) });
                    setIssueSuccess("Loan issued successfully");
                    setIssueBook(null);
                    setBookQuery("");
                    setIssueUserId("");
                    setTimeout(() => setShowIssueModal(false), 1200);
                  } catch (err) {
                    setIssueError(err.response?.data?.message || "Failed to issue loan");
                  } finally {
                    setIssuing(false);
                  }
                }}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {issuing ? "Issuing…" : "Issue Loan"}
              </button>
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <MemberDrawer member={selectedMember} renderLoan={renderLoanItem} onClose={() => setSelectedMember(null)} />
    </div>
  );
};

export default LoansSection;
