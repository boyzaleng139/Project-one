import { useEffect, useRef, useState } from 'react';

/**
 * Tracks how long the socket has been continuously connected.
 * Returns a Thai-language human-readable string like "เชื่อมต่อมาแล้ว 5 นาที".
 * Returns null when disconnected.
 *
 * @param {boolean} isConnected
 * @returns {string|null}
 */
export function useConnectionUptime(isConnected) {
  const connectedAt = useRef(null);
  const [label, setLabel] = useState(null);

  useEffect(() => {
    if (isConnected) {
      if (!connectedAt.current) connectedAt.current = Date.now();
    } else {
      connectedAt.current = null;
      setLabel(null);
    }
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected) return;

    const tick = () => {
      if (!connectedAt.current) return;
      const sec = Math.floor((Date.now() - connectedAt.current) / 1000);
      if (sec < 60) {
        setLabel(`เชื่อมต่อมาแล้ว ${sec} วินาที`);
      } else if (sec < 3600) {
        setLabel(`เชื่อมต่อมาแล้ว ${Math.floor(sec / 60)} นาที`);
      } else {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        setLabel(`เชื่อมต่อมาแล้ว ${h} ชม. ${m} นาที`);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isConnected]);

  return label;
}
