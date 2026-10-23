import React, { useState } from 'react';

interface AuditTranscriptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  runId: string;
  ticker: string;
}

export const AuditTranscriptsModal: React.FC<AuditTranscriptsModalProps> = ({
  isOpen,
  onClose,
  runId,
  ticker,
}) => {
  const [activeTab, setActiveTab] = useState<'debate' | 'risk' | 'pm'>('debate');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#191E24] border border-[#2B323B] rounded-lg shadow-2xl overflow-hidden flex flex-col font-['DM_Sans'] text-[#E8EAEC] max-h-[85vh]">
        {/* Header */}
        <div className="h-12 px-4 bg-[#15191E] border-b border-[#2B323B] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#70c5b4] text-[18px]">terminal</span>
            <span className="font-['Geist'] text-[14px] font-semibold tracking-wide">
              Raw Council Transcripts & Debate Ledger
            </span>
            <span className="font-['JetBrains_Mono'] text-[10px] px-1.5 py-0.2 rounded bg-[#191E24] text-[#70c5b4] border border-[#70c5b4]/20">
              {runId} · {ticker}
            </span>
          </div>
          <button onClick={onClose} className="text-[#98A2AD] hover:text-[#E8EAEC] p-1 rounded">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Subtabs */}
        <div className="flex border-b border-[#2B323B] bg-[#15191E] px-3 gap-1 font-['JetBrains_Mono'] text-[11px] shrink-0">
          <button
            onClick={() => setActiveTab('debate')}
            className={`py-2 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'debate'
                ? 'border-[#70c5b4] text-[#70c5b4]'
                : 'border-transparent text-[#98A2AD] hover:text-[#E8EAEC]'
            }`}
          >
            Bull vs Bear Cross-Exam
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`py-2 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'risk'
                ? 'border-[#70c5b4] text-[#70c5b4]'
                : 'border-transparent text-[#98A2AD] hover:text-[#E8EAEC]'
            }`}
          >
            Risk Officer Stress Scenarios
          </button>
          <button
            onClick={() => setActiveTab('pm')}
            className={`py-2 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'pm'
                ? 'border-[#70c5b4] text-[#70c5b4]'
                : 'border-transparent text-[#98A2AD] hover:text-[#E8EAEC]'
            }`}
          >
            PM Synthesis Rubric
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-3 font-['JetBrains_Mono'] text-[11px] leading-relaxed">
          {activeTab === 'debate' && (
            <>
              <div className="p-3 rounded bg-[#15191E] border border-[#4EAA8C]/30 space-y-1">
                <div className="flex items-center justify-between text-[#4EAA8C] font-semibold">
                  <span>[04] BULL_RESEARCHER (weight: 0.72)</span>
                  <span className="text-[10px] text-[#98A2AD]">15:34:04.120 UTC</span>
                </div>
                <p className="text-[#E8EAEC] font-['DM_Sans'] text-[13px] m-0">
                  "The technical consolidation breakout across the 20-day EMA at ₹2,728 provides a clear quantitative confirmation signal. Furthermore, Jio ARPU expansion to ₹181 and consistent double-digit retail EBITDA margins offset upstream petrochemical softening. Downside risks are strictly localized."
                </p>
              </div>

              <div className="p-3 rounded bg-[#15191E] border border-[#D77972]/30 space-y-1">
                <div className="flex items-center justify-between text-[#D77972] font-semibold">
                  <span>[05] BEAR_RESEARCHER (weight: 0.58)</span>
                  <span className="text-[10px] text-[#98A2AD]">15:34:06.450 UTC</span>
                </div>
                <p className="text-[#E8EAEC] font-['DM_Sans'] text-[13px] m-0">
                  "Objection regarding retail multiple assumptions: current consolidated P/E of 24.2x trades at the upper quartile of the 3-year historical distribution. Brent-to-Naphtha crack margin contraction threatens gross refining margin expansion. We must condition any long entry upon an explicit invalidation gate below ₹2,695."
                </p>
              </div>

              <div className="p-3 rounded bg-[#15191E] border border-[#70c5b4]/30 space-y-1">
                <div className="flex items-center justify-between text-[#70c5b4] font-semibold">
                  <span>[DEBATE RESOLUTION ARBITER]</span>
                  <span className="text-[10px] text-[#98A2AD]">15:34:08.890 UTC</span>
                </div>
                <p className="text-[#E8EAEC] font-['DM_Sans'] text-[13px] m-0">
                  "Weighted evidence tilts 68% in favor of Bull thesis due to verifiable cash-flow durability in telecom segment. However, Bear Caveat regarding crack spread fragility is formally accepted as the primary downside invalidation trigger."
                </p>
              </div>
            </>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-2">
              <div className="p-3 rounded bg-[#15191E] border border-[#2B323B] space-y-2">
                <div className="text-[#D6AC64] font-semibold">QUANTITATIVE RISK REPORT: RUN #TC-4819</div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-[#98A2AD] border-y border-[#2B323B] py-2">
                  <div>Historical Volatility (30D): 16.4%</div>
                  <div>Historical Beta (vs Nifty 50): 0.88</div>
                  <div>Value at Risk (95% 5-day): 2.85%</div>
                  <div>Simulated Max Drawdown: -4.20%</div>
                  <div>Recommended Position Size: &lt;= 3.50%</div>
                  <div>Stress Invalidation Stop: ₹2,695.00</div>
                </div>
                <p className="font-['DM_Sans'] text-[12px] text-[#E8EAEC] m-0 pt-1">
                  Monte Carlo simulation of 10,000 asset paths reveals 94.2% probability of holding the ₹2,690 structural support band over a 20-session horizon.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'pm' && (
            <div className="space-y-2">
              <div className="p-3 rounded bg-[#15191E] border border-[#2B323B] space-y-2">
                <div className="text-[#70c5b4] font-semibold">PORTFOLIO MANAGER CONVERGENCE GATE</div>
                <p className="font-['DM_Sans'] text-[13px] text-[#E8EAEC] m-0 leading-relaxed">
                  "Synthesis complete: 4 of 5 voting agents aligned on constructive accumulation posture. Reference entry bracket established between ₹2,738 and ₹2,744. Invalidation trigger active at daily close below ₹2,695 or refining gross crack spread &lt; $6.50/bbl. Order bracket signed and committed to paper research register."
                </p>
                <div className="flex items-center justify-between text-[10px] text-[#88938f] pt-2 border-t border-[#2B323B]">
                  <span>Signoff Hash: SHA256:e82b09a41c...7d91bf</span>
                  <span className="text-[#4EAA8C]">VERDICT COMMITTED</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-12 px-4 bg-[#15191E] border-t border-[#2B323B] flex items-center justify-between shrink-0 font-['JetBrains_Mono'] text-[11px]">
          <span className="text-[#88938f]">Audit Engine: TradingAgents v1.2-core</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#191E24] hover:bg-[#212b34] text-[#E8EAEC] border border-[#2B323B] rounded transition-colors"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
