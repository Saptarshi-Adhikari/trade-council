import React, { useState, useEffect } from 'react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTicker: (ticker: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectTicker,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    { type: 'Asset', title: 'RELIANCE.NS', desc: 'Reliance Industries Ltd · NSE Energy / Retail' },
    { type: 'Asset', title: 'HDFCBANK.NS', desc: 'HDFC Bank Ltd · NSE Banking / Financial Services' },
    { type: 'Asset', title: 'TCS.NS', desc: 'Tata Consultancy Services · NSE IT Services' },
    { type: 'Asset', title: 'INFY.NS', desc: 'Infosys Ltd · NSE IT Consulting' },
    { type: 'Asset', title: 'ICICIBANK.NS', desc: 'ICICI Bank Ltd · NSE Banking' },
    { type: 'Asset', title: 'TATAMOTORS.NS', desc: 'Tata Motors Ltd · NSE Automotive / EV' },
    { type: 'Asset', title: 'BHARTIARTL.NS', desc: 'Bharti Airtel Ltd · NSE Telecom Services' },
    { type: 'Asset', title: 'SBIN.NS', desc: 'State Bank of India · NSE Public Banking' },
    { type: 'Agent', title: 'Technical Analyst (TA)', desc: 'EMA20, EMA50, VWAP, RSI(14), Volume expansion' },
    { type: 'Agent', title: 'Fundamental Analyst (FA)', desc: 'Net Debt/EBITDA, Cash Flow, ARPU, Margin inflection' },
    { type: 'Agent', title: 'Bull Researcher', desc: 'Primary thesis formulation & catalyst weighting' },
    { type: 'Agent', title: 'Bear Researcher', desc: 'Counter-thesis, valuation upper bounds, crack spreads' },
    { type: 'Agent', title: 'Risk Management Team', desc: 'Value at Risk (VaR 95%), Drawdown stress testing' },
    { type: 'Agent', title: 'Portfolio Manager', desc: 'Consensus convergence & downside invalidation stop' },
  ];

  const filtered = items.filter(
    i =>
      i.title.toLowerCase().includes(query.toLowerCase()) ||
      i.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 backdrop-blur-sm p-4 pt-20">
      <div className="w-full max-w-xl bg-[#191E24] border border-[#2B323B] rounded-lg shadow-2xl overflow-hidden flex flex-col font-['DM_Sans'] text-[#E8EAEC]">
        {/* Search Input */}
        <div className="h-12 px-3 bg-[#15191E] border-b border-[#2B323B] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#88938f] text-[18px]">search</span>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search ticker, agent, factor, or decision..."
            className="w-full bg-transparent border-none outline-none font-['JetBrains_Mono'] text-[12px] text-[#E8EAEC] placeholder-[#88938f]"
          />
          <button
            onClick={onClose}
            className="text-[10px] font-['JetBrains_Mono'] px-1.5 py-0.5 rounded bg-[#191E24] border border-[#2B323B] text-[#98A2AD]"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-[#88938f] text-[12px]">No matching assets or agents</div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (item.type === 'Asset') {
                    onSelectTicker(item.title);
                  }
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2 rounded hover:bg-[#15191E] transition-colors text-left group"
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-['JetBrains_Mono'] text-[12px] font-semibold text-[#E8EAEC] group-hover:text-[#70c5b4] transition-colors">
                    {item.title}
                  </span>
                  <span className="font-['DM_Sans'] text-[11px] text-[#98A2AD] truncate">{item.desc}</span>
                </div>
                <span className="font-['JetBrains_Mono'] text-[9px] px-1.5 py-0.5 rounded bg-[#101317] border border-[#2B323B] text-[#88938f] uppercase">
                  {item.type}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
