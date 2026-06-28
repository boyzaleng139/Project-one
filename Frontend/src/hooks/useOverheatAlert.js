import { useEffect, useRef, useCallback, useState } from 'react';

const LS_MUTED     = 'overheat_muted';
const LS_THRESHOLD = 'overheat_threshold';
const DEFAULT_THRESHOLD = 70;

function readLS(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}

function writeLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota / private mode */ }
}

/**
 * Overheat alert system.
 *
 * - Tracks whether current temperature exceeds a user-configurable threshold
 * - Plays a repeating beep via Web Audio API while alerting (unless muted)
 * - Fires a Browser Notification once per alert onset
 * - Auto-clears when temperature drops below threshold
 *
 * Does NOT touch the existing 50/70 zone colours — this threshold
 * controls only the alert system.
 *
 * @param {number} temperature  Current temperature from useLiveData
 * @returns {{ isAlerting, isMuted, threshold, toggleMute, setThreshold, requestNotifPermission }}
 */
export function useOverheatAlert(temperature) {
  const [isMuted,   setMuted]   = useState(() => readLS(LS_MUTED, false));
  const [threshold, _setThr]    = useState(() => readLS(LS_THRESHOLD, DEFAULT_THRESHOLD));
  const [notifPerm, setNotifPerm] = useState(() => {
    try { return Notification.permission; } catch { return 'denied'; }
  });

  const audioCtxRef  = useRef(null);
  const beepTimerRef = useRef(null);
  const wasAlerting  = useRef(false);

  const isAlerting = temperature > threshold;

  /* ── Persist settings ─────────────────────────────────────── */
  const toggleMute = useCallback(() => {
    setMuted(prev => { const next = !prev; writeLS(LS_MUTED, next); return next; });
  }, []);

  const setThreshold = useCallback((v) => {
    const n = Math.max(30, Math.min(100, Number(v) || DEFAULT_THRESHOLD));
    _setThr(n);
    writeLS(LS_THRESHOLD, n);
  }, []);

  /* ── Notification permission (only on explicit user action) ── */
  const requestNotifPermission = useCallback(async () => {
    try {
      if (!('Notification' in window)) return;
      const perm = await Notification.requestPermission();
      setNotifPerm(perm);
    } catch { /* browser blocked it */ }
  }, []);

  /* ── Web Audio beep helper ──────────────────────────────── */
  const startBeep = useCallback(() => {
    if (beepTimerRef.current) return;
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;

      const playOnce = () => {
        if (ctx.state === 'suspended') ctx.resume();
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type      = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      };

      playOnce();
      beepTimerRef.current = setInterval(playOnce, 1800);
    } catch { /* Web Audio not supported */ }
  }, []);

  const stopBeep = useCallback(() => {
    if (beepTimerRef.current) {
      clearInterval(beepTimerRef.current);
      beepTimerRef.current = null;
    }
  }, []);

  /* ── React to alert state changes ──────────────────────── */
  useEffect(() => {
    if (isAlerting && !wasAlerting.current) {
      // onset
      if (!isMuted) startBeep();
      if (notifPerm === 'granted') {
        try {
          new Notification('⚠️ อุณหภูมิสูงเกินเกณฑ์', {
            body: `อุณหภูมิปัจจุบัน ${temperature.toFixed(1)}°C (เกณฑ์ ${threshold}°C)`,
            icon: '/favicon.ico',
            tag: 'overheat',
          });
        } catch { /* noop */ }
      }
    }

    if (!isAlerting && wasAlerting.current) {
      stopBeep();
    }

    wasAlerting.current = isAlerting;
  }, [isAlerting, isMuted, startBeep, stopBeep, notifPerm, temperature, threshold]);

  /* Stop beep if user mutes while alerting */
  useEffect(() => {
    if (isMuted) stopBeep();
    else if (isAlerting) startBeep();
  }, [isMuted, isAlerting, startBeep, stopBeep]);

  /* Cleanup on unmount */
  useEffect(() => () => stopBeep(), [stopBeep]);

  return {
    isAlerting,
    isMuted,
    threshold,
    toggleMute,
    setThreshold,
    requestNotifPermission,
    notifPerm,
  };
}
