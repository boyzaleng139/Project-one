import { useState, useEffect, useRef } from 'react';

const INTERVAL_MS  = 3000;   // 3 s between updates
const MAX_CHART    = 20;     // chart keeps last 20 points
const MAX_HISTORY  = 200;    // history table keeps last 200 rows
const INITIAL_TEMP = 60;     // starting temperature (°C)

/** Format a Date as HH:MM:SS in Thai locale */
function toTimeStr(date) {
  return date.toLocaleTimeString('th-TH', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
}

/**
 * Simulates temperature readings (random walk ±0.5 °C, clamped 30–95 °C).
 *
 * Returns
 *   temperature : number            — current value
 *   chartData   : [{time, temp}]   — last 20 pts, ASC (oldest → newest)
 *   history     : [{time, temp, timestamp}]  — last 200 pts, DESC (newest first)
 *   lastUpdate  : Date
 *   isConnected : true  (always — simulated)
 */
export function useMockData() {
  const [temperature, setTemperature] = useState(INITIAL_TEMP);
  const [chartData,   setChartData]   = useState([]);
  const [history,     setHistory]     = useState([]);
  const [lastUpdate,  setLastUpdate]  = useState(() => new Date());

  const tempRef = useRef(INITIAL_TEMP);

  useEffect(() => {
    /* Pre-fill 10 historical points so chart is visible immediately */
    const now = Date.now();
    const initial = Array.from({ length: 10 }, (_, i) => {
      const d    = new Date(now - (9 - i) * INTERVAL_MS);
      const temp = Math.round((INITIAL_TEMP + (Math.random() - 0.5) * 2) * 10) / 10;
      return { time: toTimeStr(d), temp, timestamp: d.toISOString() };
    });
    setChartData(initial);
    setHistory([...initial].reverse());          // history is DESC

    const timer = setInterval(() => {
      /* Random walk ±0.5 °C */
      const delta = (Math.random() - 0.5) * 1.0;
      const next  = Math.max(30, Math.min(95, tempRef.current + delta));
      tempRef.current = next;

      const rounded = Math.round(next * 10) / 10;
      const ts      = new Date();
      const point   = { time: toTimeStr(ts), temp: rounded, timestamp: ts.toISOString() };

      setTemperature(rounded);
      setLastUpdate(ts);
      setChartData(prev => [...prev, point].slice(-MAX_CHART));
      setHistory(prev   => [point, ...prev].slice(0, MAX_HISTORY));
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return { temperature, chartData, history, lastUpdate, isConnected: true };
}
