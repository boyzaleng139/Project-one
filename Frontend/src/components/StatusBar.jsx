import PropTypes from 'prop-types';

/**
 * Thin full-width status bar.
 * Green background + livePulse dot when connected.
 * Shows last-update time alongside the connection message.
 *
 * @param {{ isConnected: boolean, lastUpdate: Date|null }} props
 */
export default function StatusBar({ isConnected, lastUpdate }) {
  const timeStr = lastUpdate
    ? lastUpdate.toLocaleTimeString('th-TH', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      })
    : null;

  return (
    <div className={`status-bar ${isConnected ? 'status-bar--ok' : 'status-bar--err'}`}>
      <div className="status-bar-inner">
        <span className={`status-dot ${isConnected ? 'status-dot--ok' : 'status-dot--err'}`} />
        <span>
          {isConnected
            ? 'เชื่อมต่อกับเซิร์ฟเวอร์แล้ว'
            : '⚠️ ขาดการเชื่อมต่อ — กำลังเชื่อมต่อใหม่...'}
        </span>
        {isConnected && timeStr && (
          <span className="status-time">อัปเดต: {timeStr}</span>
        )}
      </div>
    </div>
  );
}

StatusBar.defaultProps = { lastUpdate: null };

StatusBar.propTypes = {
  isConnected: PropTypes.bool.isRequired,
  lastUpdate:  PropTypes.instanceOf(Date),
};
