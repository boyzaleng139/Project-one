import PropTypes from 'prop-types';

/* ── Helpers ─────────────────────────────────────────────── */

/** Map a 0-255 raw fan value to a percentage integer. */
function rawToPct(raw) {
  return Math.round((raw / 255) * 100);
}

/** Colour-code the bar: green → amber → red as speed increases. */
function fanColor(pct) {
  if (pct >= 80) return '#ef4444';
  if (pct >= 50) return '#f59e0b';
  return '#22c55e';
}

/* ── FanCard ─────────────────────────────────────────────── */

/**
 * Read-only fan speed card.
 * Displays a large percentage, a colour-coded progress bar, and the raw value.
 *
 * @param {{
 *   label: string,
 *   value: number,   raw 0-255 PWM value
 *   icon:  string,
 * }} props
 */
export default function FanCard({ label, value, icon }) {
  const pct   = rawToPct(value);
  const color = fanColor(pct);

  return (
    <div className="fan-info-card">
      {/* Header */}
      <div className="fan-info-header">
        <span className="fan-info-label">
          {icon} {label}
        </span>
      </div>

      {/* Large percentage */}
      <div className="fan-info-pct" style={{ color }}>{pct}%</div>

      {/* Progress bar — 8px height set via CSS .fan-track */}
      <div className="fan-track">
        <div
          className="fan-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>

      {/* Raw value */}
      <div className="fan-raw">{value} / 255</div>
    </div>
  );
}

FanCard.defaultProps = {
  icon: '🌀',
};

FanCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon:  PropTypes.string,
};
