export interface AgentOpinion {
  id: string;
  name: string;
  role: string;
  stance: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  weight: number;
  confidence: number; // 0 to 1
  latencyMs: number;
}

export interface CouncilConsensusResult {
  verdict: 'BUY' | 'ACCUMULATE / MILD BUY' | 'HOLD' | 'REDUCE' | 'SELL';
  consensusWeight: number; // percentage e.g. 68
  agreeCount: number;
  totalAgents: number;
  bullishScore: number;
  bearishScore: number;
  riskApproved: boolean;
}

/**
 * Calculates weighted multi-agent consensus verdict and agreement count.
 */
export function calculateConsensus(
  opinions: AgentOpinion[],
  riskThresholdVaR: number = 3.5
): CouncilConsensusResult {
  if (!opinions.length) {
    return {
      verdict: 'HOLD',
      consensusWeight: 50,
      agreeCount: 0,
      totalAgents: 0,
      bullishScore: 0,
      bearishScore: 0,
      riskApproved: true,
    };
  }

  let totalWeight = 0;
  let bullishWeight = 0;
  let bearishWeight = 0;

  for (const op of opinions) {
    totalWeight += op.weight;
    if (op.stance === 'BULLISH') {
      bullishWeight += op.weight * op.confidence;
    } else if (op.stance === 'BEARISH') {
      bearishWeight += op.weight * op.confidence;
    }
  }

  const bullishScore = totalWeight > 0 ? (bullishWeight / totalWeight) * 100 : 0;
  const bearishScore = totalWeight > 0 ? (bearishWeight / totalWeight) * 100 : 0;

  let verdict: CouncilConsensusResult['verdict'] = 'HOLD';
  let consensusWeight = 50;

  if (bullishScore >= 75) {
    verdict = 'BUY';
    consensusWeight = Math.round(bullishScore);
  } else if (bullishScore >= 55) {
    verdict = 'ACCUMULATE / MILD BUY';
    consensusWeight = Math.round(bullishScore);
  } else if (bearishScore >= 75) {
    verdict = 'SELL';
    consensusWeight = Math.round(bearishScore);
  } else if (bearishScore >= 55) {
    verdict = 'REDUCE';
    consensusWeight = Math.round(bearishScore);
  } else {
    verdict = 'HOLD';
    consensusWeight = Math.round(100 - Math.abs(bullishScore - bearishScore));
  }

  // Count agents agreeing with general directional stance
  const isBullishDirection = verdict === 'BUY' || verdict === 'ACCUMULATE / MILD BUY';
  const isBearishDirection = verdict === 'SELL' || verdict === 'REDUCE';

  const agreeCount = opinions.filter(op => {
    if (isBullishDirection) return op.stance === 'BULLISH';
    if (isBearishDirection) return op.stance === 'BEARISH';
    return op.stance === 'NEUTRAL';
  }).length;

  return {
    verdict,
    consensusWeight,
    agreeCount,
    totalAgents: opinions.length,
    bullishScore: Math.round(bullishScore),
    bearishScore: Math.round(bearishScore),
    riskApproved: riskThresholdVaR <= 4.0,
  };
}

/**
 * Calculates invalidation margin percentage between benchmark and stop loss.
 */
export function calculateInvalidationMargin(benchmarkPrice: number, stopLoss: number): number {
  if (benchmarkPrice <= 0) return 0;
  const delta = ((stopLoss - benchmarkPrice) / benchmarkPrice) * 100;
  return Math.round(delta * 100) / 100;
}
