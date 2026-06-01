import PropTypes from 'prop-types';

/* Phase configuration — colour + emoji icon */
const PHASE_CFG = {
  HEATING:     { color: '#f97316', icon: '🔥' },
  CIRCULATING: { color: '#3b82f6', icon: '🔄' },
  COOLING:     { color: '#06b6d4', icon: '❄️' },
  DONE:        { color: '#22c55e', icon: '✅' },
  IDLE:        { color: '#64748b', icon: '⏸️' },
};

/**
 * Returns the accent colour string for the given phase.
 * Exported as a named utility used by Dashboard to derive StatCard's `color` prop.
 * @param {string} phase
 * @returns {string}
 */
export function phaseColor(phase) {
  return PHASE_CFG[phase]?.color ?? '#64748b';
}

/**
 * Compact inline phase display used as the `value` inside the Phase StatCard.
 * Renders the emoji icon next to the phase name in the phase's accent colour.
 *
 * @param {{ phase: string }} props
 */
export default function PhaseStatus({ phase }) {
  const cfg = PHASE_CFG[phase] ?? PHASE_CFG.IDLE;

  return (
    <span className="phase-inline" style={{ color: cfg.color }}>
      <span className="phase-icon">{cfg.icon}</span>
      {phase}
    </span>
  );
}

PhaseStatus.propTypes = {
  phase: PropTypes.string.isRequired,
};
