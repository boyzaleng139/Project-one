import { useMemo } from 'react';

/**
 * Compute temperature trend from chartData (ASC, oldest → newest).
 *
 * Uses linear regression slope over the last N points. Returns:
 *   direction  'up' | 'down' | 'flat'
 *   rate       °C per minute (absolute)
 *   label      formatted string like "▲ +2.3°C/นาที"
 *   etaMinutes estimated minutes until alertThreshold is reached
 *              (null if not rising toward it or data insufficient)
 *
 * @param {Array<{time: string, temp: number}>} chartData   ASC order
 * @param {number} alertThreshold  e.g. 70
 */
export function useTrend(chartData, alertThreshold) {
  return useMemo(() => {
    const FLAT_THRESHOLD = 0.05; // °C/min below which we call it flat
    const INTERVAL_SEC   = 3;    // each data point ≈ 3 s apart

    if (!chartData || chartData.length < 2) {
      return { direction: 'flat', rate: 0, label: '— ไม่มีข้อมูล', etaMinutes: null };
    }

    // Use last 10 points (≈30 s window) to smooth out jitter
    const pts = chartData.slice(-Math.min(10, chartData.length));
    const n   = pts.length;

    // Least-squares slope (y = temp, x = index)
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
      const t = parseFloat(pts[i].temp);
      if (Number.isNaN(t)) continue;
      sumX  += i;
      sumY  += t;
      sumXY += i * t;
      sumXX += i * i;
    }
    const denom = n * sumXX - sumX * sumX;
    if (denom === 0) {
      return { direction: 'flat', rate: 0, label: '→ คงที่', etaMinutes: null };
    }

    const slopePerPoint = (n * sumXY - sumX * sumY) / denom;
    const slopePerMin   = (slopePerPoint / INTERVAL_SEC) * 60;

    const absRate = Math.abs(slopePerMin);
    let direction = 'flat';
    if (absRate > FLAT_THRESHOLD) direction = slopePerMin > 0 ? 'up' : 'down';

    const arrow = direction === 'up' ? '▲' : direction === 'down' ? '▼' : '→';
    const sign  = direction === 'up' ? '+' : direction === 'down' ? '−' : '';
    const label = direction === 'flat'
      ? '→ คงที่'
      : `${arrow} ${sign}${absRate.toFixed(1)}°C/นาที`;

    // ETA: only useful when rising toward threshold
    let etaMinutes = null;
    if (direction === 'up' && slopePerMin > 0) {
      const lastTemp = parseFloat(pts[n - 1].temp);
      if (!Number.isNaN(lastTemp) && lastTemp < alertThreshold) {
        const remaining = alertThreshold - lastTemp;
        const eta = remaining / slopePerMin;
        if (eta > 0 && eta < 120) etaMinutes = eta;
      }
    }

    return { direction, rate: absRate, label, etaMinutes };
  }, [chartData, alertThreshold]);
}
