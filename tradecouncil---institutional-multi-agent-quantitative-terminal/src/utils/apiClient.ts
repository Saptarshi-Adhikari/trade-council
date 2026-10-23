import { AssetAnalysisData, DecisionRecord } from '../types/terminal';

// When running under Vercel multi-service routing, /api is rewritten to the backend service.
// In standalone local dev without Vercel rewrites, it falls back to VITE_API_BASE_URL or http://localhost:8000.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined 
  ? import.meta.env.VITE_API_BASE_URL 
  : (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'http://localhost:8000');

export interface AnalysisStatusResponse {
  analysis_id: string;
  ticker: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress?: string;
  result?: AssetAnalysisData;
  error?: string;
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchBackendConfig(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/config`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Failed to fetch backend config:', err);
  }
  return null;
}

export async function triggerLiveAnalysis(
  ticker: string,
  analysisDate?: string,
  timeframe: string = '1D'
): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/v1/analyses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ticker,
      analysis_date: analysisDate,
      timeframe,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Analysis submission failed (${res.status}): ${errBody}`);
  }

  const data = await res.json();
  return data.analysis_id;
}

export async function pollAnalysisStatus(analysisId: string): Promise<AnalysisStatusResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/analyses/${analysisId}`);
  if (!res.ok) {
    throw new Error(`Failed to query status (${res.status})`);
  }
  return await res.json();
}

export async function fetchBackendHistory(): Promise<DecisionRecord[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/history`);
    if (res.ok) {
      const data = await res.json();
      return data.records || [];
    }
  } catch (err) {
    console.warn('Could not fetch backend history:', err);
  }
  return [];
}
