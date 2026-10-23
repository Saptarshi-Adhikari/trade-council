import React, { useState } from 'react';
import { TrackedEquity } from '../types/terminal';
import { TRACKED_EQUITIES } from '../data/mockData';

interface OverviewViewProps {
  onSelectTicker: (ticker: string) => void;
  onOpenAnalysisWorkspace: (ticker?: string) => void;
  onDispatchQuickRun: (ticker: string, agents: string[]) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onSelectTicker,
  onOpenAnalysisWorkspace,
  onDispatchQuickRun,
}) => {
  const [quickTicker, setQuickTicker] = useState('SBIN.NS');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([
    'Technical',
    'Fundamental',
    'Sentiment',
    'Risk Engine',
  ]);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const toggleAgent = (name: string) => {
    setSelectedAgents(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  const handleQuickDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTicker.trim()) return;
    setIsDispatching(true);

    setTimeout(() => {
      setIsDispatching(false);
      setDispatchSuccess(true);
      onDispatchQuickRun(quickTicker.toUpperCase(), selectedAgents);
      setTimeout(() => setDispatchSuccess(false), 2000);
    }, 900);
  };

  return (
    <div className="flex flex-col w-full text-[#E8EAEC] p-3 md:p-4 space-y-4">
      {/* Workspace Header Bar */}
      <header className="flex flex-col space-y-3 border-b border-[#2B323B] pb-3 md:pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-['Geist'] text-lg md:text-[22px] tracking-tight text-[#E8EAEC] font-semibold m-0">
                Terminal Overview
              </h1>
              <span className="font-['JetBrains_Mono'] text-[10px] px-2 py-0.5 rounded bg-[#191E24] border border-[#2B323B] text-[#70c5b4] uppercase font-medium tracking-wider">
                RESEARCH & SIMULATION WORKBENCH · MULTI-AGENT RUNTIME
              </span>
            </div>
            <p className="font-['DM_Sans'] text-[13px] text-[#98A2AD] max-w-4xl m-0">
              Real-time multi-agent orchestrator telemetry, tracked asset watchlist with latest council consensus, active paper validation performance, and quick dispatch.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto shrink-0 font-['JetBrains_Mono'] text-[10px]">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#191E24] border border-[#2B323B] text-[#98A2AD]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4EAA8C]"></span>
              <span>
                CYCLE: <span className="text-[#E8EAEC] tabular-nums font-mono">04m 12s</span>
              </span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#191E24] border border-[#2B323B] text-[#98A2AD]">
              <span className="text-[#88938f]">HEARTBEAT:</span>
              <span className="text-[#E8EAEC] uppercase font-medium">99.98% SYNC</span>
            </div>
          </div>
        </div>

        {/* Quick KPI Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 font-['JetBrains_Mono'] text-[11px]">
          <div className="bg-[#191E24] border border-[#2B323B] rounded p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#88938f] uppercase tracking-wider text-[10px]">
              <span>ACTIVE WORKSTATION SESSIONS</span>
              <span className="material-symbols-outlined text-[14px]">desktop_windows</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[16px] font-['Geist'] text-[#E8EAEC] font-semibold tabular-nums">
                3 Running
              </span>
              <span className="text-[#98A2AD] text-[10px]">· 14 Cached</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#4EAA8C]">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4EAA8C]"></span>
              <span>Zero throttle threshold</span>
            </div>
          </div>

          <div className="bg-[#191E24] border border-[#2B323B] rounded p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#88938f] uppercase tracking-wider text-[10px]">
              <span>CONSENSUS ACCURACY (30D)</span>
              <span className="material-symbols-outlined text-[14px]">query_stats</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[16px] font-['Geist'] text-[#4EAA8C] font-semibold tabular-nums">
                78.6%
              </span>
              <span className="text-[#98A2AD] text-[10px]">11/14 Resolved Gates</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-[#98A2AD]">
              <span>Alpha vs NIFTY: +4.8%</span>
              <span className="text-[#88938f]">Brier: 0.14</span>
            </div>
          </div>

          <div className="bg-[#191E24] border border-[#2B323B] rounded p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#88938f] uppercase tracking-wider text-[10px]">
              <span>MODEL ORCHESTRATION</span>
              <span className="material-symbols-outlined text-[14px]">hub</span>
            </div>
            <div className="mt-2">
              <span className="text-[16px] font-['Geist'] text-[#E8EAEC] font-semibold truncate block">
                Claude 3.5 Sonnet
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#98A2AD] truncate">
              <span className="text-[#70c5b4]">+ DeepSeek-R1</span>
              <span className="text-[#88938f]">(Hybrid Consensus)</span>
            </div>
          </div>

          <div className="bg-[#191E24] border border-[#2B323B] rounded p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#88938f] uppercase tracking-wider text-[10px]">
              <span>SYSTEM LATENCY & DATA PIPELINE</span>
              <span className="material-symbols-outlined text-[14px]">speed</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[16px] font-['Geist'] text-[#E8EAEC] font-semibold tabular-nums">
                14ms
              </span>
              <span className="text-[#98A2AD] text-[10px]">Lakehouse Feed</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#98A2AD] truncate">
              <span className="text-[#88938f]">Store:</span>
              <span>Parquet Lakehouse / NSE Historical</span>
            </div>
          </div>
        </div>
      </header>

      {/* Two-Column Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Primary Research Pipeline & Watchlist (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4 min-w-0">
          {/* Active Council Runs & Execution Queue */}
          <section className="bg-[#191E24] border border-[#2B323B] rounded overflow-hidden">
            <div className="h-10 px-3 md:px-4 border-b border-[#2B323B] flex items-center justify-between bg-[#15191E]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#88938f] text-[16px]">account_tree</span>
                <h2 className="font-['Geist'] text-[13px] text-[#E8EAEC] uppercase tracking-wider font-semibold m-0">
                  Active Council Runs & Live Queue
                </h2>
              </div>
              <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-[10px] text-[#98A2AD]">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#70c5b4] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#70c5b4]"></span>
                </span>
                <span>2 Executing · 1 Queued</span>
              </div>
            </div>

            <div className="divide-y divide-[#2B323B] font-['DM_Sans'] text-[12px]">
              {/* Active Run 1: RELIANCE.NS */}
              <div className="p-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#212b34]/40 transition-colors">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-[11px] flex-wrap">
                    <span className="text-[#E8EAEC] font-semibold">RELIANCE.NS</span>
                    <span className="px-1.5 py-0.2 rounded bg-[#131d25] border border-[#2B323B] text-[#88938f] text-[10px]">
                      NSE EQ
                    </span>
                    <span className="text-[10px] text-[#98A2AD]">Run #TC-4819</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#70c5b4]/10 text-[#70c5b4] border border-[#70c5b4]/25">
                      STAGE 6/7: RISK REVIEW
                    </span>
                  </div>
                  <p className="font-['DM_Sans'] text-[13px] text-[#98A2AD] truncate m-0">
                    Last Action:{' '}
                    <span className="font-['JetBrains_Mono'] text-[10px] text-[#E8EAEC]">
                      VaR 95% simulated limit: 3.50%
                    </span>{' '}
                    (Stress scenario passing volatility bounds)
                  </p>
                  <div className="w-full bg-[#131d25] h-1 rounded overflow-hidden max-w-md">
                    <div className="bg-[#70c5b4] h-full transition-all duration-500" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onSelectTicker('RELIANCE.NS');
                      onOpenAnalysisWorkspace('RELIANCE.NS');
                    }}
                    className="px-3 py-1.5 rounded bg-[#15191E] hover:bg-[#212b34] border border-[#2B323B] hover:border-[#70c5b4] text-[#E8EAEC] font-['JetBrains_Mono'] text-[10px] transition-colors flex items-center gap-1.5"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[14px] text-[#70c5b4]">visibility</span>
                    <span>Inspect Workspace</span>
                  </button>
                </div>
              </div>

              {/* Active Run 2: HDFCBANK.NS */}
              <div className="p-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#212b34]/40 transition-colors">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-[11px] flex-wrap">
                    <span className="text-[#E8EAEC] font-semibold">HDFCBANK.NS</span>
                    <span className="px-1.5 py-0.2 rounded bg-[#131d25] border border-[#2B323B] text-[#88938f] text-[10px]">
                      NSE EQ
                    </span>
                    <span className="text-[10px] text-[#98A2AD]">Run #TC-4818</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#D6AC64]/10 text-[#D6AC64] border border-[#D6AC64]/25">
                      COMPLETED · CONSENSUS: HOLD
                    </span>
                  </div>
                  <p className="font-['DM_Sans'] text-[13px] text-[#98A2AD] truncate m-0">
                    Council Consensus: <span className="text-[#E8EAEC] font-medium">HOLD (3/5 Agents)</span> · Target Invalidation:{' '}
                    <span className="font-mono text-[#E8EAEC]">₹1,680.00</span> · Divergence index:{' '}
                    <span className="font-mono">0.22</span>
                  </p>
                  <div className="w-full bg-[#131d25] h-1 rounded overflow-hidden max-w-md">
                    <div className="bg-[#4EAA8C] h-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onSelectTicker('HDFCBANK.NS');
                      onOpenAnalysisWorkspace('HDFCBANK.NS');
                    }}
                    className="px-3 py-1.5 rounded bg-[#15191E] hover:bg-[#212b34] border border-[#2B323B] hover:border-[#70c5b4] text-[#E8EAEC] font-['JetBrains_Mono'] text-[10px] transition-colors flex items-center gap-1.5"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[14px]">article</span>
                    <span>View Summary</span>
                  </button>
                </div>
              </div>

              {/* Active Run 3: INFY.NS */}
              <div className="p-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#212b34]/40 transition-colors">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-[11px] flex-wrap">
                    <span className="text-[#E8EAEC] font-semibold">INFY.NS</span>
                    <span className="px-1.5 py-0.2 rounded bg-[#131d25] border border-[#2B323B] text-[#88938f] text-[10px]">
                      NSE EQ
                    </span>
                    <span className="text-[10px] text-[#88938f]">Run #TC-4820</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#131d25] text-[#98A2AD] border border-[#2B323B]">
                      QUEUED (STAGE 0/7)
                    </span>
                  </div>
                  <p className="font-['DM_Sans'] text-[13px] text-[#98A2AD] truncate m-0">
                    Waiting on Data Feed Sync: 10-Yr Historical Adjusted Tick Data · Priority:{' '}
                    <span className="text-[#E8EAEC]">Standard</span>
                  </p>
                  <div className="w-full bg-[#131d25] h-1 rounded overflow-hidden max-w-md">
                    <div className="bg-[#88938f] h-full" style={{ width: '12%' }}></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-['JetBrains_Mono'] text-[10px] text-[#88938f]">
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                  <span>Buffering</span>
                </div>
              </div>
            </div>
          </section>

          {/* Tracked Equities & Council Consensus Matrix */}
          <section className="bg-[#191E24] border border-[#2B323B] rounded overflow-hidden">
            <div className="h-10 px-3 md:px-4 border-b border-[#2B323B] flex items-center justify-between bg-[#15191E]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#88938f] text-[16px]">table_chart</span>
                <h2 className="font-['Geist'] text-[13px] text-[#E8EAEC] uppercase tracking-wider font-semibold m-0">
                  Tracked Equities & Council Consensus Matrix
                </h2>
              </div>
              <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-[10px] text-[#98A2AD]">
                <span>{TRACKED_EQUITIES.length} Monitored Assets</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-['DM_Sans'] text-[12px]">
                <thead>
                  <tr className="h-8 border-b border-[#2B323B] bg-[#15191E] font-['JetBrains_Mono'] text-[10px] text-[#98A2AD] uppercase tracking-wider">
                    <th className="px-3 py-1 font-normal">Ticker / Exchange</th>
                    <th className="px-2 py-1 font-normal text-right">Last Close</th>
                    <th className="px-2 py-1 font-normal text-right">24h Delta</th>
                    <th className="px-3 py-1 font-normal text-center">Council Stance</th>
                    <th className="px-3 py-1 font-normal">Bull/Bear Spread</th>
                    <th className="px-2 py-1 font-normal text-right">Invalidation Gate</th>
                    <th className="px-3 py-1 font-normal">Evidence</th>
                    <th className="px-3 py-1 font-normal text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B323B] font-['JetBrains_Mono']">
                  {TRACKED_EQUITIES.map(item => (
                    <tr
                      key={item.ticker}
                      className="h-10 hover:bg-[#212b34]/40 transition-colors cursor-pointer"
                      onClick={() => {
                        onSelectTicker(item.ticker);
                        onOpenAnalysisWorkspace(item.ticker);
                      }}
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5 font-sans">
                          <span className="font-semibold text-[#E8EAEC] font-mono text-[11px]">{item.ticker}</span>
                          <span className="text-[9px] text-[#88938f] font-mono">EQ</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-right text-[#E8EAEC] font-mono text-[11px]">{item.lastClose}</td>
                      <td
                        className={`px-2 py-2 text-right font-mono text-[11px] ${
                          item.isPositive ? 'text-[#4EAA8C]' : 'text-[#D77972]'
                        }`}
                      >
                        {item.delta24h}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-sans font-medium ${
                            item.stance === 'ACCUMULATE' || item.stance === 'BUY'
                              ? 'bg-[#4EAA8C]/10 text-[#4EAA8C] border border-[#4EAA8C]/25'
                              : item.stance === 'HOLD'
                              ? 'bg-[#D6AC64]/10 text-[#D6AC64] border border-[#D6AC64]/25'
                              : item.stance === 'REDUCE'
                              ? 'bg-[#D77972]/10 text-[#D77972] border border-[#D77972]/25'
                              : 'bg-[#15191E] text-[#98A2AD] border border-[#2B323B]'
                          }`}
                        >
                          {item.stance}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {item.bullSpread > 0 ? (
                          <div className="flex items-center gap-2 text-[10px]">
                            <div className="w-20 bg-[#131d25] h-1.5 rounded flex overflow-hidden">
                              <div className="bg-[#4EAA8C] h-full" style={{ width: `${item.bullSpread}%` }}></div>
                              <div className="bg-[#D77972] h-full" style={{ width: `${item.bearSpread}%` }}></div>
                            </div>
                            <span className="text-[#98A2AD] text-[10px]">
                              +{item.bullSpread} / -{item.bearSpread}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[10px]">
                            <div className="w-20 bg-[#131d25] h-1.5 rounded flex overflow-hidden">
                              <div className="bg-[#88938f] h-full" style={{ width: '100%' }}></div>
                            </div>
                            <span className="text-[#88938f] text-[10px]">Evaluating</span>
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-2 text-right text-[#98A2AD] font-mono text-[11px]">{item.invalidationGate}</td>
                      <td className="px-3 py-2 font-sans">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] ${
                            item.evidenceStrength === 'Strong'
                              ? 'text-[#70c5b4]'
                              : item.evidenceStrength === 'Divergent'
                              ? 'text-[#D6AC64]'
                              : 'text-[#98A2AD]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {item.evidenceStrength === 'Strong'
                              ? 'verified'
                              : item.evidenceStrength === 'Divergent'
                              ? 'priority_high'
                              : 'check_circle'}
                          </span>
                          <span>{item.evidenceStrength}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-sans">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onSelectTicker(item.ticker);
                            onOpenAnalysisWorkspace(item.ticker);
                          }}
                          className="text-[#70c5b4] hover:text-[#E8EAEC] text-[11px] underline underline-offset-2"
                          type="button"
                        >
                          Analyze
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Agent Network Topology & Latency Graph */}
          <section className="bg-[#191E24] border border-[#2B323B] rounded p-3 md:p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#88938f] text-[16px]">account_tree</span>
                <h2 className="font-['Geist'] text-[13px] text-[#E8EAEC] uppercase tracking-wider font-semibold m-0">
                  Agent Network Topology & Latency Graph
                </h2>
              </div>
              <span className="font-['JetBrains_Mono'] text-[10px] text-[#98A2AD]">
                Divergence Alert Threshold: <span className="text-[#E8EAEC] font-mono">&gt;0.40</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-1 font-['JetBrains_Mono'] text-[10px]">
              <div className="p-2 bg-[#15191E] border border-[#2B323B] rounded flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between text-[#88938f]">
                  <span className="text-[9px] font-mono">01 · TECH</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4EAA8C]"></span>
                </div>
                <div>
                  <div className="font-semibold text-[#E8EAEC] truncate">Technical Agent</div>
                  <div className="text-[9px] text-[#98A2AD]">TAs & Fib Levels</div>
                </div>
                <div className="pt-1 border-t border-[#2B323B] text-[10px] text-[#70c5b4] tabular-nums">0.94s latency</div>
              </div>

              <div className="p-2 bg-[#15191E] border border-[#2B323B] rounded flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between text-[#88938f]">
                  <span className="text-[9px] font-mono">02 · FUND</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4EAA8C]"></span>
                </div>
                <div>
                  <div className="font-semibold text-[#E8EAEC] truncate">Fundamental</div>
                  <div className="text-[9px] text-[#98A2AD]">DCF & Balance</div>
                </div>
                <div className="pt-1 border-t border-[#2B323B] text-[10px] text-[#70c5b4] tabular-nums">1.12s latency</div>
              </div>

              <div className="p-2 bg-[#15191E] border border-[#2B323B] rounded flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between text-[#88938f]">
                  <span className="text-[9px] font-mono">03 · SENT</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4EAA8C]"></span>
                </div>
                <div>
                  <div className="font-semibold text-[#E8EAEC] truncate">News & Media</div>
                  <div className="text-[9px] text-[#98A2AD]">NLP Web Feed</div>
                </div>
                <div className="pt-1 border-t border-[#2B323B] text-[10px] text-[#70c5b4] tabular-nums">1.42s latency</div>
              </div>

              <div className="p-2 bg-[#15191E] border border-[#2B323B] rounded flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between text-[#88938f]">
                  <span className="text-[9px] font-mono">04 · BULL</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4EAA8C]"></span>
                </div>
                <div>
                  <div className="font-semibold text-[#4EAA8C] truncate">Bull Thesis</div>
                  <div className="text-[9px] text-[#98A2AD]">Debate Engine</div>
                </div>
                <div className="pt-1 border-t border-[#2B323B] text-[10px] text-[#70c5b4] tabular-nums">1.08s latency</div>
              </div>

              <div className="p-2 bg-[#15191E] border border-[#2B323B] rounded flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between text-[#88938f]">
                  <span className="text-[9px] font-mono">05 · BEAR</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4EAA8C]"></span>
                </div>
                <div>
                  <div className="font-semibold text-[#D77972] truncate">Bear Thesis</div>
                  <div className="text-[9px] text-[#98A2AD]">Debate Engine</div>
                </div>
                <div className="pt-1 border-t border-[#2B323B] text-[10px] text-[#70c5b4] tabular-nums">1.05s latency</div>
              </div>

              <div className="p-2 bg-[#15191E] border border-[#2B323B] rounded flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between text-[#88938f]">
                  <span className="text-[9px] font-mono">06 · RISK</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4EAA8C]"></span>
                </div>
                <div>
                  <div className="font-semibold text-[#E8EAEC] truncate">Risk Officer</div>
                  <div className="text-[9px] text-[#98A2AD]">VaR / Drawdown</div>
                </div>
                <div className="pt-1 border-t border-[#2B323B] text-[10px] text-[#70c5b4] tabular-nums">0.98s latency</div>
              </div>

              <div className="p-2 bg-[#15191E] border border-[#70c5b4]/40 rounded flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between text-[#88938f]">
                  <span className="text-[9px] font-mono text-[#70c5b4] font-bold">07 · PM</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#70c5b4] animate-pulse"></span>
                </div>
                <div>
                  <div className="font-semibold text-[#E8EAEC] truncate">Portfolio Mgr</div>
                  <div className="text-[9px] text-[#98A2AD]">Final Decision</div>
                </div>
                <div className="pt-1 border-t border-[#2B323B] text-[10px] text-[#70c5b4] tabular-nums">1.20s latency</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[#98A2AD] font-['JetBrains_Mono'] text-[10px] pt-1 border-t border-[#2B323B]">
              <span>Consensus Architecture: Multi-Agent Weighted Voting + Invalidation Stop Check</span>
              <span className="text-[#88938f]">Cluster Latency Sum: ~7.79s per cycle</span>
            </div>
          </section>
        </div>

        {/* Right Column: Verdict Feed, Gates & Dispatcher (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* Latest Council Verdict Flash Card */}
          <section className="bg-[#191E24] border border-[#2B323B] rounded overflow-hidden">
            <div className="h-10 px-3 md:px-4 border-b border-[#2B323B] flex items-center justify-between bg-[#15191E]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#88938f] text-[16px]">verified</span>
                <h2 className="font-['Geist'] text-[13px] text-[#E8EAEC] uppercase tracking-wider font-semibold m-0">
                  Latest Council Verdict
                </h2>
              </div>
              <span className="font-['JetBrains_Mono'] text-[10px] px-1.5 py-0.5 rounded bg-[#131d25] text-[#98A2AD] border border-[#2B323B]">
                38m ago
              </span>
            </div>

            <div className="p-3 md:p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-['JetBrains_Mono'] text-[12px] text-[#E8EAEC] font-semibold">
                    RELIANCE.NS
                  </span>
                  <span className="px-2 py-0.5 rounded font-['JetBrains_Mono'] text-[11px] bg-[#4EAA8C]/10 text-[#4EAA8C] border border-[#4EAA8C]/25 font-medium">
                    ACCUMULATE / MILD BUY
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#98A2AD] font-['JetBrains_Mono'] text-[10px] mt-1">
                  <span>
                    Agreement: <strong className="text-[#E8EAEC]">4/5 Agents</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Conviction: <strong className="text-[#E8EAEC]">81.4%</strong>
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-[#15191E] border border-[#2B323B] rounded space-y-1 font-['DM_Sans'] text-[12px]">
                <div className="font-['JetBrains_Mono'] text-[#88938f] uppercase tracking-wider text-[9px]">
                  Executive Summary Extract
                </div>
                <p className="text-[#E8EAEC] italic leading-relaxed m-0">
                  “Consumer retail cash flows provide counter-cyclical stability against volatile petrochemical spreads. Technical retest of 200 EMA at ₹2,710 confirmed by Bull Researcher.”
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 font-['JetBrains_Mono'] text-[10px]">
                <div className="p-2 bg-[#15191E] border border-[#2B323B] rounded space-y-0.5">
                  <span className="text-[#88938f] uppercase text-[9px] block">Invalidation Stop</span>
                  <span className="text-[#D77972] font-semibold tabular-nums text-[12px] font-sans">₹2,695.00</span>
                  <span className="text-[9px] text-[#98A2AD] block">(-1.71% margin)</span>
                </div>
                <div className="p-2 bg-[#15191E] border border-[#2B323B] rounded space-y-0.5">
                  <span className="text-[#88938f] uppercase text-[9px] block">Active Horizon</span>
                  <span className="text-[#E8EAEC] font-semibold tabular-nums text-[12px]">18 / 30 Days</span>
                  <span className="text-[9px] text-[#98A2AD] block">12 sessions left</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectTicker('RELIANCE.NS');
                  onOpenAnalysisWorkspace('RELIANCE.NS');
                }}
                className="w-full py-2 bg-[#70c5b4] hover:bg-[#81d6c4] text-[#005146] font-['Geist'] text-[13px] rounded transition-colors flex items-center justify-center gap-1.5 font-medium shadow-sm"
                type="button"
              >
                <span>Open in Analysis Workspace</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </section>

          {/* Paper Portfolio Validation Gates */}
          <section className="bg-[#191E24] border border-[#2B323B] rounded overflow-hidden">
            <div className="h-10 px-3 md:px-4 border-b border-[#2B323B] flex items-center justify-between bg-[#15191E]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#88938f] text-[16px]">task_alt</span>
                <h2 className="font-['Geist'] text-[13px] text-[#E8EAEC] uppercase tracking-wider font-semibold m-0">
                  Validation Gates (Paper)
                </h2>
              </div>
              <span className="font-['JetBrains_Mono'] text-[10px] text-[#4EAA8C]">Active Paper</span>
            </div>

            <div className="p-3 md:p-4 divide-y divide-[#2B323B] space-y-2 font-['DM_Sans'] text-[12px]">
              <div className="pt-2 first:pt-0 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-[11px]">
                    <span className="text-[#E8EAEC] font-semibold">TATAMOTORS.NS</span>
                    <span className="text-[#D77972] text-[10px]">(SELL)</span>
                  </div>
                  <div className="text-[10px] text-[#98A2AD]">Target Gate Hit</div>
                </div>
                <div className="text-right font-['JetBrains_Mono']">
                  <span className="text-[#4EAA8C] font-semibold text-[11px] tabular-nums">+3.4% Alpha</span>
                  <span className="text-[10px] text-[#88938f] block">Validated</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-[11px]">
                    <span className="text-[#E8EAEC] font-semibold">TCS.NS</span>
                    <span className="text-[#D77972] text-[10px]">(REDUCE)</span>
                  </div>
                  <div className="text-[10px] text-[#98A2AD]">Horizon: 12 days left</div>
                </div>
                <div className="text-right font-['JetBrains_Mono']">
                  <span className="text-[#98A2AD] font-medium text-[11px] tabular-nums">-0.8% PnL</span>
                  <span className="text-[10px] text-[#D6AC64] block">In Progress</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-[11px]">
                    <span className="text-[#E8EAEC] font-semibold">BHARTIARTL.NS</span>
                    <span className="text-[#4EAA8C] text-[10px]">(ACCUM)</span>
                  </div>
                  <div className="text-[10px] text-[#98A2AD]">Horizon Concluded</div>
                </div>
                <div className="text-right font-['JetBrains_Mono']">
                  <span className="text-[#4EAA8C] font-semibold text-[11px] tabular-nums">+5.1% Alpha</span>
                  <span className="text-[10px] text-[#88938f] block">vs NIFTY50</span>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Analysis Dispatcher */}
          <section className="bg-[#191E24] border border-[#2B323B] rounded overflow-hidden">
            <div className="h-10 px-3 md:px-4 border-b border-[#2B323B] flex items-center justify-between bg-[#15191E]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#88938f] text-[16px]">send</span>
                <h2 className="font-['Geist'] text-[13px] text-[#E8EAEC] uppercase tracking-wider font-semibold m-0">
                  Quick Analysis Dispatcher
                </h2>
              </div>
              <span className="font-['JetBrains_Mono'] text-[10px] text-[#88938f]">NSE / BSE</span>
            </div>

            <form onSubmit={handleQuickDispatch} className="p-3 md:p-4 space-y-3">
              <div className="space-y-1">
                <label className="block font-['JetBrains_Mono'] text-[#98A2AD] uppercase tracking-wider text-[10px]">
                  Asset Symbol
                </label>
                <div className="relative">
                  <input
                    value={quickTicker}
                    onChange={e => setQuickTicker(e.target.value.toUpperCase())}
                    className="w-full bg-[#101317] border border-[#2B323B] rounded px-3 py-1.5 font-['JetBrains_Mono'] text-[12px] text-[#E8EAEC] focus:outline-none focus:border-[#70c5b4] uppercase"
                    placeholder="e.g. INFY.NS, MARUTI.NS"
                    type="text"
                  />
                  <span className="absolute right-3 top-2 font-['JetBrains_Mono'] text-[10px] text-[#88938f]">
                    EQUITY
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-['JetBrains_Mono'] text-[#98A2AD] uppercase tracking-wider text-[10px]">
                  Select Active Agents for Council
                </label>
                <div className="grid grid-cols-2 gap-2 font-['DM_Sans'] text-[12px]">
                  {['Technical', 'Fundamental', 'Sentiment', 'Risk Engine'].map(agentName => {
                    const checked = selectedAgents.includes(agentName);
                    return (
                      <label
                        key={agentName}
                        onClick={() => toggleAgent(agentName)}
                        className={`flex items-center gap-2 p-1.5 rounded bg-[#15191E] border cursor-pointer select-none transition-colors ${
                          checked ? 'border-[#70c5b4]/50' : 'border-[#2B323B]'
                        }`}
                      >
                        <input
                          checked={checked}
                          onChange={() => {}}
                          className="rounded border-[#2B323B] text-[#70c5b4] bg-[#101317] focus:ring-0 w-3.5 h-3.5 accent-[#70c5b4]"
                          type="checkbox"
                        />
                        <span className="text-[11px] font-['JetBrains_Mono'] text-[#E8EAEC]">{agentName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                disabled={isDispatching}
                type="submit"
                className="w-full py-2 bg-[#15191E] hover:bg-[#212b34] border border-[#70c5b4]/40 hover:border-[#70c5b4] text-[#70c5b4] font-['Geist'] text-[13px] rounded transition-colors flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
              >
                {isDispatching ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                    <span>Synthesizing Pipeline...</span>
                  </>
                ) : dispatchSuccess ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] text-[#4EAA8C]">check_circle</span>
                    <span className="text-[#4EAA8C]">Council Dispatched</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    <span>Dispatch Council Run</span>
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Institutional Provenance Notice */}
          <section className="bg-[#15191E] border border-[#2B323B] rounded p-3 space-y-1">
            <div className="flex items-center gap-2 text-[#88938f]">
              <span className="material-symbols-outlined text-[16px] text-[#D6AC64]">shield</span>
              <span className="font-['JetBrains_Mono'] text-[10px] text-[#98A2AD] uppercase tracking-wider font-semibold">
                Institutional Provenance
              </span>
            </div>
            <p className="font-['DM_Sans'] text-[12px] text-[#98A2AD] leading-normal m-0">
              PAPER TRADING & EMPIRICAL RESEARCH ENVIRONMENT. Simulated execution only. All insights represent automated LLM multi-agent synthesis and should not be construed as investment advice or financial execution orders.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
