export type ViewType = 'overview' | 'analyze' | 'decision-journal';

export interface CandlePoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isBullish: boolean;
}

export interface AgentWorkflowStage {
  id: string;
  order: string;
  name: string;
  status: 'COMPLETED' | 'REVIEWING (ACTIVE)' | 'PENDING' | 'QUEUED';
  latency?: string;
  summary: string;
  stanceLabel?: string;
  stanceType?: 'bullish' | 'bearish' | 'warning' | 'neutral';
  weight?: number;
  details?: {
    label1: string;
    value1: string;
    label2?: string;
    value2?: string;
    extraNote?: string;
  };
}

export interface AssetAnalysisData {
  ticker: string;
  name: string;
  exchange: string;
  dataTier: string;
  cachedTime: string;
  lastPrice: string;
  dayChange: string;
  isDayPositive: boolean;
  dayHigh: string;
  dayLow: string;
  volume: string;
  avgVolume20D: string;
  indicators: {
    ema20: number;
    ema50: number;
    vwap: number;
    rsi: number;
    ohlcHigh: string;
    ohlcLow: string;
  };
  verdict: {
    stance: string;
    agreement: string;
    confidencePercent: number;
    synthesis: string;
    strongestBull: string;
    strongestBear: string;
    invalidationTrigger: string;
    parameters: {
      refEntry: string;
      stopLoss: string;
      objective: string;
      simHorizon: string;
    };
  };
  stages: AgentWorkflowStage[];
  runId: string;
  executedAt: string;
  pipeline: string;
  provenanceHash: string;
  candles: CandlePoint[];
  backboardMemoryStatus?: string;
  memoryNote?: string;
}

export interface DecisionRecord {
  id: string;
  timestamp: string;
  ticker: string;
  companyName: string;
  exchange: string;
  verdict: 'BUY' | 'ACCUMULATE' | 'HOLD' | 'REDUCE' | 'SELL';
  agreement: string;
  engine: string;
  dataTier: string;
  rationale: string;
  invalidationGate: string;
  resolutionState: 'PENDING' | 'VALIDATED' | 'INVALIDATED';
  resolutionNote: string;
  benchmarkPrice: string;
  invalidationStop: string;
  stopMargin: string;
  distributionBull: number;
  distributionBear: number;
  leadSynthesis: string;
  evidenceItems: { title: string; meta: string }[];
  horizonTotal: number;
  horizonRemaining: number;
  currentMark: string;
}

export interface TrackedEquity {
  ticker: string;
  exchange: string;
  category: string;
  lastClose: string;
  delta24h: string;
  isPositive: boolean;
  stance: 'ACCUMULATE' | 'HOLD' | 'REDUCE' | 'BUY' | 'PENDING';
  bullSpread: number;
  bearSpread: number;
  invalidationGate: string;
  evidenceStrength: 'Strong' | 'Moderate' | 'Firm' | 'Divergent' | 'Syncing';
}
