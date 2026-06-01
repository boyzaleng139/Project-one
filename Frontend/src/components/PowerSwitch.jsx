import PropTypes from 'prop-types';

/**
 * Large toggle button that powers the dryer on or off.
 * Disabled while a control request is in-flight (loading=true).
 *
 * @param {{ isOn: boolean, onToggle: Function, loading?: boolean }} props
 */
export default function PowerSwitch({ isOn, onToggle, loading }) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      aria-pressed={isOn}
      aria-label={isOn ? 'ปิดเครื่อง' : 'เปิดเครื่อง'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        width: '100%',
        padding: '16px 24px',
        borderRadius: 12,
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        background: loading
          ? '#334155'
          : isOn
            ? 'linear-gradient(135deg, #16a34a, #22c55e)'
            : 'linear-gradient(135deg, #374151, #4b5563)',
        color: loading ? '#94a3b8' : '#fff',
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: 0.5,
        boxShadow: loading
          ? 'none'
          : isOn
            ? '0 0 20px rgba(34,197,94,0.35)'
            : '0 4px 12px rgba(0,0,0,0.4)',
        transition: 'background 0.25s ease, box-shadow 0.25s ease, color 0.2s ease',
        userSelect: 'none',
        outline: 'none',
      }}
    >
      <span style={{ fontSize: 22 }}>{isOn ? '⚡' : '⏹'}</span>
      <span>{loading ? 'กำลังดำเนินการ…' : isOn ? 'เปิดเครื่อง' : 'ปิดเครื่อง'}</span>
    </button>
  );
}

PowerSwitch.propTypes = {
  isOn:    PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

PowerSwitch.defaultProps = {
  loading: false,
};
