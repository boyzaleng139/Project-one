import PropTypes from 'prop-types';

const STATUS_CFG = {
  0:   { color: '#6b7280', label: 'ไม่ได้ใช้งาน (Idle)',    blink: false },
  100: { color: '#22c55e', label: 'กำลังทำงาน (Running)',   blink: false },
  255: { color: '#ef4444', label: '⚠️ ผิดพลาด (Error)',     blink: true  },
};

/**
 * Inline status indicator: 14 px coloured dot + bilingual label.
 * Status 255 blinks via the global 'blink' CSS keyframe.
 *
 * @param {{ status: number }} props
 */
export default function StatusIndicator({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG[0];

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
      <span
        style={{
          display:      'inline-block',
          width:        14,
          height:       14,
          borderRadius: '50%',
          background:   cfg.color,
          flexShrink:   0,
          boxShadow:    cfg.blink ? `0 0 6px 2px ${cfg.color}` : 'none',
          animation:    cfg.blink ? 'blink 1s step-start infinite' : 'none',
        }}
      />
      <span style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>
        {cfg.label}
      </span>
    </div>
  );
}

StatusIndicator.propTypes = {
  status: PropTypes.number.isRequired,
};
