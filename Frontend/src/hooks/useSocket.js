import { useEffect, useState, useRef, useMemo } from 'react';
import { io }         from 'socket.io-client';
import { getHistory } from '../api/sensorApi';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const MAX_HISTORY = 100;

/**
 * Connects to the Socket.io server and streams live temperature readings.
 *
 * On mount pre-fetches the last 100 rows so the chart is populated before the
 * first socket event.  History is kept in **ascending** order (oldest → newest).
 *
 * `sessionStart` is the ISO timestamp of the very first reading in the current
 * browser session.  It is set exactly once (guarded by a ref) from either the
 * preloaded history or the first live socket event, whichever comes first.
 *
 * `dryingSeconds` is derived via useMemo — never stored in backend.
 *
 * @returns {{
 *   currentTemp:    number,
 *   lastTimestamp:  string|null,
 *   sessionStart:   string|null,
 *   dryingSeconds:  number,
 *   history:        Array<{ id: number, temp: number, timestamp: string }>,
 *   isConnected:    boolean,
 * }}
 */
export function useSocket() {
  const [currentTemp,   setCurrentTemp]   = useState(0);
  const [lastTimestamp, setLastTimestamp] = useState(null);
  const [sessionStart,  setSessionStart]  = useState(null);
  const [history,       setHistory]       = useState([]);
  const [isConnected,   setIsConnected]   = useState(false);

  const socketRef      = useRef(null);
  const sessionStarted = useRef(false);   // guard — set sessionStart only once

  /* ── Helper: set session start exactly once ──────────────── */
  const markSessionStart = (iso) => {
    if (sessionStarted.current) return;
    sessionStarted.current = true;
    setSessionStart(iso);
  };

  /* ── Pre-load chart history on mount ──────────────────────── */
  useEffect(() => {
    getHistory({ limit: MAX_HISTORY })
      .then((data) => {
        if (data.length === 0) return;
        // API returns DESC (newest-first) → reverse to ASC for chart
        const asc = [...data].reverse();
        setHistory(asc);
        // Seed current readings from newest row (data[0])
        setCurrentTemp(parseFloat(data[0].temp));
        setLastTimestamp(data[0].timestamp);
        // Oldest row in ASC array = asc[0] — use as session start
        markSessionStart(asc[0].timestamp);
      })
      .catch((err) =>
        console.error('[useSocket] pre-load failed:', err.message)
      );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Real-time socket connection ───────────────────────────── */
  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports:           ['websocket', 'polling'],
      reconnectionDelay:    1000,
      reconnectionAttempts: Infinity,
    });
    socketRef.current = socket;

    socket.on('connect',       () => setIsConnected(true));
    socket.on('disconnect',    () => setIsConnected(false));
    socket.on('connect_error', () => setIsConnected(false));

    socket.on('sensor_update', (payload) => {
      setCurrentTemp(parseFloat(payload.temp));
      setLastTimestamp(payload.timestamp);
      // Mark session start from the first live event (if preload was empty)
      markSessionStart(payload.timestamp);
      // Append to end (ASC), keep the last MAX_HISTORY entries
      setHistory((prev) => [...prev, payload].slice(-MAX_HISTORY));
    });

    return () => socket.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Derived: elapsed drying seconds ────────────────────────── */
  const dryingSeconds = useMemo(() => {
    if (!sessionStart || !lastTimestamp) return 0;
    const diff = new Date(lastTimestamp) - new Date(sessionStart);
    return Math.max(0, Math.floor(diff / 1000));
  }, [sessionStart, lastTimestamp]);

  return { currentTemp, lastTimestamp, sessionStart, dryingSeconds, history, isConnected };
}
