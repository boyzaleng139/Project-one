import { useEffect } from 'react';

function zoneIcon(temp) {
  if (temp <= 50) return '🟢';
  if (temp <= 70) return '🟡';
  return '🔴';
}

/**
 * Keeps the browser tab title in sync with the current temperature.
 * e.g. "🟡 58.2°C • Hot Air Dryer"
 *
 * @param {number} temperature
 */
export function useDocumentTitle(temperature) {
  useEffect(() => {
    document.title = `${zoneIcon(temperature)} ${temperature.toFixed(1)}°C • Hot Air Dryer`;
  }, [temperature]);
}
