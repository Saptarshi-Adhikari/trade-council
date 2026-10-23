import React from 'react';
import { ViewType } from '../types/terminal';

interface NavigationProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  selectedTicker: string;
  onOpenNewAnalysis: () => void;
  onOpenSearch: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onSelectView,
  selectedTicker,
  onOpenNewAnalysis,
  onOpenSearch,
}) => {
  return (
    <>
      {/* DESKTOP FIXED SIDEBAR (hidden on mobile, visible on md/lg+) */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-[220px] bg-[#15191E] border-r border-[#2B323B] z-50 flex-col justify-between select-none">
        <div className="flex flex-col">
          {/* Logo & Brand Header */}
          <div className="h-14 px-3 border-b border-[#2B323B] flex items-center justify-between gap-1">
            <button
              onClick={() => onSelectView('overview')}
              className="flex items-center gap-1.5 min-w-0 text-left hover:opacity-90 transition-opacity"
            >
              <div className="w-6 h-6 rounded flex items-center justify-center bg-[#191E24] border border-[#2B323B] shrink-0">
                <svg
                  className="w-4 h-4 text-[#70c5b4]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="6" cy="6" r="2.5" fill="currentColor" fillOpacity="0.2" />
                  <circle cx="18" cy="6" r="2.5" fill="currentColor" fillOpacity="0.2" />
                  <circle cx="12" cy="18" r="2.5" fill="currentColor" fillOpacity="0.2" />
                  <path d="M8.5 6h7M7.5 8.5l3.5 7M16.5 8.5l-3.5 7" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-['Geist'] text-[13px] font-semibold text-[#E8EAEC] tracking-wider uppercase truncate">
                TRADECOUNCIL
              </span>
            </button>
            <span className="font-['JetBrains_Mono'] text-[10px] px-1.5 py-0.5 rounded bg-[#191E24] border border-[#2B323B] text-[#98A2AD] shrink-0">
              v1.0
            </span>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col py-2 px-1 gap-1">
            <button
              onClick={() => onSelectView('overview')}
              className={`flex items-center gap-2 px-2.5 py-2 rounded text-left transition-colors font-['DM_Sans'] text-[13px] ${
                currentView === 'overview'
                  ? 'bg-[#191E24] text-[#E8EAEC] border-l-2 border-[#70c5b4] font-medium'
                  : 'text-[#98A2AD] hover:bg-[#191E24] hover:text-[#E8EAEC] border-l-2 border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
              <span>Overview</span>
            </button>

            <button
              onClick={() => onSelectView('analyze')}
              className={`flex items-center gap-2 px-2.5 py-2 rounded text-left transition-colors font-['DM_Sans'] text-[13px] ${
                currentView === 'analyze'
                  ? 'bg-[#191E24] text-[#E8EAEC] border-l-2 border-[#70c5b4] font-medium'
                  : 'text-[#98A2AD] hover:bg-[#191E24] hover:text-[#E8EAEC] border-l-2 border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">analytics</span>
              <span>Analyze</span>
            </button>

            <button
              onClick={() => onSelectView('decision-journal')}
              className={`flex items-center gap-2 px-2.5 py-2 rounded text-left transition-colors font-['DM_Sans'] text-[13px] ${
                currentView === 'decision-journal'
                  ? 'bg-[#191E24] text-[#E8EAEC] border-l-2 border-[#70c5b4] font-medium'
                  : 'text-[#98A2AD] hover:bg-[#191E24] hover:text-[#E8EAEC] border-l-2 border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">history_edu</span>
              <span>Decision Journal</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Telemetry */}
        <div className="p-2 border-t border-[#2B323B] bg-[#101317]/60 flex flex-col gap-1.5 font-['JetBrains_Mono'] text-[10px] text-[#98A2AD]">
          <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-[#88938f] mb-0.5 font-semibold">
            <span>Telemetry & Engine</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#4EAA8C] animate-pulse"></span>
          </div>
          <div className="truncate">
            <span className="text-[#88938f]">Provider:</span> <span className="text-[#E8EAEC]">Claude 3.5 Sonnet</span>
          </div>
          <div className="truncate">
            <span className="text-[#88938f]">Agents Engine:</span> <span className="text-[#E8EAEC]">v1.2-core</span>
          </div>
          <div className="truncate">
            <span className="text-[#88938f]">State:</span>{' '}
            <span className="text-[#4EAA8C] font-medium">Connected</span>
          </div>
          <div className="truncate">
            <span className="text-[#88938f]">Trading Mode:</span>{' '}
            <span className="text-[#D6AC64] font-medium">Paper Active</span>
          </div>
        </div>
      </aside>

      {/* DESKTOP FIXED TOP HEADER */}
      <header className="hidden md:flex fixed top-0 left-[220px] right-0 h-14 bg-[#15191E]/95 backdrop-blur-md border-b border-[#2B323B] z-40 items-center justify-between px-4 gap-3">
        {/* Breadcrumb or Search */}
        <div className="flex items-center gap-3 min-w-0">
          {currentView === 'analyze' ? (
            <div className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-[11px] text-[#98A2AD] truncate">
              <span className="text-[#88938f]">Workstation</span>
              <span className="text-[#2B323B]">/</span>
              <span className="text-[#E8EAEC] font-medium tracking-wide">{selectedTicker}</span>
              <span className="text-[#2B323B]">/</span>
              <span className="text-[#70c5b4]">Live Council Run #4819</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-['Geist'] text-[14px] font-semibold text-[#E8EAEC] uppercase tracking-wide">
                {currentView === 'overview' ? 'Terminal Overview' : 'Decision Journal'}
              </span>
            </div>
          )}
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenSearch}
            className="relative flex items-center bg-[#101317] border border-[#2B323B] hover:border-[#70c5b4] transition-colors rounded px-2.5 py-1 text-left w-56 text-[#88938f] text-[11px] font-['JetBrains_Mono']"
          >
            <span className="material-symbols-outlined text-[15px] mr-1.5 pointer-events-none">search</span>
            <span className="truncate">Search ticker, agent...</span>
            <div className="ml-auto flex items-center gap-0.5 px-1 py-0.5 rounded bg-[#191E24] border border-[#2B323B] text-[9px] text-[#98A2AD]">
              <span>⌘</span>K
            </div>
          </button>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#191E24] border border-[#2B323B] font-['JetBrains_Mono'] text-[10px] text-[#98A2AD]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4EAA8C]"></span>
            <span>Engine: Ready</span>
          </div>

          <span className="font-['JetBrains_Mono'] text-[10px] px-2 py-1 rounded bg-[#D6AC64]/10 text-[#D6AC64] border border-[#D6AC64]/20 font-medium tracking-wide uppercase">
            PAPER TRADING ONLY
          </span>

          <button
            onClick={onOpenNewAnalysis}
            className="flex items-center gap-1 px-3 py-1 bg-[#70c5b4] hover:bg-[#81d6c4] text-[#005146] font-['Geist'] text-[13px] rounded transition-colors shadow-sm font-medium"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>New Analysis</span>
          </button>

          <div className="w-7 h-7 rounded-full bg-[#191E24] border border-[#2B323B] flex items-center justify-center shrink-0 text-[#70c5b4]">
            <span className="material-symbols-outlined text-[16px]">person</span>
          </div>
        </div>
      </header>

      {/* MOBILE TOP HEADER (visible on small screens) */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#15191E]/95 backdrop-blur-xl border-b border-[#2B323B] z-40 flex items-center justify-between px-3 pt-safe">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded flex items-center justify-center bg-[#191E24] border border-[#2B323B] shrink-0">
            <svg className="w-4 h-4 text-[#70c5b4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="6" cy="6" r="2.5" fill="currentColor" fillOpacity="0.2" />
              <circle cx="18" cy="6" r="2.5" fill="currentColor" fillOpacity="0.2" />
              <circle cx="12" cy="18" r="2.5" fill="currentColor" fillOpacity="0.2" />
              <path d="M8.5 6h7M7.5 8.5l3.5 7M16.5 8.5l-3.5 7" strokeLinecap="round" />
            </svg>
          </div>
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#191E24] border border-[#2B323B] text-[11px] font-['JetBrains_Mono'] text-[#E8EAEC]"
          >
            <span>{selectedTicker}</span>
            <span className="material-symbols-outlined text-[14px] text-[#98A2AD]">unfold_more</span>
          </button>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#70c5b4]/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#70c5b4] animate-pulse"></span>
            <span className="font-['JetBrains_Mono'] text-[9px] text-[#70c5b4] uppercase">RUN #4819</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-['JetBrains_Mono'] text-[9px] px-1.5 py-0.5 rounded bg-[#191E24] text-[#D6AC64] border border-[#D6AC64]/20 uppercase">
            PAPER
          </span>
          <button
            onClick={onOpenNewAnalysis}
            className="p-1.5 rounded bg-[#70c5b4] text-[#005146] flex items-center justify-center"
            title="New Analysis"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR (fixed bottom on mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#15191E]/95 backdrop-blur-xl border-t border-[#2B323B] pb-safe shadow-[0_-2px_12px_rgba(0,0,0,0.50)]">
        <div className="flex justify-around items-center h-14 px-2">
          <button
            onClick={() => onSelectView('overview')}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[72px] min-h-[44px] transition-colors ${
              currentView === 'overview' ? 'text-[#70c5b4] font-semibold' : 'text-[#98A2AD] hover:text-[#E8EAEC]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span className="font-['JetBrains_Mono'] text-[10px] tracking-tight">Overview</span>
          </button>

          <button
            onClick={() => onSelectView('analyze')}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[72px] min-h-[44px] transition-colors ${
              currentView === 'analyze' ? 'text-[#70c5b4] font-semibold' : 'text-[#98A2AD] hover:text-[#E8EAEC]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">analytics</span>
            <span className="font-['JetBrains_Mono'] text-[10px] tracking-tight">Analyze</span>
          </button>

          <button
            onClick={() => onSelectView('decision-journal')}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[72px] min-h-[44px] transition-colors ${
              currentView === 'decision-journal' ? 'text-[#70c5b4] font-semibold' : 'text-[#98A2AD] hover:text-[#E8EAEC]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">history_edu</span>
            <span className="font-['JetBrains_Mono'] text-[10px] tracking-tight">Journal</span>
          </button>
        </div>
      </nav>
    </>
  );
};
