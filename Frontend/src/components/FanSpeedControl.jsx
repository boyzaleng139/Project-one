import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const SLIDER_STYLE = {
  width: '100%',
  accentColor: '#3b82f6',
  cursor: 'pointer',
  height: 6,
};

function FanRow({ label, value, localValue, onChange, onCommit }) {
  const pct = Math.round((localValue / 255) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#94a3b8', fontSize: 13 }}>{label}</span>
        <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14, minWidth: 56, textAlign: 'right' }}>
          {localValue} <span style={{ color: '#475569', fontWeight: 400 }}>/ 255</span>
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={255}
        value={localValue}
        style={SLIDER_STYLE}
        onChange={onChange}
        onMouseUp={onCommit}
        onTouchEnd={onCommit}
      />

      {/* Percentage bar */}
      <div
        style={{
          height: 4,
          borderRadius: 4,
          background: '#1e293b',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
            borderRadius: 4,
            transition: 'width 0.15s ease',
          }}
        />
      </div>

      <span style={{ color: '#475569', fontSize: 11, textAlign: 'right' }}>{pct}%</span>
    </div>
  );
}

FanRow.propTypes = {
  label:       PropTypes.string.isRequired,
  value:       PropTypes.number.isRequired,
  localValue:  PropTypes.number.isRequired,
  onChange:    PropTypes.func.isRequired,
  onCommit:    PropTypes.func.isRequired,
};

/**
 * Dual-slider control for rear and side fan speeds (0–255).
 * Calls onFanChange only on mouse/touch release to prevent API spam.
 *
 * @param {{ fanRear: number, fanSide: number, onFanChange: Function }} props
 */
export default function FanSpeedControl({ fanRear, fanSide, onFanChange }) {
  const [localRear, setLocalRear] = useState(fanRear);
  const [localSide, setLocalSide] = useState(fanSide);

  // Sync with incoming prop changes (e.g. real-time updates from socket)
  // using a simple comparison — intentionally not useEffect to avoid loops
  const syncedRear = localRear !== fanRear && !Number.isNaN(fanRear) ? fanRear : localRear;
  const syncedSide = localSide !== fanSide && !Number.isNaN(fanSide) ? fanSide : localSide;

  const handleRearChange = useCallback((e) => setLocalRear(Number(e.target.value)), []);
  const handleSideChange = useCallback((e) => setLocalSide(Number(e.target.value)), []);

  const commitFan = useCallback(() => {
    onFanChange(localRear, localSide);
  }, [onFanChange, localRear, localSide]);

  return (
    <div
      style={{
        background: '#1e293b',
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: 15, fontWeight: 600 }}>
        💨 ความเร็วพัดลม (Fan Speed)
      </h3>

      <FanRow
        label="พัดลมหลัง (Rear)"
        value={fanRear}
        localValue={syncedRear}
        onChange={handleRearChange}
        onCommit={commitFan}
      />

      <FanRow
        label="พัดลมข้าง (Side)"
        value={fanSide}
        localValue={syncedSide}
        onChange={handleSideChange}
        onCommit={commitFan}
      />
    </div>
  );
}

FanSpeedControl.propTypes = {
  fanRear:     PropTypes.number.isRequired,
  fanSide:     PropTypes.number.isRequired,
  onFanChange: PropTypes.func.isRequired,
};
