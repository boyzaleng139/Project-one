import { useEffect, useState, useRef } from 'react';
import { io }         from 'socket.io-client';
import { getHistory } from '../api/sensorApi';

const SOCKET_URL  = import.meta.env.VITE_BACKEND_URL ?? '';
const MAX_CHART   = 20;
const MAX_HISTORY = 200;

/* ── Helpers ─────────────────────────────────────────────── */

function toTimeStr(iso) {
  return new Date(iso).toLocaleTimeString('th-TH', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
}

/**
 * Normalise a raw API/socket row into the shape all components expect:
 * { time: string, temp: number, timestamp: string }
 */
function toPoint(row) {
  return {
    time:      toTimeStr(row.timestamp),
    temp:      parseFloat(row.temp),
    timestamp: row.timestamp instanceof Date
      ? row.timestamp.toISOString()
      : String(row.timestamp),
  };
}

/* ── useLiveData ─────────────────────────────────────────── */

/**
 * Streams live temperature data from the Backend.
 *
 * On mount: pre-fetches the last 200 rows from REST so the chart
 * is populated before the first socket event arrives.
 *
 * On each `sensor_update` socket event: updates temperature, chart
 * buffer (ASC, last 20), and history list (DESC, newest first).
 *
 * Returns the same shape expected by all Dashboard and History
 * components.
 *
 * @returns {{
 *   temperature:  number,
 *   chartData:    Array<{time: string, temp: number}>,
 *   history:      Array<{time: string, temp: number, timestamp: string}>,
 *   lastUpdate:   Date,
 *   isConnected:  boolean,
 * }}
 */
export function useLiveData() {
  const [temperature, setTemperature] = useState(0);
  const [lastUpdate,  setLastUpdate]  = useState(() => new Date());
  const [chartData,   setChartData]   = useState([]);
  const [history,     setHistory]     = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Mutable chart buffer avoids stale-closure issues inside socket handler
  const chartBuf = useRef([]);

  /* ── Pre-load history from REST API ──────────────────────── */
  useEffect(() => {
    getHistory({ limit: MAX_HISTORY })
      .then((data) => {
        if (!data.length) return;

        // API returns DESC (newest first)
        const desc      = data.map(toPoint);
        // Chart needs ASC (oldest → newest), last MAX_CHART points
        const chartSlice = [...desc].reverse().slice(-MAX_CHART);

        chartBuf.current = chartSlice;
        setChartData(chartSlice);
        setHistory(desc);
        setTemperature(desc[0].temp);
        setLastUpdate(new Date(desc[0].timestamp));
      })
      .catch((err) =>
        console.error('[useLiveData] pre-load failed:', err.message)
      );
  }, []);

  /* ── Real-time Socket.io connection ──────────────────────── */
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports:           ['websocket', 'polling'],
      reconnectionDelay:    1000,
      reconnectionAttempts: Infinity,
    });

    socket.on('connect',       () => setIsConnected(true));
    socket.on('disconnect',    () => setIsConnected(false));
    socket.on('connect_error', () => setIsConnected(false));

    socket.on('sensor_update', (payload) => {
      const point = toPoint(payload);

      setTemperature(point.temp);
      setLastUpdate(new Date(point.timestamp));

      // Chart: append to ASC buffer, keep last MAX_CHART
      const nextChart = [...chartBuf.current, point].slice(-MAX_CHART);
      chartBuf.current = nextChart;
      setChartData(nextChart);

      // History: prepend (DESC), cap at MAX_HISTORY
      setHistory((prev) => [point, ...prev].slice(0, MAX_HISTORY));
    });

    return () => socket.disconnect();
  }, []);

  return { temperature, chartData, history, lastUpdate, isConnected };
}
