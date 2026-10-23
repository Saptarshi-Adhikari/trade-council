import { AssetAnalysisData, CandlePoint, DecisionRecord } from '../types/terminal';

// In production on Vercel, requests to /api/* are served by the backend function via rewrites.
// When running locally, it falls back to VITE_API_BASE_URL or http://localhost:8000.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined 
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

export interface BackendConfigResponse {
  llm_provider: string;
  primary_model: string;
  quick_model: string;
  deep_model: string;
  fallback_model: string;
  provider_connected: boolean;
  model_available: boolean;
  active_models: string[];
  backboard_enabled: boolean;
  backboard_configured: boolean;
  gemini_second_opinion_available: boolean;
  holding_period_days: number;
}

export interface MarketSnapshotResponse {
  ticker: string;
  lastPrice: string;
  rawPrice?: number;
  dayChange: string;
  isPositive: boolean;
  dayHigh: string;
  dayLow: string;
  volume: string;
  avgVolume20D: string;
  currency: string;
  exchange: string;
  candles: CandlePoint[];
  indicators: {
    ema20: number;
    ema50: number;
    vwap: number;
    rsi: number;
    ohlcHigh: string;
    ohlcLow: string;
  };
  status: 'live' | 'unavailable' | 'stale';
  observationTime?: string;
  error?: string;
}

export async function checkBackendHealth(): Promise<{ healthy: boolean; activeJobs?: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/health`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      return { healthy: true, activeJobs: data.active_jobs ?? 0 };
    }
    return { healthy: false };
  } catch {
    return { healthy: false };
  }
}

export async function fetchBackendConfig(): Promise<BackendConfigResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/config`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Failed to fetch backend config:', err);
  }
  return null;
}

export async function fetchMarketSnapshot(ticker: string): Promise<MarketSnapshotResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/market/snapshot?ticker=${encodeURIComponent(ticker)}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Failed to fetch market snapshot:', err);
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

/**
 * Connect to the Server-Sent Events stream for an active analysis.
 * Automatically falls back to snapshot polling if SSE disconnects.
 */
export function subscribeToAnalysisEvents(
  analysisId: string,
  onProgress: (status: AnalysisStatusResponse) => void,
  onCompleted: (result: AssetAnalysisData) => void,
  onError: (error: string) => void
): () => void {
  let eventSource: EventSource | null = null;
  let isClosed = false;

  const cleanup = () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };

  try {
    eventSource = new EventSource(`${API_BASE_URL}/api/v1/analyses/${encodeURIComponent(analysisId)}/events`);

    eventSource.addEventListener('analysis.status', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        onProgress(data);
      } catch {
        // ignore parse error
      }
    });

    eventSource.addEventListener('analysis.completed', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.result) {
          onCompleted(data.result);
        }
      } catch {
        // ignore
      }
      cleanup();
    });

    eventSource.addEventListener('analysis.failed', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        onError(data.error || 'Analysis failed on backend');
      } catch {
        onError('Analysis failed on backend');
      }
      cleanup();
    });

    eventSource.onerror = () => {
      if (!isClosed) {
        // Fall back to HTTP polling if SSE encounters a proxy/disconnect issue
        cleanup();
        let pollCount = 0;
        const interval = setInterval(async () => {
          if (isClosed) {
            clearInterval(interval);
            return;
          }
          pollCount++;
          try {
            const res = await pollAnalysisStatus(analysisId);
            onProgress(res);
            if (res.status === 'completed' && res.result) {
              clearInterval(interval);
              onCompleted(res.result);
            } else if (res.status === 'failed') {
              clearInterval(interval);
              onError(res.error || 'Analysis failed');
            } else if (pollCount > 120) {
              clearInterval(interval);
              onError('Analysis polling timed out');
            }
          } catch {
            // keep polling
          }
        }, 1500);
      }
    };
  } catch (err) {
    // Immediate polling fallback
    let pollCount = 0;
    const interval = setInterval(async () => {
      if (isClosed) {
        clearInterval(interval);
        return;
      }
      pollCount++;
      try {
        const res = await pollAnalysisStatus(analysisId);
        onProgress(res);
        if (res.status === 'completed' && res.result) {
          clearInterval(interval);
          onCompleted(res.result);
        } else if (res.status === 'failed') {
          clearInterval(interval);
          onError(res.error || 'Analysis failed');
        } else if (pollCount > 120) {
          clearInterval(interval);
          onError('Analysis polling timed out');
        }
      } catch {
        // keep polling
      }
    }, 1500);
  }

  return cleanup;
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
