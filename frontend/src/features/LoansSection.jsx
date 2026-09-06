import React, { useState } from 'react';
import { SpecimenOpen } from 'lucide-react';
import { useGardenerDirectory } from '../hooks/useGardenerDirectory';
import { buildGardenerRows } from '../util/buildGardenerRows';
import TendingListItem from '../components/TendingListItem';
import StatCard from '../components/StatCard';
import TendingsTable from './TendingsTable';
import GardenersTable from './GardenersTable';
import GardenerDrawer from './GardenerDrawer';
import GardenerSearchFilter from './GardenerSearchFilter';
import PenaltysSection from './PenaltysSection';
import { issueTending } from '../util/tendingApi';
import { useSpecimens } from '../hooks/useSpecimens';

const TendingsSection = ({
  isAdmin,
  tendings,
  loading,
  error,
  returnError,
  returningId,
  handleReturn,
  renewingId,
  renewError,
  handleRenew,
  isOverdue,
  totalPenaltysOwed,
  handlePayPenalty,
  payingPenaltyForTendingId,
  payPenaltyError,
  handleWaivePenalty,
  waivingPenaltyForTendingId,
  waivePenaltyError,
}) => {
  const { facultyList, studentList, directoryLoading } = useGardenerDirectory(isAdmin);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedGardener, setSelectedGardener] = useState(null);
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueSpecimen, setIssueSpecimen] = useState(null);
  const [specimenQuery, setSpecimenQuery] = useState('');
  const [issueUserId, setIssueUserId] = useState('');
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState('');
  const [issueSuccess, setIssueSuccess] = useState('');
  const { specimenList: issueSpecimenOptions } = useSpecimens({ enabled: showIssueModal });
  const specimenResults = specimenQuery.trim()
    ? issueSpecimenOptions
        .filter((b) => `${b.title} ${b.author}`.toLowerCase().includes(specimenQuery.trim().toLowerCase()))
        .slice(0, 8)
    : [];

  if (loading || (isAdmin && directoryLoading)) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderTendingItem = (tending) => (
    <TendingListItem
      key={tending.id}
      tending={tending}
      overdue={isOverdue(tending)}
      returning={returningId === tending.id}
      onReturn={handleReturn}
      payingPenalty={payingPenaltyForTendingId === tending.id}
      onPayPenalty={handlePayPenalty}
      isAdmin={isAdmin}
    />
  );

  if (!isAdmin) {
    return (
      <div>
        {error && <p className="text-sm text-primary mb-6">{error}</p>}
        {returnError && <p className="text-sm text-primary mb-6">{returnError}</p>}
        {renewError && <p className="text-sm text-primary mb-6">{renewError}</p>}
        {payPenaltyError && <p className="text-sm text-red-500 mb-6">{payPenaltyError}</p>}
        <TendingsTable
          tendings={tendings}
          isOverdue={isOverdue}
          onReturn={handleReturn}
          returningId={returningId}
          onRenew={handleRenew}
          renewingId={renewingId}
        />
        <div className="mt-8">
          <PenaltysSection />
        </div>
      </div>
    );
  }

  const allRows = buildGardenerRows(facultyList, studentList, tendings, isOverdue);
  const directoryUserIds = new Set(allRows.map((row) => row.userId).filter(Boolean));
  const unresolvedTendings = tendings.filter((tending) => !directoryUserIds.has(tending.userId));

  const visibleRows = allRows.filter((row) => {
    const matchesRole = roleFilter === 'all' || row.role === roleFilter;
    const matchesSearch = row.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOverdue = !showOverdueOnly || row.overdue > 0;
    return matchesRole && matchesSearch && matchesOverdue;
  });

  const activeTendingCount = tendings.filter((tending) => !tending.returnedAt).length;
  const overdueCount = tendings.filter(isOverdue).length;
  const totalGardeners = facultyList.length + studentList.length;

  return (
    <div>
      {error && <p className="text-sm text-primary mb-6">{error}</p>}
      {returnError && <p className="text-sm text-primary mb-6">{returnError}</p>}
      {payPenaltyError && <p className="text-sm text-red-500 mb-6">{payPenaltyError}</p>}
      {waivePenaltyError && <p className="text-sm text-red-500 mb-6">{waivePenaltyError}</p>}

      {/* Admin quick-action buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          type="button"
          onClick={() => { setShowIssueModal(true); setIssueError(""); setIssueSuccess(""); }}
          className="btn-primary"
        >
          <span className="text-lg leading-none">+</span> Issue Tending
        </button>
        <button
          type="button"
          onClick={() => window.location.href = "/staff/new"}
          className="btn-outline"
        >
          <span className="text-lg leading-none">+</span> Add New Specimen
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Active Tendings" value={activeTendingCount} />
        <StatCard
          label="Overdue Items"
          value={overdueCount}
          danger={overdueCount > 0}
          onClick={() => setShowOverdueOnly((prev) => !prev)}
          active={showOverdueOnly}
        />
        <StatCard label="Unpaid Penaltys" value={`₹${totalPenaltysOwed}`} danger={totalPenaltysOwed > 0} />
        <StatCard label="Total Gardeners" value={totalGardeners} />
      </div>

      <GardenerSearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
      />

      {visibleRows.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center text-foreground/60">
          <SpecimenOpen size={32} className="mx-auto mb-3 text-foreground/20" />
          No gardeners match this search.
        </div>
      ) : (
        <GardenersTable rows={visibleRows} onSelect={setSelectedGardener} />
      )}

      {unresolvedTendings.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-1">Unresolved Tendings</h3>
          <p className="text-sm text-foreground/50 mb-3">
            These tendings reference a user not found in the current directory.
          </p>
          <TendingsTable
            tendings={unresolvedTendings}
            isOverdue={isOverdue}
            onReturn={handleReturn}
            returningId={returningId}
            onWaivePenalty={handleWaivePenalty}
            waivingPenaltyForTendingId={waivingPenaltyForTendingId}
            checkedOutLabel="Checked out"
            emptyNoun="orphaned tendings"
          />
        </div>
      )}

      {/* Issue Tending Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4">Issue Tending</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Specimen</label>
                {issueSpecimen ? (
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-border bg-background text-sm">
                    <span className="truncate">{issueSpecimen.title} — {issueSpecimen.author}</span>
                    <button type="button" onClick={() => setIssueSpecimen(null)} className="text-xs text-foreground/50 hover:text-foreground ml-2">Change</button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={specimenQuery}
                      onChange={(e) => setSpecimenQuery(e.target.value)}
                      placeholder="Search title or author…"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    {specimenResults.length > 0 && (
                      <div className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-border bg-background">
                        {specimenResults.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => { setIssueSpecimen(b); setSpecimenQuery(''); }}
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
                <label className="block text-sm font-medium mb-1.5">Gardener</label>
                <select
                  value={issueUserId}
                  onChange={(e) => setIssueUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select a gardener…</option>
                  {[...facultyList, ...studentList].map((m) => (
                    <option key={m.id || m.userId} value={m.id || m.userId}>
                      {m.name || m.displayName || m.email} ({m.role || "gardener"})
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
                disabled={issuing || !issueSpecimen || !issueUserId}
                onClick={async () => {
                  setIssuing(true);
                  setIssueError("");
                  setIssueSuccess("");
                  try {
                    await issueTending({ specimenId: issueSpecimen.id, userId: Number(issueUserId) });
                    setIssueSuccess("Tending issued successfully");
                    setIssueSpecimen(null);
                    setSpecimenQuery("");
                    setIssueUserId("");
                    setTimeout(() => setShowIssueModal(false), 1200);
                  } catch (err) {
                    setIssueError(err.response?.data?.message || "Failed to issue tending");
                  } finally {
                    setIssuing(false);
                  }
                }}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {issuing ? "Issuing…" : "Issue Tending"}
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

      <GardenerDrawer gardener={selectedGardener} renderTending={renderTendingItem} onClose={() => setSelectedGardener(null)} />
    </div>
  );
};

export default TendingsSection;
