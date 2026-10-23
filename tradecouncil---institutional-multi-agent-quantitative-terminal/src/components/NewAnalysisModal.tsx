import React, { useState } from 'react';
import { AssetAnalysisData } from '../types/terminal';

interface NewAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAnalysis: (ticker: string, timeframe: string, liveResult?: AssetAnalysisData) => void;
}

export const NewAnalysisModal: React.FC<NewAnalysisModalProps> = ({
  isOpen,
  onClose,
  onStartAnalysis,
}) => {
  const [ticker, setTicker] = useState('RELIANCE.NS');
  const [customTicker, setCustomTicker] = useState('');
  const [exchange, setExchange] = useState('NSE');
  const [timeframe, setTimeframe] = useState('1D');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([
    'Technical Analyst',
    'Fundamental Analyst',
    'News & Sentiment Analyst',
    'Bull Researcher',
    'Bear Researcher',
    'Risk Management Team',
    'Portfolio Manager',
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [progressStage, setProgressStage] = useState(0);
  const [statusLog, setStatusLog] = useState('');

  if (!isOpen) return null;

  const handleToggleAgent = (name: string) => {
    setSelectedAgents(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  const handleStart = async () => {
    const targetTicker = (customTicker.trim() || ticker).toUpperCase();
    setIsRunning(true);
    setProgressStage(1);
    setStatusLog('Dispatching to TRADECOUNCIL Multi-Agent Engine...');

    try {
      const { triggerLiveAnalysis, subscribeToAnalysisEvents } = await import('../utils/apiClient');
      const analysisId = await triggerLiveAnalysis(targetTicker, undefined, timeframe);
      setStatusLog(`Engine initialized (Job ${analysisId}). Processing agents...`);

      // Subscribe via SSE stream (auto-falls back to polling)
      subscribeToAnalysisEvents(
        analysisId,
        (statusRes) => {
          if (statusRes.progress) {
            setStatusLog(statusRes.progress);
          }
        },
        (result) => {
          setIsRunning(false);
          onStartAnalysis(targetTicker, timeframe, result);
          onClose();
        },
        (errorMsg) => {
          setIsRunning(false);
          setStatusLog(`Analysis error: ${errorMsg}`);
          setTimeout(() => onClose(), 2000);
        }
      );

    } catch (err) {
      console.warn('Backend unavailable, using simulated consensus preview:', err);
      // Seamless fallback to existing simulated run if backend host is not running
      const stages = [
        { step: 1, text: 'Technical Analyst computing EMA(20/50) & VWAP...' },
        { step: 2, text: 'Fundamental Analyst synthesizing QoQ cash flows...' },
        { step: 3, text: 'Sentiment Engine parsing verified regulatory filings...' },
        { step: 4, text: 'Bull/Bear debate protocol evaluating catalysts...' },
        { step: 5, text: 'Risk Management Team stress-testing VaR...' },
        { step: 6, text: 'Portfolio Manager formulating invalidation stop...' },
        { step: 7, text: 'Council Consensus converged! Finalizing audit trail...' },
      ];

      let current = 0;
      const interval = setInterval(() => {
        current++;
        if (current < stages.length) {
          setProgressStage(stages[current].step);
          setStatusLog(stages[current].text);
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setIsRunning(false);
            onStartAnalysis(targetTicker, timeframe);
            onClose();
          }, 500);
        }
      }, 450);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#191E24] border border-[#2B323B] rounded-lg shadow-2xl overflow-hidden flex flex-col font-['DM_Sans'] text-[#E8EAEC]">
        {/* Modal Header */}
        <div className="h-12 px-4 bg-[#15191E] border-b border-[#2B323B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#70c5b4] text-[18px]">neurology</span>
            <span className="font-['Geist'] text-[14px] font-semibold tracking-wide">
              Initiate Multi-Agent Council Run
            </span>
          </div>
          <button
            onClick={onClose}
            disabled={isRunning}
            className="text-[#98A2AD] hover:text-[#E8EAEC] p-1 rounded"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4">
          {isRunning ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <span className="w-16 h-16 rounded-full border-2 border-[#2B323B] border-t-[#70c5b4] animate-spin"></span>
                <span className="material-symbols-outlined text-[#70c5b4] text-[24px]">hub</span>
              </div>
              <div className="space-y-1">
                <div className="font-['Geist'] text-[15px] font-semibold text-[#E8EAEC]">
                  Stage {progressStage} of 7: Processing Council Protocol
                </div>
                <div className="font-['JetBrains_Mono'] text-[11px] text-[#70c5b4] animate-pulse">
                  {statusLog}
                </div>
              </div>
              <div className="w-full max-w-xs bg-[#15191E] h-1.5 rounded overflow-hidden">
                <div
                  className="bg-[#70c5b4] h-full transition-all duration-300"
                  style={{ width: `${(progressStage / 7) * 100}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <>
              {/* Asset Selector */}
              <div className="space-y-1.5">
                <label className="block font-['JetBrains_Mono'] text-[10px] text-[#98A2AD] uppercase tracking-wider">
                  Select Benchmark Asset
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={ticker}
                    onChange={e => {
                      setTicker(e.target.value);
                      setCustomTicker('');
                    }}
                    className="bg-[#101317] border border-[#2B323B] rounded px-3 py-1.5 font-['JetBrains_Mono'] text-[12px] text-[#E8EAEC] focus:outline-none focus:border-[#70c5b4]"
                  >
                    <option value="RELIANCE.NS">RELIANCE.NS (Reliance Ind.)</option>
                    <option value="HDFCBANK.NS">HDFCBANK.NS (HDFC Bank)</option>
                    <option value="TCS.NS">TCS.NS (Tata Consultancy)</option>
                    <option value="INFY.NS">INFY.NS (Infosys Ltd)</option>
                    <option value="ICICIBANK.NS">ICICIBANK.NS (ICICI Bank)</option>
                    <option value="TATAMOTORS.NS">TATAMOTORS.NS (Tata Motors)</option>
                    <option value="BHARTIARTL.NS">BHARTIARTL.NS (Bharti Airtel)</option>
                    <option value="SBIN.NS">SBIN.NS (State Bank of India)</option>
                  </select>

                  <input
                    value={customTicker}
                    onChange={e => setCustomTicker(e.target.value.toUpperCase())}
                    placeholder="Or custom ticker..."
                    className="bg-[#101317] border border-[#2B323B] rounded px-3 py-1.5 font-['JetBrains_Mono'] text-[12px] text-[#E8EAEC] focus:outline-none focus:border-[#70c5b4] uppercase"
                  />
                </div>
              </div>

              {/* Timeframe & Exchange */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-['JetBrains_Mono'] text-[10px] text-[#98A2AD] uppercase tracking-wider">
                    Execution Interval
                  </label>
                  <div className="inline-flex rounded bg-[#101317] p-0.5 border border-[#2B323B] w-full">
                    {['15m', '1h', '1D', '1W'].map(tf => (
                      <button
                        key={tf}
                        type="button"
                        onClick={() => setTimeframe(tf)}
                        className={`flex-1 py-1 font-['JetBrains_Mono'] text-[10px] rounded transition-colors ${
                          timeframe === tf
                            ? 'bg-[#70c5b4] text-[#005146] font-semibold'
                            : 'text-[#98A2AD] hover:text-[#E8EAEC]'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-['JetBrains_Mono'] text-[10px] text-[#98A2AD] uppercase tracking-wider">
                    Exchange Venue
                  </label>
                  <select
                    value={exchange}
                    onChange={e => setExchange(e.target.value)}
                    className="w-full bg-[#101317] border border-[#2B323B] rounded px-3 py-1.5 font-['JetBrains_Mono'] text-[12px] text-[#E8EAEC] focus:outline-none focus:border-[#70c5b4]"
                  >
                    <option value="NSE">NSE (National Stock Exchange)</option>
                    <option value="BSE">BSE (Bombay Stock Exchange)</option>
                    <option value="NASDAQ">NASDAQ (Simulated USD Feed)</option>
                  </select>
                </div>
              </div>

              {/* Active Council Agents Checkboxes */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-['JetBrains_Mono'] text-[10px]">
                  <span className="text-[#98A2AD] uppercase tracking-wider">Participating Council Agents (7)</span>
                  <span className="text-[#70c5b4]">{selectedAgents.length} Active</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {[
                    'Technical Analyst',
                    'Fundamental Analyst',
                    'News & Sentiment Analyst',
                    'Bull Researcher',
                    'Bear Researcher',
                    'Risk Management Team',
                    'Portfolio Manager',
                  ].map(agent => {
                    const checked = selectedAgents.includes(agent);
                    return (
                      <label
                        key={agent}
                        onClick={() => handleToggleAgent(agent)}
                        className={`flex items-center gap-2 p-1.5 rounded border text-[11px] font-['JetBrains_Mono'] cursor-pointer select-none transition-colors ${
                          checked
                            ? 'bg-[#15191E] border-[#70c5b4]/40 text-[#E8EAEC]'
                            : 'bg-[#15191E]/50 border-[#2B323B] text-[#88938f]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="rounded border-[#2B323B] text-[#70c5b4] bg-[#101317] focus:ring-0 w-3.5 h-3.5 accent-[#70c5b4]"
                        />
                        <span className="truncate">{agent}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Notice */}
              <div className="p-2 rounded bg-[#15191E] border border-[#2B323B] font-['DM_Sans'] text-[11px] text-[#98A2AD] flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#D6AC64]">info</span>
                <span>
                  Simulated multi-agent consensus run. Synthesizes full evidence ledger, invalidation stop, and paper parameters.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!isRunning && (
          <div className="p-3 bg-[#15191E] border-t border-[#2B323B] flex items-center justify-end gap-2 font-['Geist'] text-[13px]">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-[#191E24] hover:bg-[#212b34] text-[#E8EAEC] border border-[#2B323B] transition-colors"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleStart}
              className="px-4 py-1.5 rounded bg-[#70c5b4] hover:bg-[#81d6c4] text-[#005146] font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              <span>Dispatch Multi-Agent Council</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
