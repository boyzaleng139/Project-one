import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/* ── Helpers ─────────────────────────────────────────────── */

function getTempStatus(temp) {
  if (temp <= 50) return { label: 'ปกติ',  color: '#3B82F6', bg: '#EFF6FF' };
  if (temp <= 70) return { label: 'อุ่น',  color: '#F59E0B', bg: '#FFFBEB' };
  return              { label: 'ร้อน',  color: '#EF4444', bg: '#FEF2F2' };
}

const LEGEND = [
  { color: '#3B82F6', label: 'ปกติ ≤50°C'  },
  { color: '#F59E0B', label: 'อุ่น 51–70°C' },
  { color: '#EF4444', label: 'ร้อน >70°C'  },
];

/* ── 3-Zone Progress Bar ─────────────────────────────────── */

/**
 * Horizontal bar divided into blue / orange / red zones.
 * The zones represent 0–50 / 50–70 / 70–100 °C.
 * A white dot slides to the current temperature position.
 */
function ProgressBar({ temp }) {
  const N_END  = 50;   // normal zone ends at 50 °C  →  50 % of bar
  const W_END  = 70;   // warm zone ends at 70 °C     →  70 % of bar
  const MAX    = 100;

  const pct       = Math.min(Math.max((temp / MAX) * 100, 0), 100);
  const indColor  = temp <= N_END ? '#3B82F6' : temp <= W_END ? '#F59E0B' : '#EF4444';

  /* How much of each zone is filled (as % of the whole bar) */
  const normFill = Math.min(pct, N_END);
  const warmFill = pct > N_END ? Math.min(pct - N_END, W_END - N_END) : 0;
  const hotFill  = pct > W_END ? Math.min(pct - W_END, MAX - W_END)   : 0;

  const bar = { position: 'absolute', top: 0, height: '100%' };

  return (
    <div style={{ marginTop: '20px' }}>

      {/* ── Track ── */}
      <div style={{ position: 'relative', height: '10px', borderRadius: '5px',
                    background: 'var(--border)', overflow: 'visible' }}>

        {/* Zone background tints */}
        <div style={{ ...bar, left: 0,          width: `${N_END}%`,
                      background: 'rgba(59,130,246,0.10)',  borderRadius: '5px 0 0 5px' }} />
        <div style={{ ...bar, left: `${N_END}%`, width: `${W_END - N_END}%`,
                      background: 'rgba(245,158,11,0.10)' }} />
        <div style={{ ...bar, left: `${W_END}%`, width: `${MAX - W_END}%`,
                      background: 'rgba(239,68,68,0.10)',   borderRadius: '0 5px 5px 0' }} />

        {/* Filled segments */}
        {normFill > 0 && (
          <div style={{ ...bar, left: 0, width: `${normFill}%`, background: '#3B82F6',
                        borderRadius: `5px ${normFill >= N_END ? 0 : 5}px ${normFill >= N_END ? 0 : 5}px 5px`,
                        transition: 'width 0.45s ease' }} />
        )}
        {warmFill > 0 && (
          <div style={{ ...bar, left: `${N_END}%`, width: `${warmFill}%`, background: '#F59E0B',
                        transition: 'width 0.45s ease' }} />
        )}
        {hotFill > 0 && (
          <div style={{ ...bar, left: `${W_END}%`, width: `${hotFill}%`, background: '#EF4444',
                        borderRadius: '0 5px 5px 0', transition: 'width 0.45s ease' }} />
        )}

        {/* Zone dividers */}
        <div style={{ ...bar, left: `${N_END}%`, width: '2px',
                      background: 'var(--bg)', opacity: 0.9, zIndex: 2 }} />
        <div style={{ ...bar, left: `${W_END}%`, width: '2px',
                      background: 'var(--bg)', opacity: 0.9, zIndex: 2 }} />

        {/* Sliding indicator dot */}
        <div style={{
          position:    'absolute',
          left:        `calc(${pct}% - 9px)`,
          top:         '-5px',
          width:       '20px',
          height:      '20px',
          borderRadius:'50%',
          background:  '#FFFFFF',
          border:      `2.5px solid ${indColor}`,
          boxShadow:   '0 1px 4px rgba(0,0,0,0.15)',
          zIndex:      3,
          transition:  'left 0.45s ease, border-color 0.3s',
        }} />
      </div>

      {/* ── Scale labels ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between',
                    position: 'relative', marginTop: '15px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>0°C</span>
        <span style={{ fontSize: '11px', color: '#3B82F6',
                       position: 'absolute', left: `${N_END}%`, transform: 'translateX(-50%)' }}>
          50°C
        </span>
        <span style={{ fontSize: '11px', color: '#F59E0B',
                       position: 'absolute', left: `${W_END}%`, transform: 'translateX(-50%)' }}>
          70°C
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>100°C</span>
      </div>
    </div>
  );
}

/* ── TempCard ────────────────────────────────────────────── */

/**
 * Hero card showing the current temperature.
 * Features: large coloured number, status badge, 3-zone progress bar, legend.
 *
 * @param {{ temp: number }} props
 */
export default function TempCard({ temp }) {
  const [flash, setFlash] = useState(false);
  const status = getTempStatus(temp);

  /* Flash on every new reading */
  useEffect(() => {
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 500);
    return () => clearTimeout(t);
  }, [temp]);

  return (
    <div className={`card temp-card${flash ? ' temp-updated' : ''}`}>

      {/* Header */}
      <div className="card-header">
        <span className="card-title">อุณหภูมิปัจจุบัน</span>
        <span className="range-badge"
              style={{ color: status.color, background: status.bg }}>
          {status.label}
        </span>
      </div>

      {/* Big temperature number */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px',
                    marginTop: '4px', marginBottom: '12px' }}>
        <span style={{ fontSize: '58px', fontWeight: 500, lineHeight: 1,
                       color: 'var(--accent)', letterSpacing: '-1px' }}>
          {temp.toFixed(1)}
        </span>
        <span style={{ fontSize: '24px', fontWeight: 400,
                       color: 'var(--accent)', paddingBottom: '6px' }}>
          °C
        </span>
      </div>

      {/* Status indicator row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%',
                       background: status.color, display: 'inline-block',
                       flexShrink: 0 }} />
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          สถานะ:{' '}
          <strong style={{ color: status.color }}>{status.label}</strong>
        </span>
      </div>

      {/* 3-zone progress bar */}
      <ProgressBar temp={temp} />

      {/* Colour legend */}
      <div className="legend-row">
        {LEGEND.map(({ color, label }) => (
          <span key={label} className="legend-pill">
            <span className="legend-dot" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>

    </div>
  );
}

TempCard.propTypes = {
  temp: PropTypes.number.isRequired,
};
