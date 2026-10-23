/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ViewType, DecisionRecord, AssetAnalysisData } from './types/terminal';
import {
  INITIAL_DECISION_RECORDS,
  getAnalysisDataForTicker,
} from './data/mockData';
import { Navigation } from './components/Navigation';
import { OverviewView } from './components/OverviewView';
import { AnalyzeView } from './components/AnalyzeView';
import { DecisionJournalView } from './components/DecisionJournalView';
import { NewAnalysisModal } from './components/NewAnalysisModal';
import { AuditTranscriptsModal } from './components/AuditTranscriptsModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [selectedTicker, setSelectedTicker] = useState<string>('RELIANCE.NS');
  const [decisionRecords, setDecisionRecords] = useState<DecisionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('tradecouncil_journal_records');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_DECISION_RECORDS;
  });

  const [savedJournalRuns, setSavedJournalRuns] = useState<Set<string>>(
    () => new Set(['TC-4819-A7F'])
  );

  const [isNewAnalysisOpen, setIsNewAnalysisOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Sync decision records to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tradecouncil_journal_records', JSON.stringify(decisionRecords));
    } catch {
      // ignore
    }
  }, [decisionRecords]);

  // Global ⌘K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [liveAnalysisMap, setLiveAnalysisMap] = useState<Record<string, AssetAnalysisData>>({});

  const activeAnalysisData = React.useMemo(() => {
    if (liveAnalysisMap[selectedTicker]) {
      return liveAnalysisMap[selectedTicker];
    }
    return getAnalysisDataForTicker(selectedTicker);
  }, [selectedTicker, liveAnalysisMap]);

  const handleSelectTicker = (ticker: string) => {
    setSelectedTicker(ticker);
  };

  const handleOpenAnalysisWorkspace = (ticker?: string) => {
    if (ticker) {
      setSelectedTicker(ticker);
    }
    setCurrentView('analyze');
  };

  const handleSaveToJournal = (data: AssetAnalysisData) => {
    setSavedJournalRuns(prev => new Set(prev).add(data.runId));

    const alreadyExists = decisionRecords.some(r => r.id === `RUN-${data.runId.replace(/[^\d]/g, '')}` || r.ticker === data.ticker);
    if (!alreadyExists) {
      const newRecord: DecisionRecord = {
        id: `RUN-${Math.floor(4800 + Math.random() * 90)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        ticker: data.ticker,
        companyName: data.name,
        exchange: data.exchange,
        verdict: data.verdict.stance.includes('BUY') ? 'BUY' : data.verdict.stance.includes('ACCUMULATE') ? 'ACCUMULATE' : data.verdict.stance.includes('HOLD') ? 'HOLD' : 'REDUCE',
        agreement: data.verdict.agreement.replace('Agreement: ', ''),
        engine: 'Gemma 4 (Ollama)',
        dataTier: data.dataTier,
        rationale: data.verdict.synthesis,
        invalidationGate: data.verdict.invalidationTrigger,
        resolutionState: 'PENDING',
        resolutionNote: 'Pending (T+30d)',
        benchmarkPrice: `${data.lastPrice} INR`,
        invalidationStop: data.verdict.parameters.stopLoss,
        stopMargin: '-1.85%',
        distributionBull: data.verdict.confidencePercent,
        distributionBear: 100 - data.verdict.confidencePercent,
        leadSynthesis: data.verdict.synthesis,
        evidenceItems: [
          { title: `${data.exchange} Daily Tick & VWAP Tape`, meta: `0 misalignments · Benchmark ₹${data.lastPrice}` },
          { title: 'Audited Telephony / Energy Segment Disclosures', meta: 'Form verified by Multi-Agent Council' },
          { title: 'Crude Brent / Sector Beta Spread Parity', meta: 'Risk parameters locked' },
        ],
        horizonTotal: 30,
        horizonRemaining: 30,
        currentMark: '0.00%',
      };

      setDecisionRecords(prev => [newRecord, ...prev]);
    }
  };

  // Poll live market snapshot in-place for active ticker so charts and prices update without reload
  useEffect(() => {
    let isMounted = true;
    const updateActiveTickerMarket = async () => {
      try {
        const { fetchMarketSnapshot } = await import('./utils/apiClient');
        const snap = await fetchMarketSnapshot(selectedTicker);
        if (snap && snap.lastPrice !== 'N/A' && isMounted) {
          setLiveAnalysisMap(prev => {
            const current = prev[selectedTicker] || getAnalysisDataForTicker(selectedTicker);
            return {
              ...prev,
              [selectedTicker]: {
                ...current,
                lastPrice: snap.lastPrice,
                dayChange: snap.dayChange,
                isDayPositive: snap.isPositive,
                dayHigh: snap.dayHigh !== 'N/A' ? snap.dayHigh : current.dayHigh,
                dayLow: snap.dayLow !== 'N/A' ? snap.dayLow : current.dayLow,
                volume: snap.volume !== 'N/A' ? snap.volume : current.volume,
                avgVolume20D: snap.avgVolume20D !== 'N/A' ? snap.avgVolume20D : current.avgVolume20D,
                indicators: {
                  ...current.indicators,
                  ...snap.indicators,
                },
                candles: snap.candles && snap.candles.length > 0 ? snap.candles : current.candles,
                cachedTime: snap.observationTime ? new Date(snap.observationTime).toLocaleTimeString() : current.cachedTime,
                dataTier: `VERIFIED LIVE MARKET · ${snap.status.toUpperCase()}`,
              },
            };
          });
        }
      } catch {
        // quiet fallback
      }
    };

    updateActiveTickerMarket();
    const timer = setInterval(updateActiveTickerMarket, 12000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [selectedTicker]);

  const handleStartNewAnalysis = (ticker: string, _timeframe?: string, liveResult?: AssetAnalysisData) => {
    setSelectedTicker(ticker);
    if (liveResult) {
      setLiveAnalysisMap(prev => ({ ...prev, [ticker]: liveResult }));
    }
    setCurrentView('analyze');
  };

  return (
    <div className="bg-[#101317] text-[#E8EAEC] antialiased min-h-screen flex flex-col selection:bg-[#70c5b4] selection:text-[#005146]">
      {/* Navigation Bars (Desktop Sidebar, Desktop Top Header, Mobile Header, Mobile Bottom Tab) */}
      <Navigation
        currentView={currentView}
        onSelectView={setCurrentView}
        selectedTicker={selectedTicker}
        onOpenNewAnalysis={() => setIsNewAnalysisOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
      />

      {/* Main Analytical Viewport */}
      <div className="md:pl-[220px] flex-1 flex flex-col">
        <main className="relative pt-14 pb-20 md:pb-6 w-full min-h-screen bg-[#101317]">
          {currentView === 'overview' && (
            <OverviewView
              onSelectTicker={handleSelectTicker}
              onOpenAnalysisWorkspace={handleOpenAnalysisWorkspace}
              onDispatchQuickRun={(ticker) => {
                setSelectedTicker(ticker);
                setCurrentView('analyze');
              }}
            />
          )}

          {currentView === 'analyze' && (
            <AnalyzeView
              data={activeAnalysisData}
              onSaveJournal={handleSaveToJournal}
              isSavedInJournal={savedJournalRuns.has(activeAnalysisData.runId)}
              onOpenAuditTranscripts={() => setIsAuditModalOpen(true)}
            />
          )}

          {currentView === 'decision-journal' && (
            <DecisionJournalView
              records={decisionRecords}
              onSelectAndOpenWorkspace={handleOpenAnalysisWorkspace}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <NewAnalysisModal
        isOpen={isNewAnalysisOpen}
        onClose={() => setIsNewAnalysisOpen(false)}
        onStartAnalysis={handleStartNewAnalysis}
      />

      <AuditTranscriptsModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        runId={activeAnalysisData.runId}
        ticker={activeAnalysisData.ticker}
      />

      <CommandPaletteModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectTicker={(ticker) => {
          setSelectedTicker(ticker);
          setCurrentView('analyze');
        }}
      />
    </div>
  );
}
