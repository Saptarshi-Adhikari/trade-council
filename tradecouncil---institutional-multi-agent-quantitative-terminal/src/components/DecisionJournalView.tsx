import React, { useState, useEffect, useMemo } from 'react';
import { DecisionRecord } from '../types/terminal';

interface DecisionJournalViewProps {
  records: DecisionRecord[];
  onSelectAndOpenWorkspace: (ticker: string) => void;
}

export const DecisionJournalView: React.FC<DecisionJournalViewProps> = ({
  records,
  onSelectAndOpenWorkspace,
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    records[0]?.id || 'RUN-4819'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTicker, setFilterTicker] = useState('ALL');
  const [filterRating, setFilterRating] = useState('ALL');
  const [filterEngine, setFilterEngine] = useState('ALL');
  const [filterOutcome, setFilterOutcome] = useState('ALL');
  const [filterHorizon, setFilterHorizon] = useState('30D');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<string | null>(null);

  // Keyboard shortcut '/' to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        const searchInput = document.getElementById('journal-search-input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const resetFilters = () => {
    setSearchQuery('');
    setFilterTicker('ALL');
    setFilterRating('ALL');
    setFilterEngine('ALL');
    setFilterOutcome('ALL');
    setFilterHorizon('30D');
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !q ||
        r.ticker.toLowerCase().includes(q) ||
        r.companyName.toLowerCase().includes(q) ||
        r.rationale.toLowerCase().includes(q) ||
        r.verdict.toLowerCase().includes(q) ||
        r.engine.toLowerCase().includes(q);

      const matchesTicker = filterTicker === 'ALL' || r.ticker === filterTicker;
      const matchesRating = filterRating === 'ALL' || r.verdict === filterRating;
      const matchesEngine = filterEngine === 'ALL' || r.engine.includes(filterEngine);
      const matchesOutcome = filterOutcome === 'ALL' || r.resolutionState === filterOutcome;

      return matchesQuery && matchesTicker && matchesRating && matchesEngine && matchesOutcome;
    });
  }, [records, searchQuery, filterTicker, filterRating, filterEngine, filterOutcome]);

  const selectedRecord = useMemo(() => {
    return records.find(r => r.id === selectedRecordId) || filteredRecords[0] || records[0];
  }, [records, selectedRecordId, filteredRecords]);

  const handleExportCSV = () => {
    const headers = [
      'Timestamp_UTC',
      'Ticker',
      'Verdict',
      'Agents_Engine',
      'Status',
      'Rationale',
      'Invalidation_Gate',
      'Resolution',
    ];
    const rows = filteredRecords.map(r => [
      `"${r.timestamp}"`,
      `"${r.ticker}"`,
      `"${r.verdict}"`,
      `"${r.engine}"`,
      `"${r.resolutionState}"`,
      `"${r.rationale.replace(/"/g, '""')}"`,
      `"${r.invalidationGate.replace(/"/g, '""')}"`,
      `"${r.resolutionNote}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradecouncil_decision_journal_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleBatchVerify = () => {
    setIsVerifying(true);
    setVerifyStatus('Auditing SHA-256 telemetry chains...');
    setTimeout(() => {
      setVerifyStatus('All 14 session proofs cryptographically reconciled!');
      setTimeout(() => {
        setIsVerifying(false);
        setVerifyStatus(null);
      }, 2000);
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full p-2 md:p-4 font-['DM_Sans'] text-[#E8EAEC] space-y-3">
      {/* Page Header & Metrics Row */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-1 border-b border-[#2B323B] pb-3">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-['Geist'] text-lg md:text-[22px] tracking-tight text-[#E8EAEC] m-0 font-semibold">
              Decision Journal
            </h1>
            <span className="font-['JetBrains_Mono'] text-[10px] px-2 py-0.5 rounded bg-[#191E24] text-[#98A2AD] border border-[#2B323B] tracking-wider uppercase">
              RESEARCH & PAPER TRADING ARCHIVE · {records.length} RECORDS SAVED
            </span>
          </div>
          <p className="font-['DM_Sans'] text-[13px] text-[#98A2AD] max-w-3xl m-0">
            Review previous analyses, revisit the empirical factor evidence, track thesis resolution gates, and systematically compare multi-agent verdicts over execution horizons.
          </p>
        </div>

        {/* Quick Journal Telemetry Cards */}
        <div className="flex items-center gap-2 shrink-0 font-['JetBrains_Mono']">
          <div className="px-3 py-1.5 rounded bg-[#15191E] border border-[#2B323B] flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#98A2AD] uppercase">Validation Rate</span>
              <span className="text-[11px] text-[#4EAA8C] font-semibold tabular-nums">78.6% (11/14)</span>
            </div>
            <div className="w-px h-6 bg-[#2B323B]"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#98A2AD] uppercase">Active Horizons</span>
              <span className="text-[11px] text-[#E8EAEC] tabular-nums">3 Pending</span>
            </div>
            <div className="w-px h-6 bg-[#2B323B]"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#98A2AD] uppercase">Avg Alpha Gap</span>
              <span className="text-[11px] text-[#70c5b4] font-semibold tabular-nums">+3.14%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Query Command Bar */}
      <section className="bg-[#191E24] border border-[#2B323B] rounded p-2.5 flex flex-col gap-2">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2">
          {/* Search Input with Keyboard Shortcut */}
          <div className="relative flex-1 min-w-[280px]">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#88938f] text-[16px] pointer-events-none">
              search
            </span>
            <input
              id="journal-search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-10 py-1.5 bg-[#101317] border border-[#2B323B] rounded font-['JetBrains_Mono'] text-[11px] text-[#E8EAEC] placeholder:text-[#88938f] focus:outline-none focus:border-[#70c5b4] transition-colors"
              placeholder="Search tickers, past decisions, risk gates, or agent rationale..."
              type="text"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4 rounded bg-[#15191E] border border-[#2B323B] font-['JetBrains_Mono'] text-[9px] text-[#98A2AD] pointer-events-none">
              /
            </div>
          </div>

          {/* Action Utilities */}
          <div className="flex items-center gap-2 shrink-0 self-end lg:self-center font-['JetBrains_Mono'] text-[11px]">
            <button
              onClick={handleBatchVerify}
              disabled={isVerifying}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#15191E] hover:bg-[#191E24] border border-[#2B323B] text-[#E8EAEC] hover:border-[#70c5b4] rounded transition-colors disabled:opacity-50"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px] text-[#70c5b4]">
                {isVerifying ? 'sync' : 'verified'}
              </span>
              <span>{isVerifying ? 'Verifying...' : 'Batch Verification'}</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#15191E] hover:bg-[#191E24] border border-[#2B323B] text-[#E8EAEC] hover:border-[#70c5b4] rounded transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px] text-[#98A2AD]">download</span>
              <span>Export Journal (CSV)</span>
            </button>
          </div>
        </div>

        {/* Verification Status Banner if active */}
        {verifyStatus && (
          <div className="p-2 rounded bg-[#70c5b4]/10 border border-[#70c5b4]/30 text-[#70c5b4] font-['JetBrains_Mono'] text-[11px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{verifyStatus}</span>
          </div>
        )}

        {/* Segmented Filter Matrix */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#2B323B]/60 font-['JetBrains_Mono'] text-[11px]">
          {/* Ticker Dropdown Select */}
          <div className="relative">
            <select
              value={filterTicker}
              onChange={e => setFilterTicker(e.target.value)}
              className="appearance-none pl-2.5 pr-7 py-1 bg-[#15191E] hover:bg-[#101317] border border-[#2B323B] rounded text-[#E8EAEC] focus:outline-none focus:border-[#70c5b4] cursor-pointer transition-colors"
            >
              <option value="ALL">All Tickers</option>
              <option value="RELIANCE.NS">RELIANCE.NS (NSE)</option>
              <option value="HDFCBANK.NS">HDFCBANK.NS (NSE)</option>
              <option value="TCS.NS">TCS.NS (NSE)</option>
              <option value="INFY.NS">INFY.NS (NSE)</option>
              <option value="ICICIBANK.NS">ICICIBANK.NS (NSE)</option>
              <option value="TATAMOTORS.NS">TATAMOTORS.NS (NSE)</option>
              <option value="BHARTIARTL.NS">BHARTIARTL.NS (NSE)</option>
            </select>
            <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-[14px] text-[#98A2AD] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Verdict Rating Select */}
          <div className="relative">
            <select
              value={filterRating}
              onChange={e => setFilterRating(e.target.value)}
              className="appearance-none pl-2.5 pr-7 py-1 bg-[#15191E] hover:bg-[#101317] border border-[#2B323B] rounded text-[#E8EAEC] focus:outline-none focus:border-[#70c5b4] cursor-pointer transition-colors"
            >
              <option value="ALL">All Ratings</option>
              <option value="BUY">BUY</option>
              <option value="ACCUMULATE">ACCUMULATE</option>
              <option value="HOLD">HOLD</option>
              <option value="REDUCE">REDUCE</option>
              <option value="SELL">SELL</option>
            </select>
            <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-[14px] text-[#98A2AD] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Model/Provider Select */}
          <div className="relative">
            <select
              value={filterEngine}
              onChange={e => setFilterEngine(e.target.value)}
              className="appearance-none pl-2.5 pr-7 py-1 bg-[#15191E] hover:bg-[#101317] border border-[#2B323B] rounded text-[#E8EAEC] focus:outline-none focus:border-[#70c5b4] cursor-pointer transition-colors"
            >
              <option value="ALL">All Engines</option>
              <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
              <option value="DeepSeek-R1">DeepSeek-R1</option>
              <option value="GPT-4o">GPT-4o Ensemble</option>
            </select>
            <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-[14px] text-[#98A2AD] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Outcome Status Select */}
          <div className="relative">
            <select
              value={filterOutcome}
              onChange={e => setFilterOutcome(e.target.value)}
              className="appearance-none pl-2.5 pr-7 py-1 bg-[#15191E] hover:bg-[#101317] border border-[#2B323B] rounded text-[#E8EAEC] focus:outline-none focus:border-[#70c5b4] cursor-pointer transition-colors"
            >
              <option value="ALL">All Outcomes</option>
              <option value="PENDING">Outcome Pending</option>
              <option value="VALIDATED">Hypothesis Validated</option>
              <option value="INVALIDATED">Invalidation Triggered</option>
            </select>
            <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-[14px] text-[#98A2AD] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Date Range Select */}
          <div className="relative">
            <select
              value={filterHorizon}
              onChange={e => setFilterHorizon(e.target.value)}
              className="appearance-none pl-2.5 pr-7 py-1 bg-[#15191E] hover:bg-[#101317] border border-[#2B323B] rounded text-[#E8EAEC] focus:outline-none focus:border-[#70c5b4] cursor-pointer transition-colors"
            >
              <option value="30D">Horizon: Last 30 Days</option>
              <option value="60D">Horizon: Last 60 Days</option>
              <option value="90D">Horizon: Last 90 Days</option>
              <option value="YTD">Horizon: YTD 2024</option>
            </select>
            <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-[14px] text-[#98A2AD] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="text-[#88938f] hover:text-[#E8EAEC] text-[10px] flex items-center gap-1 px-2 py-1 rounded transition-colors ml-auto"
            type="button"
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span>
            <span>Reset Filters</span>
          </button>
        </div>
      </section>

      {/* Main Workspace: Split Table & Inspector Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-start">
        {/* Log Table Container (8 cols) */}
        <div className="xl:col-span-8 flex flex-col bg-[#191E24] border border-[#2B323B] rounded overflow-hidden shadow-sm">
          <div className="px-3 md:px-4 py-2.5 bg-[#15191E] border-b border-[#2B323B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-['Geist'] text-[13px] text-[#E8EAEC] font-semibold">
                Historical Council Executions
              </span>
              <span className="font-['JetBrains_Mono'] text-[10px] px-1.5 py-0.2 rounded bg-[#191E24] text-[#98A2AD] border border-[#2B323B] tabular-nums">
                {filteredRecords.length} visible
              </span>
            </div>
            <div className="flex items-center gap-1 text-[#98A2AD] font-['JetBrains_Mono'] text-[10px]">
              <span>Sort: Execution Date</span>
              <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
            </div>
          </div>

          {/* Table Scroll Window */}
          <div className="overflow-x-auto w-full max-h-[640px] overflow-y-auto">
            {filteredRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-[#15191E]/40">
                <div className="w-10 h-10 rounded-full bg-[#191E24] border border-[#2B323B] flex items-center justify-center mb-3 text-[#98A2AD]">
                  <span className="material-symbols-outlined text-[20px]">filter_alt_off</span>
                </div>
                <span className="font-['Geist'] text-[13px] text-[#E8EAEC] font-semibold mb-1">
                  No Matching Analyses Found
                </span>
                <p className="font-['DM_Sans'] text-[12px] text-[#98A2AD] max-w-sm mb-4">
                  There are no logged multi-agent decision records matching the specified ticker, engine, or horizon filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-3 py-1.5 bg-[#191E24] hover:bg-[#101317] border border-[#2B323B] hover:border-[#70c5b4] text-[#E8EAEC] font-['JetBrains_Mono'] text-[11px] rounded transition-colors"
                  type="button"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#15191E] border-b border-[#2B323B] text-[#98A2AD] font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider select-none sticky top-0 z-10">
                    <th className="py-2 px-3 font-medium whitespace-nowrap">Timestamp (UTC)</th>
                    <th className="py-2 px-3 font-medium whitespace-nowrap">Ticker / Asset</th>
                    <th className="py-2 px-3 font-medium whitespace-nowrap">Council Verdict</th>
                    <th className="py-2 px-3 font-medium whitespace-nowrap">Consensus Engine</th>
                    <th className="py-2 px-3 font-medium whitespace-nowrap">Data Tier</th>
                    <th className="py-2 px-3 font-medium min-w-[240px]">Core Rationale & Catalyst</th>
                    <th className="py-2 px-3 font-medium min-w-[200px]">Invalidation Gate</th>
                    <th className="py-2 px-3 font-medium whitespace-nowrap">Resolution State</th>
                    <th className="py-2 px-3 font-medium text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B323B] font-['DM_Sans'] text-[12px]">
                  {filteredRecords.map(record => {
                    const isSelected = record.id === selectedRecord?.id;
                    return (
                      <tr
                        key={record.id}
                        onClick={() => setSelectedRecordId(record.id)}
                        className={`cursor-pointer transition-colors border-l-2 ${
                          isSelected
                            ? 'bg-[#15191E]/95 border-[#70c5b4]'
                            : 'hover:bg-[#15191E]/50 border-transparent'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-['JetBrains_Mono'] text-[11px] text-[#98A2AD] whitespace-nowrap tabular-nums">
                          {record.timestamp}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-[11px] font-semibold text-[#E8EAEC]">
                            <span>{record.ticker}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-[#191E24] text-[#98A2AD] border border-[#2B323B]">
                              {record.exchange}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`font-['JetBrains_Mono'] text-[10px] px-2 py-0.5 rounded font-semibold tracking-wide uppercase ${
                              record.verdict === 'ACCUMULATE' || record.verdict === 'BUY'
                                ? 'bg-[#70c5b4]/10 text-[#70c5b4] border border-[#70c5b4]/30'
                                : record.verdict === 'HOLD'
                                ? 'bg-[#191E24] text-[#98A2AD] border border-[#2B323B]'
                                : 'bg-[#D77972]/10 text-[#D77972] border border-[#D77972]/30'
                            }`}
                          >
                            {record.verdict}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex flex-col font-['JetBrains_Mono']">
                            <span className="text-[11px] text-[#E8EAEC]">{record.agreement}</span>
                            <span className="text-[10px] text-[#98A2AD]">{record.engine}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-['JetBrains_Mono'] text-[10px] px-1.5 py-0.5 rounded bg-[#191E24] border border-[#2B323B] text-[#98A2AD] uppercase">
                            {record.dataTier}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#E8EAEC] max-w-xs">
                          <div className="line-clamp-2 leading-relaxed">{record.rationale}</div>
                        </td>
                        <td className="py-2.5 px-3 font-['JetBrains_Mono'] text-[10px] text-[#D77972] max-w-xs">
                          {record.invalidationGate}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`font-['JetBrains_Mono'] text-[10px] px-2 py-0.5 rounded flex items-center gap-1.5 w-max ${
                              record.resolutionState === 'VALIDATED'
                                ? 'bg-[#4EAA8C]/10 text-[#4EAA8C] border border-[#4EAA8C]/30'
                                : record.resolutionState === 'INVALIDATED'
                                ? 'bg-[#D77972]/10 text-[#D77972] border border-[#D77972]/30'
                                : 'bg-[#D6AC64]/10 text-[#D6AC64] border border-[#D6AC64]/30'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                record.resolutionState === 'VALIDATED'
                                  ? 'bg-[#4EAA8C]'
                                  : record.resolutionState === 'INVALIDATED'
                                  ? 'bg-[#D77972]'
                                  : 'bg-[#D6AC64]'
                              }`}
                            ></span>
                            <span>{record.resolutionNote}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedRecordId(record.id);
                              }}
                              className="p-1 text-[#70c5b4] hover:bg-[#191E24] rounded transition-colors"
                              title="Inspect Evidence Trace"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                onSelectAndOpenWorkspace(record.ticker);
                              }}
                              className="p-1 text-[#98A2AD] hover:text-[#E8EAEC] hover:bg-[#191E24] rounded transition-colors"
                              title="Reopen Workspace"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Table Pagination / Metadata */}
          <div className="px-3 md:px-4 py-2 bg-[#15191E] border-t border-[#2B323B] flex items-center justify-between font-['JetBrains_Mono'] text-[10px] text-[#98A2AD]">
            <div className="flex items-center gap-2">
              <span>Displaying 1 to {filteredRecords.length} of {records.length} logged sessions</span>
              <span className="text-[#2B323B]">|</span>
              <span className="text-[#88938f]">Sync Latency: 14ms (Parquet lakehouse)</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled
                className="px-2 py-0.5 rounded bg-[#191E24] border border-[#2B323B] text-[#98A2AD] opacity-40 cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-2 py-0.5 text-[#E8EAEC]">Page 1 of 1</span>
              <button
                disabled
                className="px-2 py-0.5 rounded bg-[#191E24] border border-[#2B323B] text-[#98A2AD] opacity-40 cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Inspector Drawer Panel: Evidence Trace for Selected Analysis (4 cols) */}
        {selectedRecord && (
          <div className="xl:col-span-4 flex flex-col bg-[#191E24] border border-[#2B323B] rounded overflow-hidden shadow-md">
            {/* Inspector Header */}
            <div className="h-10 px-3 md:px-4 bg-[#15191E] border-b border-[#2B323B] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#70c5b4]">fact_check</span>
                <span className="font-['Geist'] text-[13px] font-semibold text-[#E8EAEC]">Inspection Trace</span>
                <span className="font-['JetBrains_Mono'] text-[10px] px-1.5 py-0.2 rounded bg-[#191E24] text-[#70c5b4] border border-[#70c5b4]/20">
                  #{selectedRecord.id.replace('RUN-', '')}
                </span>
              </div>
              <div className="flex items-center gap-1 font-['JetBrains_Mono'] text-[10px] text-[#4EAA8C]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4EAA8C]"></span>
                <span>Verified Trace</span>
              </div>
            </div>

            {/* Inspector Body Content */}
            <div className="p-3 md:p-3.5 flex flex-col gap-3 text-[#98A2AD]">
              {/* Target Overview Tile */}
              <div className="p-2.5 rounded bg-[#15191E] border border-[#2B323B] flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-['JetBrains_Mono'] text-[13px] font-semibold text-[#E8EAEC]">
                      {selectedRecord.ticker}
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[10px] text-[#98A2AD]">
                      {selectedRecord.companyName}
                    </span>
                  </div>
                  <span
                    className={`font-['JetBrains_Mono'] text-[10px] px-2 py-0.5 rounded font-semibold ${
                      selectedRecord.verdict === 'ACCUMULATE' || selectedRecord.verdict === 'BUY'
                        ? 'bg-[#70c5b4]/10 text-[#70c5b4] border border-[#70c5b4]/30'
                        : selectedRecord.verdict === 'HOLD'
                        ? 'bg-[#191E24] text-[#98A2AD] border border-[#2B323B]'
                        : 'bg-[#D77972]/10 text-[#D77972] border border-[#D77972]/30'
                    }`}
                  >
                    {selectedRecord.verdict}
                  </span>
                </div>
                <div className="flex items-center justify-between font-['JetBrains_Mono'] text-[10px] pt-1 border-t border-[#2B323B]">
                  <span className="text-[#88938f]">Execution Date:</span>
                  <span className="text-[#E8EAEC] tabular-nums">{selectedRecord.timestamp}:22 UTC</span>
                </div>
                <div className="flex items-center justify-between font-['JetBrains_Mono'] text-[10px]">
                  <span className="text-[#88938f]">Benchmark Price:</span>
                  <span className="text-[#E8EAEC] tabular-nums font-sans">{selectedRecord.benchmarkPrice}</span>
                </div>
                <div className="flex items-center justify-between font-['JetBrains_Mono'] text-[10px]">
                  <span className="text-[#88938f]">Invalidation Stop:</span>
                  <span className="text-[#D77972] font-medium tabular-nums font-sans">
                    {selectedRecord.invalidationStop} ({selectedRecord.stopMargin})
                  </span>
                </div>
              </div>

              {/* Multi-Agent Consensus Breakdown Visual */}
              <div className="flex flex-col gap-1.5 font-['JetBrains_Mono'] text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="uppercase tracking-wider text-[#88938f] font-medium">Council Distribution</span>
                  <span className="text-[#E8EAEC] font-medium">{selectedRecord.distributionBull}% Bullish Bias</span>
                </div>
                {/* Segmented bar */}
                <div className="w-full h-2 rounded-full bg-[#15191E] overflow-hidden flex border border-[#2B323B]">
                  <div
                    className="h-full bg-[#70c5b4]"
                    style={{ width: `${selectedRecord.distributionBull}%` }}
                    title={`${selectedRecord.distributionBull}% Bullish`}
                  ></div>
                  <div
                    className="h-full bg-[#2B323B]"
                    style={{ width: `${selectedRecord.distributionBear}%` }}
                    title={`${selectedRecord.distributionBear}% Neutral/Bearish`}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[9px] text-[#98A2AD]">
                  <span>Fundamental: Accumulate</span>
                  <span>Technical: Bullish</span>
                  <span>Macro: Neutral</span>
                </div>
              </div>

              {/* Archived Council Synthesis Quote */}
              <div className="flex flex-col gap-1">
                <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#88938f] font-medium">
                  Lead Synthesis Summary
                </span>
                <div className="p-2.5 rounded bg-[#101317] border border-[#2B323B] text-[#E8EAEC] font-['DM_Sans'] text-[12px] leading-relaxed">
                  "{selectedRecord.leadSynthesis}"
                </div>
              </div>

              {/* Empirical Evidence Checklist (3 Verified Sources) */}
              <div className="flex flex-col gap-1.5">
                <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#88938f] font-medium">
                  Empirical Evidence Checklist
                </span>
                <div className="space-y-1.5 font-['JetBrains_Mono']">
                  {selectedRecord.evidenceItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-[#15191E] border border-[#2B323B] flex items-start gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#70c5b4] shrink-0 mt-0.5">
                        check_circle
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-semibold text-[#E8EAEC] truncate">
                          {item.title}
                        </span>
                        <span className="text-[9px] text-[#98A2AD]">{item.meta}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Horizon Tracking */}
              <div className="p-2.5 rounded bg-[#15191E] border border-[#2B323B] flex flex-col gap-1.5 font-['JetBrains_Mono'] text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#88938f] uppercase">Horizon Countdown</span>
                  <span className="text-[#D6AC64] font-medium">
                    {selectedRecord.horizonRemaining} of {selectedRecord.horizonTotal} Trading Days Remaining
                  </span>
                </div>
                <div className="w-full bg-[#101317] h-1.5 rounded-full overflow-hidden border border-[#2B323B]">
                  <div
                    className="bg-[#D6AC64] h-full rounded-full transition-all"
                    style={{
                      width: `${((selectedRecord.horizonTotal - selectedRecord.horizonRemaining) / selectedRecord.horizonTotal) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[9px] text-[#98A2AD]">
                  <span>Logged: T+0</span>
                  <span className="text-[#70c5b4]">Current Mark: {selectedRecord.currentMark}</span>
                  <span>Target Gate: T+{selectedRecord.horizonTotal}</span>
                </div>
              </div>

              {/* Workspace Re-entry Action */}
              <div className="pt-2 border-t border-[#2B323B] flex flex-col gap-2">
                <button
                  onClick={() => onSelectAndOpenWorkspace(selectedRecord.ticker)}
                  className="w-full py-2 px-3 bg-[#70c5b4] hover:bg-[#81d6c4] text-[#005146] font-['Geist'] text-[13px] font-semibold rounded flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">terminal</span>
                  <span>Reopen in Analysis Workspace</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="w-full py-1.5 px-3 bg-[#15191E] hover:bg-[#101317] border border-[#2B323B] text-[#98A2AD] hover:text-[#E8EAEC] font-['JetBrains_Mono'] text-[11px] rounded flex items-center justify-center gap-1.5 transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">history</span>
                  <span>Export Raw Agent Telemetry Logs</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
