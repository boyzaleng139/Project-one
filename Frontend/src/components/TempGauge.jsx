import PropTypes from 'prop-types';

/* ── Gauge geometry ──────────────────────────────────────── */
const SIZE     = 240;
const CX       = 120;
const CY       = 120;
const R        = 96;
const MAX_TEMP = 100;

// 270° arc, gap centred at 6-o'clock.
// SVG stroke starts at east (3 o'clock), so rotate 135° to place the
// arc start at the 7:30 (225° from north, clockwise) position.
const ROTATION    = 135;
const GAUGE_DEG   = 270;
const CIRC        = 2 * Math.PI * R;
const GAUGE_LEN   = (GAUGE_DEG / 360) * CIRC;  // visible arc length
const GAP_LEN     = CIRC - GAUGE_LEN;           // invisible 90° gap

function arcColor(temp) {
  if (temp > 70) return '#ef4444';
  if (temp > 50) return '#f97316';
  return '#3b82f6';
}

/**
 * Circular SVG arc gauge visualising temperature in the 0–100 °C range.
 * Uses stroke-dasharray on a rotated circle element so both the fill length
 * and the colour transition with CSS (0.5 s ease).
 *
 * @param {{ temperature: number }} props
 */
export default function TempGauge({ temperature }) {
  const clamped  = Math.min(Math.max(temperature, 0), MAX_TEMP);
  const fill     = (clamped / MAX_TEMP) * GAUGE_LEN;
  const color    = arcColor(temperature);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`อุณหภูมิ ${temperature.toFixed(1)} องศาเซลเซียส`}
      >
        {/* ── Background track ── */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke="#1e3a5f"
          strokeWidth={18}
          strokeDasharray={`${GAUGE_LEN} ${GAP_LEN}`}
          strokeLinecap="round"
          transform={`rotate(${ROTATION}, ${CX}, ${CY})`}
        />

        {/* ── Progress arc — animates via CSS transition ── */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke={color}
          strokeWidth={18}
          strokeDasharray={`${fill} ${CIRC}`}
          strokeLinecap="round"
          transform={`rotate(${ROTATION}, ${CX}, ${CY})`}
          style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.5s ease' }}
        />

        {/* ── Temperature value ── */}
        <text
          x={CX} y={CY - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize={48}
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
          style={{ transition: 'fill 0.5s ease' }}
        >
          {temperature.toFixed(1)}
        </text>

        {/* ── Unit ── */}
        <text
          x={CX} y={CY + 30}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={18}
          fontFamily="system-ui, sans-serif"
        >
          °C
        </text>

        {/* ── Scale ticks ── */}
        <text x={CX - 77} y={CY + 98} fill="#475569" fontSize={11} textAnchor="middle">0</text>
        <text x={CX + 77} y={CY + 98} fill="#475569" fontSize={11} textAnchor="middle">100</text>
      </svg>
    </div>
  );
}

TempGauge.propTypes = {
  temperature: PropTypes.number.isRequired,
};
