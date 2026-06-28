import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useAnimatedValue } from '../hooks/useAnimatedValue';

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

/* ── SVG Icons ──────────────────────────────────────────── */

function BellIcon({ size = 16, muted }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      {muted && <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" />}
    </svg>
  );
}

function SettingsIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33
              1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06
              a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09
              A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06
              A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51
              1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9
              a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

/* ── 3-Zone Progress Bar ─────────────────────────────────── */

function ProgressBar({ temp }) {
  const N_END  = 50;
  const W_END  = 70;
  const MAX    = 100;

  const pct       = Math.min(Math.max((temp / MAX) * 100, 0), 100);
  const indColor  = temp <= N_END ? '#3B82F6' : temp <= W_END ? '#F59E0B' : '#EF4444';

  const normFill = Math.min(pct, N_END);
  const warmFill = pct > N_END ? Math.min(pct - N_END, W_END - N_END) : 0;
  const hotFill  = pct > W_END ? Math.min(pct - W_END, MAX - W_END)   : 0;

  const bar = { position: 'absolute', top: 0, height: '100%' };

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ position: 'relative', height: '14px', borderRadius: '7px',
                    background: 'var(--border)', overflow: 'visible' }}>

        <div style={{ ...bar, left: 0,           width: `${N_END}%`,
                      background: 'rgba(59,130,246,0.12)',  borderRadius: '7px 0 0 7px' }} />
        <div style={{ ...bar, left: `${N_END}%`, width: `${W_END - N_END}%`,
                      background: 'rgba(245,158,11,0.12)' }} />
        <div style={{ ...bar, left: `${W_END}%`, width: `${MAX - W_END}%`,
                      background: 'rgba(239,68,68,0.12)',   borderRadius: '0 7px 7px 0' }} />

        {normFill > 0 && (
          <div style={{ ...bar, left: 0, width: `${normFill}%`, background: '#3B82F6',
                        borderRadius: `7px ${normFill >= N_END ? 0 : 7}px ${normFill >= N_END ? 0 : 7}px 7px`,
                        transition: 'width 0.45s ease' }} />
        )}
        {warmFill > 0 && (
          <div style={{ ...bar, left: `${N_END}%`, width: `${warmFill}%`, background: '#F59E0B',
                        transition: 'width 0.45s ease' }} />
        )}
        {hotFill > 0 && (
          <div style={{ ...bar, left: `${W_END}%`, width: `${hotFill}%`, background: '#EF4444',
                        borderRadius: '0 7px 7px 0', transition: 'width 0.45s ease' }} />
        )}

        <div style={{ ...bar, left: `${N_END}%`, width: '2px',
                      background: 'var(--bg)', opacity: 0.85, zIndex: 2 }} />
        <div style={{ ...bar, left: `${W_END}%`, width: '2px',
                      background: 'var(--bg)', opacity: 0.85, zIndex: 2 }} />

        <div style={{
          position:    'absolute',
          left:        `calc(${pct}% - 11px)`,
          top:         '-5px',
          width:       '24px',
          height:      '24px',
          borderRadius:'50%',
          background:  '#FFFFFF',
          border:      `3px solid ${indColor}`,
          boxShadow:   `0 2px 6px rgba(0,0,0,0.18), 0 0 0 3px ${indColor}22`,
          zIndex:      3,
          transition:  'left 0.45s ease, border-color 0.3s',
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between',
                    position: 'relative', marginTop: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>0°C</span>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#3B82F6',
                       position: 'absolute', left: `${N_END}%`, transform: 'translateX(-50%)' }}>
          50°C
        </span>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#F59E0B',
                       position: 'absolute', left: `${W_END}%`, transform: 'translateX(-50%)' }}>
          70°C
        </span>
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>100°C</span>
      </div>
    </div>
  );
}

/* ── Alert Settings Panel ──────────────────────────────── */

function AlertSettings({ alert }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="alert-settings-wrap">
      <button className="alert-settings-toggle" onClick={() => setOpen(!open)}
              title="ตั้งค่าการแจ้งเตือน">
        <SettingsIcon />
      </button>

      {open && (
        <div className="alert-settings-panel">
          {/* Mute toggle */}
          <div className="alert-row">
            <button className="alert-mute-btn" onClick={alert.toggleMute}
                    title={alert.isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}>
              <BellIcon muted={alert.isMuted} />
              <span>{alert.isMuted ? 'เสียงปิด' : 'เสียงเปิด'}</span>
            </button>
          </div>

          {/* Threshold slider */}
          <div className="alert-row">
            <label className="alert-label">
              เกณฑ์เตือน: <strong>{alert.threshold}°C</strong>
            </label>
            <input
              type="range" min={30} max={100} step={1}
              value={alert.threshold}
              onChange={(e) => alert.setThreshold(Number(e.target.value))}
              className="alert-slider"
            />
          </div>

          {/* Notification permission */}
          {alert.notifPerm !== 'granted' && (
            <button className="alert-notif-btn" onClick={alert.requestNotifPermission}>
              เปิดการแจ้งเตือนเบราว์เซอร์
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── TempCard ────────────────────────────────────────────── */

export default function TempCard({ temp, alert, trend }) {
  const [flash, setFlash] = useState(false);
  const status   = getTempStatus(temp);
  const animated = useAnimatedValue(temp);

  useEffect(() => {
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 500);
    return () => clearTimeout(t);
  }, [temp]);

  // Heat glow intensity: 0 at ≤30°C, max at 100°C
  const glowIntensity = Math.min(Math.max((temp - 30) / 70, 0), 1);
  const glowColor     = status.color;
  const glowStyle     = glowIntensity > 0.05
    ? { textShadow: `0 0 ${8 + glowIntensity * 20}px ${glowColor}${Math.round(glowIntensity * 80).toString(16).padStart(2, '0')}` }
    : {};

  // Trend color
  const trendColor = trend.direction === 'up'   ? '#EF4444'
                   : trend.direction === 'down' ? '#3B82F6'
                   : 'var(--text-muted)';

  return (
    <div className={`card temp-card${flash ? ' temp-updated' : ''}${alert?.isAlerting ? ' temp-card--alert' : ''}`}>

      {/* Header */}
      <div className="card-header">
        <span className="card-title">อุณหภูมิปัจจุบัน</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="range-badge"
                style={{ color: status.color, background: status.bg }}>
            {status.label}
          </span>
          {alert && <AlertSettings alert={alert} />}
        </div>
      </div>

      {/* Big temperature number with heat glow */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px',
                    marginTop: '8px', marginBottom: '6px' }}>
        <span style={{ fontSize: '72px', fontWeight: 700, lineHeight: 1,
                       color: 'var(--accent)', letterSpacing: '-2px',
                       transition: 'text-shadow 0.5s ease', ...glowStyle }}>
          {animated.toFixed(1)}
        </span>
        <span style={{ fontSize: '26px', fontWeight: 500,
                       color: 'var(--accent)', paddingBottom: '8px', opacity: 0.8 }}>
          °C
        </span>
      </div>

      {/* Trend indicator */}
      {trend && (
        <div className="trend-row">
          <span className="trend-badge" style={{ color: trendColor }}>
            {trend.label}
          </span>
          {trend.etaMinutes != null && (
            <span className="trend-eta">
              คาดว่าจะถึง {alert?.threshold || 70}°C ใน ~{Math.ceil(trend.etaMinutes)} นาที
            </span>
          )}
        </div>
      )}

      {/* Status indicator row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
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
  temp:  PropTypes.number.isRequired,
  alert: PropTypes.object,
  trend: PropTypes.object,
};
