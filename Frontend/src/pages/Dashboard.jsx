import { useMemo }   from 'react';
import PropTypes    from 'prop-types';
import StatusBar    from '../components/StatusBar';
import TempCard     from '../components/TempCard';
import TempChart    from '../components/TempChart';
import { useOverheatAlert }    from '../hooks/useOverheatAlert';
import { useDocumentTitle }    from '../hooks/useDocumentTitle';
import { useFavicon }          from '../hooks/useFavicon';
import { useTrend }            from '../hooks/useTrend';
import { useConnectionUptime } from '../hooks/useConnectionUptime';

/* ── Helpers ─────────────────────────────────────────────── */

function todayThai() {
  return new Date().toLocaleDateString('th-TH', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

/* ── Dashboard ───────────────────────────────────────────── */

export default function Dashboard({ temperature, chartData, lastUpdate, isConnected }) {
  const today = useMemo(() => todayThai(), []);

  const alert  = useOverheatAlert(temperature);
  const trend  = useTrend(chartData, alert.threshold);
  const uptime = useConnectionUptime(isConnected);

  useDocumentTitle(temperature);
  useFavicon(temperature);

  return (
    <>
      {/* Overheat pulsing border overlay */}
      {alert.isAlerting && <div className="overheat-overlay" />}

      <StatusBar isConnected={isConnected} lastUpdate={lastUpdate} />

      <div className="page-content">

        {/* Page header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">ระบบติดตามอุณหภูมิเรียลไทม์</h1>
            <p className="page-subtitle">{today}</p>
          </div>
        </div>

        <TempCard
          temp={temperature}
          alert={alert}
          trend={trend}
        />

        <TempChart data={chartData} />

        {/* Footer */}
        <p className="dashboard-footer">
          <span className={`footer-dot ${isConnected ? 'footer-dot--ok' : 'footer-dot--err'}`} />
          {uptime || 'เชื่อมต่อ Backend'} • อัปเดตอัตโนมัติผ่าน Socket.io
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
