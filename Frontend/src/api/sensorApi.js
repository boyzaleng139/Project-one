import axios from 'axios';

const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Shared axios instance — all sensor API calls go through here.
 * baseURL : backend origin
 * timeout : 5 s hard limit
 */
const api = axios.create({
  baseURL: BASE,
  timeout: 5000,
});

/* ── Request interceptor ─────────────────────────────────── */
api.interceptors.request.use((config) => {
  console.log(`[API →] ${(config.method ?? 'get').toUpperCase()} ${config.url}`);
  return config;
});

/* ── Response error interceptor ─────────────────────────── */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.error ?? err.message ?? 'Request failed';
    console.error('[API] Error:', msg);
    return Promise.reject(new Error(msg));
  }
);

/**
 * Fetch the single most-recent temperature reading.
 * @returns {Promise<{ id: number, temp: number, timestamp: string }>}
 */
export function getLatest() {
  return api.get('/api/sensors/latest').then((r) => r.data);
}

/**
 * Fetch historical temperature readings.
 * @param {{ limit?: number, from?: string, to?: string }} [params]
 * @returns {Promise<Array<{ id: number, temp: number, timestamp: string }>>}
 */
export function getHistory(params = {}) {
  return api.get('/api/sensors/history', { params }).then((r) => r.data);
}
