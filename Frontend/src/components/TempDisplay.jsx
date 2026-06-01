import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/* ── Helper ──────────────────────────────────────────────── */

/**
 * Map a temperature value to its semantic CSS colour variable.
 * ≤ 50°C → blue (cold)   51–70°C → orange (warm)   > 70°C → red (hot)
 */
const getTempColor = (temp) => {
  if (temp <= 50) return 'var(--cold)';
  if (temp <= 70) return 'var(--warm)';
  return 'var(--hot)';
};

/** Format an ISO timestamp to Thai locale HH:MM:SS */
function formatTime(iso) {
  if (!iso) return '–';
  try {
    return new Date(iso).toLocaleTimeString('th-TH', {
      hour:   '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return iso;
  }
}

/* ── Colour legend pills ─────────────────────────────────── */
const LEGEND = [
  { dot: 'var(--cold)', label: '≤50°C'   },
  { dot: 'var(--warm)', label: '51–70°C' },
  { dot: 'var(--hot)',  label: '>70°C'   },
];

/* ── TempDisplay ─────────────────────────────────────────── */

/**
 * Hero temperature card — the main focus of the dashboard.
 * Shows the current temperature as a large coloured number, the last update
 * time, and a compact colour legend.
 *
 * Triggers a brief `.pulse` scale animation whenever `temp` changes.
 *
 * @param {{ temp: number, timestamp: string|null }} props
 */
export default function TempDisplay({ temp, timestamp }) {
  const [pulsing, setPulsing] = useState(false);
  const color = getTempColor(temp);

  /* Pulse animation on every new temperature value */
  useEffect(() => {
    setPulsing(true);
    const t = setTimeout(() => setPulsing(false), 400);
    return () => clearTimeout(t);
  }, [temp]);

  return (
    <div className="temp-display" style={{ borderLeftColor: color }}>
      {/* Card heading */}
      <p className="temp-display-heading">🌡️ อุณหภูมิปัจจุบัน</p>

      {/* Big number */}
      <div className={`temp-display-value${pulsing ? ' pulse' : ''}`}>
        <span className="temp-number" style={{ color }}>
          {temp.toFixed(1)}
        </span>
        <span className="temp-unit" style={{ color }}>°C</span>
      </div>

      {/* Last-update timestamp */}
      <p className="temp-timestamp">
        🕐 อัปเดต: <span>{formatTime(timestamp)}</span>
      </p>

      {/* Colour legend */}
      <div className="temp-legend">
        {LEGEND.map(({ dot, label }) => (
          <span key={label} className="legend-pill">
            <span
              className="legend-dot"
              style={{ background: dot }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

TempDisplay.defaultProps = {
  timestamp: null,
};

TempDisplay.propTypes = {
  temp:      PropTypes.number.isRequired,
  timestamp: PropTypes.string,
};
