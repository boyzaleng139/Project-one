import { useMemo }   from 'react';
import PropTypes    from 'prop-types';
import StatusBar    from '../components/StatusBar';
import TempCard     from '../components/TempCard';
import TempChart    from '../components/TempChart';

/* ── Helpers ─────────────────────────────────────────────── */

function todayThai() {
  return new Date().toLocaleDateString('th-TH', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

/* ── Dashboard ───────────────────────────────────────────── */

/**
 * Live monitoring dashboard.
 *
 * Layout:
 *   StatusBar       (full width, top)
 *   Page header     (title + Thai date)
 *   TempCard
 *   TempChart       (full width)
 *   Footer note
 *
 * All data is received as props from App.jsx via useLiveData().
 */
export default function Dashboard({ temperature, chartData, lastUpdate, isConnected }) {
  const today = useMemo(() => todayThai(), []);

  return (
    <>
      {/* Status bar */}
      <StatusBar isConnected={isConnected} lastUpdate={lastUpdate} />

      {/* Page content */}
      <div className="page-content">

        {/* Page header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">ระบบติดตามอุณหภูมิเรียลไทม์</h1>
            <p className="page-subtitle">{today}</p>
          </div>
        </div>

        <TempCard temp={temperature} />

        {/* Rolling trend chart */}
        <TempChart data={chartData} />

        {/* Footer */}
        <p className="dashboard-footer">
          🔴 เชื่อมต่อ Backend • อัปเดตอัตโนมัติผ่าน Socket.io
        </p>

      </div>
    </>
  );
}

Dashboard.propTypes = {
  temperature:  PropTypes.number.isRequired,
  chartData:    PropTypes.array.isRequired,
  lastUpdate:   PropTypes.instanceOf(Date).isRequired,
  isConnected:  PropTypes.bool.isRequired,
};
