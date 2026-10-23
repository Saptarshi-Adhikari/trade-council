import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateConsensus, calculateInvalidationMargin, AgentOpinion } from './council';

test('calculateConsensus returns ACCUMULATE / MILD BUY when bullish score is in 55-75 range', () => {
  const opinions: AgentOpinion[] = [
    { id: '1', name: 'Technical', role: 'TA', stance: 'BULLISH', weight: 1.0, confidence: 0.8, latencyMs: 840 },
    { id: '2', name: 'Fundamental', role: 'FA', stance: 'BULLISH', weight: 1.0, confidence: 0.75, latencyMs: 1420 },
    { id: '3', name: 'Sentiment', role: 'Sent', stance: 'BULLISH', weight: 0.8, confidence: 0.6, latencyMs: 910 },
    { id: '4', name: 'Bull Researcher', role: 'Debater', stance: 'BULLISH', weight: 1.2, confidence: 0.85, latencyMs: 1080 },
    { id: '5', name: 'Bear Researcher', role: 'Debater', stance: 'BEARISH', weight: 1.0, confidence: 0.7, latencyMs: 1050 },
  ];

  const result = calculateConsensus(opinions, 3.5);
  assert.equal(result.verdict, 'ACCUMULATE / MILD BUY');
  assert.equal(result.totalAgents, 5);
  assert.equal(result.agreeCount, 4);
  assert.equal(result.riskApproved, true);
  assert.ok(result.consensusWeight >= 60 && result.consensusWeight <= 75);
});

test('calculateConsensus returns HOLD for balanced bull/bear debate', () => {
  const opinions: AgentOpinion[] = [
    { id: '1', name: 'Technical', role: 'TA', stance: 'BULLISH', weight: 1.0, confidence: 0.5, latencyMs: 800 },
    { id: '2', name: 'Fundamental', role: 'FA', stance: 'BEARISH', weight: 1.0, confidence: 0.5, latencyMs: 900 },
    { id: '3', name: 'Sentiment', role: 'Sent', stance: 'NEUTRAL', weight: 1.0, confidence: 0.5, latencyMs: 700 },
  ];

  const result = calculateConsensus(opinions);
  assert.equal(result.verdict, 'HOLD');
});

test('calculateInvalidationMargin computes correct percentage', () => {
  const margin = calculateInvalidationMargin(2741.80, 2695.00);
  assert.equal(margin, -1.71);
});
