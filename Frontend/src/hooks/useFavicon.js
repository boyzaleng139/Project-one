import { useEffect, useRef } from 'react';

function zoneColor(temp) {
  if (temp <= 50) return '#3B82F6';
  if (temp <= 70) return '#F59E0B';
  return '#EF4444';
}

/**
 * Generates a tiny coloured-circle favicon via canvas so the browser
 * tab shows the temperature zone at a glance (blue / orange / red).
 *
 * @param {number} temperature
 */
export function useFavicon(temperature) {
  const prevColor = useRef('');

  useEffect(() => {
    const color = zoneColor(temperature);
    if (color === prevColor.current) return;
    prevColor.current = color;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.beginPath();
      ctx.arc(16, 16, 14, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(16, 16, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = canvas.toDataURL('image/png');
    } catch { /* canvas not supported (SSR / test) */ }
  }, [temperature]);
}
