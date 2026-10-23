import React, { useState } from 'react';
import { AssetAnalysisData } from '../types/terminal';

interface AnalyzeViewProps {
  data: AssetAnalysisData;
  onSaveJournal: (data: AssetAnalysisData) => void;
  isSavedInJournal: boolean;
  onOpenAuditTranscripts: () => void;
}

export const AnalyzeView: React.FC<AnalyzeViewProps> = ({
  data,
  onSaveJournal,
  isSavedInJournal,
  onOpenAuditTranscripts,
}) => {
  const [timeframe, setTimeframe] = useState<'15m' | '1h' | '1D' | '1W'>('1D');
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({
    'stage-1': false,
    'stage-2': false,
    'stage-3': false,
    'stage-6': true,
  });
  const [hoveredCandle, setHoveredCandle] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleAgent = (id: string) => {
    setExpandedAgents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TRADECOUNCIL_${data.ticker}_${data.runId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Evidence exported as JSON');
  };

  return (
    <div className="flex flex-col w-full p-2 md:p-4 gap-3 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-[#191E24] border border-[#70c5b4] text-[#70c5b4] px-4 py-2 rounded shadow-lg font-['JetBrains_Mono'] text-[11px] flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP WORKSPACE ROW (12-Column Grid) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-start">
        {/* LEFT 8 COLUMNS: Identity, Candlestick Chart, Multi-Agent Pipeline */}
        <div className="xl:col-span-8 flex flex-col gap-3">
          {/* 1. ASSET IDENTITY & METRICS BLOCK */}
          <div className="bg-[#191E24] p-3 md:p-3.5 rounded flex flex-col gap-2 shadow-sm border border-[#2B323B]">
            {/* Top row: Asset Ticker, Data Status, Timeframe Segmented Switch */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-['Geist'] text-[16px] md:text-[18px] font-semibold text-[#E8EAEC] tracking-tight m-0">
                  {data.name}
                </h1>
                <span className="font-['JetBrains_Mono'] text-[10px] px-1.5 py-0.5 rounded bg-[#15191E] text-[#98A2AD] tracking-wider border border-[#2B323B]">
                  {data.ticker} · {data.exchange}
                </span>
                <span className="font-['JetBrains_Mono'] text-[10px] px-2 py-0.5 rounded bg-[#212b34] text-[#D6AC64] tracking-wide uppercase border border-[#D6AC64]/20">
                  {data.dataTier} · CACHED [{data.cachedTime}]
                </span>
              </div>

              {/* Timeframe Segmented Selector */}
              <div className="inline-flex rounded bg-[#15191E] p-0.5 border border-[#2B323B]">
                {(['15m', '1h', '1D', '1W'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => {
                      setTimeframe(tf);
                      showToast(`Timeframe switched to ${tf}`);
                    }}
                    className={`px-2 py-0.5 font-['JetBrains_Mono'] text-[10px] rounded transition-colors ${
                      timeframe === tf
                        ? 'text-[#005146] bg-[#70c5b4] font-semibold shadow-sm'
                        : 'text-[#98A2AD] hover:text-[#E8EAEC]'
                    }`}
                    type="button"
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Metric Values Line */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 pt-1 font-['JetBrains_Mono']">
              <div className="flex flex-col bg-[#15191E]/70 px-2 py-1 rounded border border-[#2B323B]/60">
                <span className="text-[10px] text-[#98A2AD] uppercase">Last Price</span>
                <span className="text-[13px] text-[#E8EAEC] font-semibold tracking-tight tabular-nums font-sans">
                  {data.lastPrice}
                </span>
              </div>

              <div className="flex flex-col bg-[#15191E]/70 px-2 py-1 rounded border border-[#2B323B]/60">
                <span className="text-[10px] text-[#98A2AD] uppercase">Day Change</span>
                <span
                  className={`text-[13px] font-semibold tracking-tight tabular-nums font-sans ${
                    data.isDayPositive ? 'text-[#4EAA8C]' : 'text-[#D77972]'
                  }`}
                >
                  {data.dayChange}
                </span>
              </div>

              <div className="flex flex-col bg-[#15191E]/70 px-2 py-1 rounded border border-[#2B323B]/60">
                <span className="text-[10px] text-[#98A2AD] uppercase">Day High</span>
                <span className="text-[13px] text-[#E8EAEC] font-medium tracking-tight tabular-nums font-sans">
                  {data.dayHigh}
                </span>
              </div>

              <div className="flex flex-col bg-[#15191E]/70 px-2 py-1 rounded border border-[#2B323B]/60">
                <span className="text-[10px] text-[#98A2AD] uppercase">Day Low</span>
                <span className="text-[13px] text-[#E8EAEC] font-medium tracking-tight tabular-nums font-sans">
                  {data.dayLow}
                </span>
              </div>

              <div className="flex flex-col bg-[#15191E]/70 px-2 py-1 rounded border border-[#2B323B]/60">
                <span className="text-[10px] text-[#98A2AD] uppercase">Volume</span>
                <span className="text-[13px] text-[#E8EAEC] font-medium tracking-tight tabular-nums">
                  {data.volume}
                </span>
              </div>

              <div className="flex flex-col bg-[#15191E]/70 px-2 py-1 rounded border border-[#2B323B]/60">
                <span className="text-[10px] text-[#98A2AD] uppercase">20D Avg Vol</span>
                <span className="text-[13px] text-[#98A2AD] font-medium tracking-tight tabular-nums">
                  {data.avgVolume20D}
                </span>
              </div>
            </div>
          </div>

          {/* 2. COMPACT PROFESSIONAL CANDLESTICK & VOLUME CHART */}
          <div className="bg-[#191E24] p-3 md:p-3.5 rounded flex flex-col gap-1 shadow-sm border border-[#2B323B]">
            {/* Chart Technical Legend / Overlays */}
            <div className="flex flex-wrap items-center justify-between pb-1 font-['JetBrains_Mono'] text-[10px]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-[#70c5b4] rounded"></span>
                  <span className="text-[#98A2AD]">EMA(20):</span>
                  <span className="text-[#E8EAEC]">{data.indicators.ema20.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-[#D6AC64] rounded"></span>
                  <span className="text-[#98A2AD]">EMA(50):</span>
                  <span className="text-[#E8EAEC]">{data.indicators.ema50.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-[#c2c7cf] rounded"></span>
                  <span className="text-[#98A2AD]">VWAP:</span>
                  <span className="text-[#E8EAEC]">{data.indicators.vwap.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[#98A2AD]">
                <span>OHLC High: {data.indicators.ohlcHigh}</span>
                <span>·</span>
                <span>Low: {data.indicators.ohlcLow}</span>
              </div>
            </div>

            {/* SVG Candlestick & Volume Canvas */}
            <div className="w-full bg-[#15191E]/60 rounded p-1 overflow-hidden relative border border-[#2B323B]/60">
              {hoveredCandle !== null && data.candles[hoveredCandle] && (
                <div className="absolute top-2 left-2 z-20 bg-[#191E24]/90 backdrop-blur border border-[#70c5b4] p-1.5 rounded font-['JetBrains_Mono'] text-[10px] text-[#E8EAEC] flex gap-2">
                  <span>Open: ₹{data.candles[hoveredCandle].open}</span>
                  <span>High: ₹{data.candles[hoveredCandle].high}</span>
                  <span>Low: ₹{data.candles[hoveredCandle].low}</span>
                  <span className={data.candles[hoveredCandle].isBullish ? 'text-[#4EAA8C]' : 'text-[#D77972]'}>
                    Close: ₹{data.candles[hoveredCandle].close}
                  </span>
                  <span className="text-[#98A2AD]">Vol: {data.candles[hoveredCandle].volume}M</span>
                </div>
              )}

              <svg
                className="w-full h-56 md:h-64 select-none"
                preserveAspectRatio="none"
                viewBox="0 0 760 256"
              >
                <defs>
                  <pattern id="grid-pattern-analysis" width="76" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 76 0 L 0 0 0 32" fill="none" stroke="#21272F" strokeWidth="0.75" />
                  </pattern>
                </defs>

                {/* Background Grid */}
                <rect width="100%" height="100%" fill="url(#grid-pattern-analysis)" />

                {/* Price Horizontal Reference Lines & Labels */}
                <line x1="0" y1="42" x2="760" y2="42" stroke="#2B323B" strokeDasharray="2,2" strokeWidth="0.75" />
                <text x="755" y="40" fill="#98A2AD" fontFamily="JetBrains Mono" fontSize="9" textAnchor="end">
                  2,760.00
                </text>

                <line x1="0" y1="96" x2="760" y2="96" stroke="#2B323B" strokeDasharray="2,2" strokeWidth="0.75" />
                <text x="755" y="94" fill="#98A2AD" fontFamily="JetBrains Mono" fontSize="9" textAnchor="end">
                  2,730.00 (Breakout)
                </text>

                <line x1="0" y1="150" x2="760" y2="150" stroke="#2B323B" strokeDasharray="2,2" strokeWidth="0.75" />
                <text x="755" y="148" fill="#98A2AD" fontFamily="JetBrains Mono" fontSize="9" textAnchor="end">
                  2,700.00
                </text>

                {/* Separator for Volume Subpanel */}
                <line x1="0" y1="190" x2="760" y2="190" stroke="#2B323B" strokeWidth="1" />
                <text x="6" y="201" fill="#98A2AD" fontFamily="JetBrains Mono" fontSize="8" letterSpacing="0.05em">
                  VOL HISTOGRAM / SMA(20)
                </text>

                {/* EMA 50 Path (Gold/Amber) */}
                <path
                  d="M 10 148 C 90 144, 210 138, 320 132 C 430 126, 560 118, 750 110"
                  fill="none"
                  stroke="#D6AC64"
                  strokeWidth="1.2"
                  opacity="0.85"
                />

                {/* EMA 20 Path (Teal) */}
                <path
                  d="M 10 132 C 110 136, 210 128, 320 122 C 450 112, 580 94, 750 82"
                  fill="none"
                  stroke="#70C5B4"
                  strokeWidth="1.4"
                />

                {/* VWAP Reference Path (Grey dashed) */}
                <path
                  d="M 10 124 C 120 126, 240 120, 380 110 C 500 102, 630 92, 750 78"
                  fill="none"
                  stroke="#98A2AD"
                  strokeWidth="1"
                  strokeDasharray="4,3"
                  opacity="0.7"
                />

                {/* Candlesticks Series (auto-scaling dynamically to actual price levels) */}
                {(() => {
                  if (!data.candles || data.candles.length === 0) return null;
                  const allPrices = data.candles.flatMap(c => [c.high, c.low, c.open, c.close]).filter(p => !isNaN(p) && p > 0);
                  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 100;
                  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 200;
                  const priceRange = Math.max(1, maxPrice - minPrice);
                  
                  // normalize to y=165 down to y=35
                  const normY = (val: number) => {
                    const ratio = (val - minPrice) / priceRange;
                    return 165 - ratio * 130;
                  };

                  const maxVol = Math.max(...data.candles.map(c => c.volume || 1), 1);

                  return data.candles.map((c, i) => {
                    const step = Math.min(36, 700 / Math.max(1, data.candles.length));
                    const x = 30 + i * step;
                    const isBull = c.isBullish;
                    const color = isBull ? '#4EAA8C' : '#D77972';

                    const yHigh = normY(c.high);
                    const yLow = normY(c.low);
                    const yOpen = normY(c.open);
                    const yClose = normY(c.close);
                    const yTop = Math.min(yOpen, yClose);
                    const height = Math.max(3, Math.abs(yClose - yOpen));

                    const volHeight = Math.min(48, Math.max(4, (c.volume / maxVol) * 44));
                    const volY = 250 - volHeight;

                    return (
                      <g
                        key={i}
                        onMouseEnter={() => setHoveredCandle(i)}
                        onMouseLeave={() => setHoveredCandle(null)}
                        className="cursor-crosshair"
                      >
                        {/* Wick */}
                        <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1" />
                        {/* Body */}
                        <rect
                          x={x - 4}
                          y={yTop}
                          width="8"
                          height={height}
                          fill={color}
                          stroke={isBull ? '#70c5b4' : '#D77972'}
                          strokeWidth={i === data.candles.length - 1 ? '1' : '0.5'}
                        />
                        {/* Volume bar */}
                        <rect
                          x={x - 4}
                          y={volY}
                          width="8"
                          height={volHeight}
                          fill={color}
                          opacity={isBull ? 0.75 : 0.6}
                        />
                      </g>
                    );
                  });
                })()}

                {/* Volume Average Line */}
                <path
                  d="M 26 230 C 140 234, 300 232, 450 226 C 580 215, 680 210, 714 212"
                  fill="none"
                  stroke="#98A2AD"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  opacity="0.8"
                />
              </svg>
            </div>

            <div className="flex items-center justify-between pt-0.5 font-['JetBrains_Mono'] text-[10px]">
              <span className="text-[#98A2AD]">Static historical simulation data. Not a live execution feed.</span>
              <span className="text-[#88938f]">Interval: {timeframe} · Source: Cached NSE Daily Feed</span>
            </div>
          </div>

          {/* 3. LIVE AI TRADING COUNCIL PANEL */}
          <div className="bg-[#191E24] p-3 md:p-3.5 rounded flex flex-col gap-2 shadow-sm border border-[#2B323B]">
            {/* Council Run Header */}
            <div className="flex flex-wrap items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#70c5b4] animate-pulse"></span>
                <span className="font-['Geist'] text-[13px] text-[#E8EAEC] tracking-wide uppercase font-semibold">
                  COUNCIL MULTI-AGENT PIPELINE — RUN #{data.runId.replace('-A7F', '')}
                </span>
              </div>
              <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-[10px]">
                <span className="px-2 py-0.5 rounded bg-[#15191E] text-[#70c5b4] border border-[#70c5b4]/20">
                  Stages: 6 of 7 Finalized
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#15191E] text-[#98A2AD] border border-[#2B323B]">
                  Sync: 128ms
                </span>
              </div>
            </div>

            {/* Ordered Agent Workflow Timeline Sequence */}
            <div className="flex flex-col gap-2">
              {data.stages.map(stage => {
                const isExpanded = !!expandedAgents[stage.id];
                const isBull = stage.id === 'stage-4';
                const isBear = stage.id === 'stage-5';
                const isRisk = stage.id === 'stage-6';
                const isPM = stage.id === 'stage-7';

                return (
                  <div
                    key={stage.id}
                    className={`rounded p-2.5 flex flex-col gap-1 transition-all border ${
                      isBull
                        ? 'bg-[#15191E]/95 border-[#4EAA8C]/30 shadow-sm'
                        : isBear
                        ? 'bg-[#15191E]/95 border-[#D77972]/30 shadow-sm'
                        : isRisk
                        ? 'bg-[#15191E]/90 border-[#D6AC64]/30'
                        : isPM
                        ? 'bg-[#15191E]/50 border-[#2B323B] opacity-90'
                        : 'bg-[#15191E]/80 border-[#2B323B]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-['JetBrains_Mono'] text-[10px] font-medium ${
                            isBull
                              ? 'text-[#4EAA8C]'
                              : isBear
                              ? 'text-[#D77972]'
                              : isRisk
                              ? 'text-[#D6AC64]'
                              : 'text-[#88938f]'
                          }`}
                        >
                          {stage.order}
                        </span>
                        <span
                          className={`font-['Geist'] text-[13px] font-semibold ${
                            isPM ? 'text-[#98A2AD]' : 'text-[#E8EAEC]'
                          }`}
                        >
                          {stage.name}
                        </span>
                        {stage.stanceLabel && (
                          <span
                            className={`font-['JetBrains_Mono'] text-[10px] px-1.5 py-0.2 rounded uppercase ${
                              stage.stanceType === 'bullish'
                                ? 'bg-[#4EAA8C]/15 text-[#4EAA8C] font-medium'
                                : stage.stanceType === 'bearish'
                                ? 'bg-[#D77972]/15 text-[#D77972] font-medium'
                                : stage.stanceType === 'warning'
                                ? 'bg-[#D6AC64]/15 text-[#D6AC64] font-medium'
                                : 'bg-[#191E24] text-[#98A2AD]'
                            }`}
                          >
                            {stage.latency ? `Completed (${stage.latency})` : stage.stanceLabel}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {stage.weight !== undefined && (
                          <span className="font-['JetBrains_Mono'] text-[10px] text-[#98A2AD]">
                            Argument Weight: {stage.weight}
                          </span>
                        )}
                        {stage.details && (
                          <button
                            onClick={() => toggleAgent(stage.id)}
                            className="text-[#98A2AD] hover:text-[#E8EAEC] p-0.5 transition-transform"
                            title="Toggle Technical Details"
                            type="button"
                          >
                            <span
                              className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            >
                              expand_more
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    <p
                      className={`font-['DM_Sans'] text-[13px] pt-0.5 m-0 leading-relaxed ${
                        isPM ? 'text-[#88938f]' : 'text-[#98A2AD]'
                      }`}
                    >
                      {stage.summary}
                    </p>

                    {/* Expandable Technical Details */}
                    {isExpanded && stage.details && (
                      <div className="pt-2 mt-1 border-t border-[#2B323B]/60 flex flex-wrap items-center gap-x-3 gap-y-1 font-['JetBrains_Mono'] text-[10px] text-[#88938f] bg-[#101317]/50 p-2 rounded">
                        <span>
                          {stage.details.label1}:{' '}
                          <span className="text-[#E8EAEC]">{stage.details.value1}</span>
                        </span>
                        {stage.details.label2 && (
                          <>
                            <span>·</span>
                            <span>
                              {stage.details.label2}:{' '}
                              <span className="text-[#E8EAEC]">{stage.details.value2}</span>
                            </span>
                          </>
                        )}
                        {stage.details.extraNote && (
                          <div className="w-full text-[#70c5b4] text-[10px] mt-0.5">
                            {stage.details.extraNote}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT 4 COLUMNS: Evidence-Backed Council Verdict Panel */}
        <div className="xl:col-span-4 flex flex-col gap-3">
          {/* 4. FINAL COUNCIL VERDICT PANEL */}
          <div className="bg-[#191E24] p-3 md:p-3.5 rounded flex flex-col gap-3 shadow-sm border border-[#2B323B] h-full">
            {/* Verdict Header with Paper Trading Badge */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-['JetBrains_Mono'] text-[10px] text-[#88938f] uppercase tracking-wider">
                  Synthesis Gate
                </span>
                <span className="font-['Geist'] text-[16px] font-semibold text-[#E8EAEC]">
                  FINAL COUNCIL VERDICT
                </span>
              </div>
              <span className="font-['JetBrains_Mono'] text-[10px] px-2 py-0.5 rounded bg-[#D6AC64]/15 text-[#D6AC64] font-semibold tracking-wider uppercase border border-[#D6AC64]/20">
                PAPER TRADING ONLY
              </span>
            </div>

            {/* Overall Stance Badge Box */}
            <div className="bg-[#212b34]/60 rounded p-3 flex flex-col gap-1.5 border border-[#2B323B]">
              <div className="flex items-center justify-between">
                <span className="font-['JetBrains_Mono'] text-[10px] text-[#88938f] uppercase font-medium">
                  Executive Consensus
                </span>
                <span className="font-['JetBrains_Mono'] text-[10px] text-[#70c5b4] font-medium">
                  {data.verdict.agreement}
                </span>
              </div>
              <div className="font-['Geist'] text-[20px] md:text-[22px] font-semibold text-[#70c5b4] tracking-tight">
                {data.verdict.stance}
              </div>
              <div className="flex items-center justify-between pt-1 font-['DM_Sans'] text-[12px]">
                <span className="text-[#98A2AD]">Confidence Assessment</span>
                <span className="font-['JetBrains_Mono'] text-[10px] text-[#E8EAEC] font-medium">
                  Consensus Weight: {data.verdict.confidencePercent}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-[#15191E] h-1.5 rounded overflow-hidden mt-0.5">
                <div
                  className="bg-[#70c5b4] h-full rounded transition-all duration-700"
                  style={{ width: `${data.verdict.confidencePercent}%` }}
                ></div>
              </div>
            </div>

            {/* Structured Executive Synthesis */}
            <div className="flex flex-col gap-1">
              <span className="font-['JetBrains_Mono'] text-[10px] text-[#88938f] uppercase tracking-wider">
                Executive Synthesis
              </span>
              <p className="font-['DM_Sans'] text-[13px] text-[#E8EAEC] leading-relaxed bg-[#15191E]/60 p-2.5 rounded border border-[#2B323B]/60 m-0">
                {data.verdict.synthesis}
              </p>
            </div>

            {/* Structured Columns / Blocks */}
            <div className="flex flex-col gap-2">
              {/* Strongest Bull Pillar */}
              <div className="p-2.5 rounded bg-[#15191E]/80 border border-[#4EAA8C]/20 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-[10px] text-[#4EAA8C] font-semibold uppercase">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  <span>Strongest Bull Pillar</span>
                </div>
                <p className="font-['DM_Sans'] text-[12px] text-[#E8EAEC] m-0">
                  {data.verdict.strongestBull}
                </p>
              </div>

              {/* Strongest Bear Caveat */}
              <div className="p-2.5 rounded bg-[#15191E]/80 border border-[#D77972]/20 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-[10px] text-[#D77972] font-semibold uppercase">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  <span>Strongest Bear Caveat</span>
                </div>
                <p className="font-['DM_Sans'] text-[12px] text-[#E8EAEC] m-0">
                  {data.verdict.strongestBear}
                </p>
              </div>

              {/* Downside Invalidation Trigger */}
              <div className="p-2.5 rounded bg-[#15191E]/80 border border-[#D6AC64]/20 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-[10px] text-[#D6AC64] font-semibold uppercase">
                  <span className="material-symbols-outlined text-[14px]">shield</span>
                  <span>Downside Invalidation Trigger</span>
                </div>
                <p className="font-['DM_Sans'] text-[12px] text-[#98A2AD] m-0">
                  {data.verdict.invalidationTrigger}
                </p>
              </div>

              {/* Proposed Paper Parameters Table */}
              <div className="p-2.5 rounded bg-[#15191E]/80 border border-[#2B323B] flex flex-col gap-1.5">
                <span className="font-['JetBrains_Mono'] text-[10px] text-[#88938f] uppercase font-medium">
                  Proposed Paper Parameters
                </span>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-['JetBrains_Mono'] text-[10px]">
                  <span className="text-[#98A2AD]">Ref. Entry:</span>
                  <span className="text-[#E8EAEC] text-right font-medium">{data.verdict.parameters.refEntry}</span>
                  <span className="text-[#98A2AD]">Stop-Loss:</span>
                  <span className="text-[#D77972] text-right font-medium">{data.verdict.parameters.stopLoss}</span>
                  <span className="text-[#98A2AD]">Objective:</span>
                  <span className="text-[#4EAA8C] text-right font-medium">{data.verdict.parameters.objective}</span>
                  <span className="text-[#98A2AD]">Sim Horizon:</span>
                  <span className="text-[#E8EAEC] text-right">{data.verdict.parameters.simHorizon}</span>
                </div>
              </div>
            </div>

            {/* Action Controls */}
            <div className="mt-auto pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  onSaveJournal(data);
                  showToast('Saved to Decision Journal');
                }}
                className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded font-['Geist'] text-[13px] font-semibold transition-colors shadow-sm ${
                  isSavedInJournal
                    ? 'bg-[#4EAA8C] text-[#003730]'
                    : 'bg-[#70c5b4] hover:bg-[#81d6c4] text-[#005146]'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isSavedInJournal ? 'check_circle' : 'bookmark'}
                </span>
                <span>{isSavedInJournal ? 'Saved in Decision Journal' : 'Save to Decision Journal'}</span>
              </button>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={handleExportJSON}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 bg-[#15191E] hover:bg-[#212b34] text-[#E8EAEC] font-['JetBrains_Mono'] text-[10px] rounded border border-[#2B323B] transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">file_download</span>
                  <span>Export JSON</span>
                </button>
                <button
                  onClick={onOpenAuditTranscripts}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 bg-[#15191E] hover:bg-[#212b34] text-[#E8EAEC] font-['JetBrains_Mono'] text-[10px] rounded border border-[#2B323B] transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">segment</span>
                  <span>Audit Transcripts</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. ACTIVITY AND PROVENANCE STRIP (BOTTOM ACROSS WORKSPACE) */}
      <div className="w-full bg-[#191E24] p-2.5 rounded shadow-sm border border-[#2B323B]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center font-['JetBrains_Mono'] text-[10px]">
          {/* Run ID */}
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[#88938f] uppercase">Run ID:</span>
            <span className="text-[#E8EAEC] font-medium truncate">{data.runId}</span>
          </div>

          {/* Execution Time */}
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[#88938f] uppercase">Executed:</span>
            <span className="text-[#98A2AD] truncate">{data.executedAt}</span>
          </div>

          {/* Model Pipeline */}
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[#88938f] uppercase">Pipeline:</span>
            <span className="text-[#E8EAEC] truncate">{data.pipeline}</span>
          </div>

          {/* Data Verification */}
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[#88938f] uppercase">Hash:</span>
            <span className="text-[#98A2AD] truncate">{data.provenanceHash}</span>
          </div>

          {/* Backboard AI Memory Status */}
          {data.backboardMemoryStatus && (
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-[#88938f] uppercase">Memory:</span>
              <span className="text-[#70c5b4] truncate">{data.backboardMemoryStatus}</span>
            </div>
          )}

          {/* Journal State */}
          <div className="flex items-center justify-start lg:justify-end gap-1">
            <span className="text-[#88938f] uppercase">Journal State:</span>
            <span
              className={`px-1.5 py-0.5 rounded font-medium ${
                isSavedInJournal
                  ? 'bg-[#4EAA8C]/20 text-[#4EAA8C] border border-[#4EAA8C]/30'
                  : 'bg-[#15191E] text-[#D6AC64] border border-[#2B323B]'
              }`}
            >
              {isSavedInJournal ? 'Committed & Verified' : 'Draft / Uncommitted'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
