import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * KPI stat card with a left-side colour accent border.
 *
 * When `value` changes a `useEffect` adds the `.stat-card-value--anim` class
 * for 350 ms, triggering the `scaleIn` CSS entrance animation — giving a subtle
 * "number flip" feedback on every data update without re-mounting the element.
 *
 * @param {{
 *   label:    string,
 *   value:    string | number | React.ReactNode,
 *   unit:     string,
 *   color:    string,
 *   icon:     string,
 *   subtitle: string,
 *   pulse:    boolean,
 * }} props
 */
export default function StatCard({ label, value, unit, color, icon, subtitle, pulse }) {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setAnimating(true);
    const t = setTimeout(() => setAnimating(false), 350);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div
      className={`stat-card${pulse ? ' stat-card--error' : ''}`}
      style={{ borderLeftColor: color }}
    >
      {/* Header: icon + label */}
      <div className="stat-card-header">
        <span className="stat-card-icon">{icon}</span>
        <span className="stat-card-label">{label}</span>
      </div>

      {/* Value — animating class triggers scaleIn on every value change */}
      <div
        className={`stat-card-value${animating ? ' stat-card-value--anim' : ''}`}
        style={{ color }}
      >
        <span className="stat-card-number">{value}</span>
        {unit && <span className="stat-card-unit">{unit}</span>}
      </div>

      {/* Subtitle */}
      <p className="stat-card-subtitle">{subtitle}</p>
    </div>
  );
}

StatCard.defaultProps = {
  unit:  '',
  pulse: false,
};

StatCard.propTypes = {
  label:    PropTypes.string.isRequired,
  value:    PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]).isRequired,
  unit:     PropTypes.string,
  color:    PropTypes.string.isRequired,
  icon:     PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  pulse:    PropTypes.bool,
};
