import { useMemo, useState } from 'react';
import PropTypes  from 'prop-types';
import TempChart  from '../components/TempChart';

const PAGE_SIZE = 10;

/* ── Helpers ─────────────────────────────────────────────── */

function getTempStatus(temp) {
  const n = parseFloat(temp);
  if (n <= 50) return { label: 'ปกติ', color: '#3B82F6', bg: '#EFF6FF' };
  if (n <= 70) return { label: 'อุ่น',  color: '#F59E0B', bg: '#FFFBEB' };
  return              { label: 'ร้อน', color: '#EF4444', bg: '#FEF2F2' };
}

function formatTs(iso) {
  if (!iso) return '–';
  try {
    return new Date(iso).toLocaleString('th-TH', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    });
  } catch { return iso; }
}

/* ── History ─────────────────────────────────────────────── */

/**
 * Historical temperature data page (Mock-mode version).
 * Receives accumulated history from App.jsx — no API calls needed.
 *
 * Shows:
 *   - Summary pills (count, avg, min, max)
 *   - Trend chart (ASC order)
 *   - Data table (DESC order, newest first) with pagination (10 rows/page)
 *
 * @param {{ history: Array<{time, temp, timestamp}> }} props
 */
export default function History({ history }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(history.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);

  /* chart needs ASC order (oldest → newest) */
  const chartData = useMemo(
    () => [...history].reverse().map((d) => ({ time: d.time, temp: d.temp })),
    [history]
  );

  /* Summary statistics */
  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const temps = history.map((d) => d.temp);
    const avg   = temps.reduce((a, b) => a + b, 0) / temps.length;
    return {
      count: history.length,
      avg,
      min: Math.min(...temps),
      max: Math.max(...temps),
    };
  }, [history]);

  const pagedRows = history.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="page-content">

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">ประวัติข้อมูลอุณหภูมิ</h1>
          <p className="page-subtitle">ข้อมูลย้อนหลังจาก Backend</p>
        </div>
      </div>

      {/* ── Summary pills ── */}
      {stats && (
        <div className="summary-pills">
          <div className="summary-pill">
            <span className="summary-pill-value">{stats.count}</span>
            <span className="summary-pill-label">รายการ</span>
          </div>
          <div className="summary-pill">
            <span className="summary-pill-value"
                  style={{ color: getTempStatus(stats.avg).color }}>
              {stats.avg.toFixed(1)}°C
            </span>
            <span className="summary-pill-label">เฉลี่ย</span>
          </div>
          <div className="summary-pill">
            <span className="summary-pill-value" style={{ color: '#3B82F6' }}>
              {stats.min.toFixed(1)}°C
            </span>
            <span className="summary-pill-label">ต่ำสุด</span>
          </div>
          <div className="summary-pill">
            <span className="summary-pill-value" style={{ color: '#EF4444' }}>
              {stats.max.toFixed(1)}°C
            </span>
            <span className="summary-pill-label">สูงสุด</span>
          </div>
        </div>
      )}

      {/* ── Trend chart ── */}
      <TempChart data={chartData} />

      {/* ── Data table ── */}
      {history.length > 0 ? (
        <div className="card table-card">
          <div className="card-header">
            <span className="card-title">รายการข้อมูลล่าสุด</span>
            <span className="record-badge">{history.length} รายการ</span>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="th">#</th>
                  <th className="th">เวลา</th>
                  <th className="th">อุณหภูมิ</th>
                  <th className="th">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row, i) => {
                  const st     = getTempStatus(row.temp);
                  const rowNum = (safePage - 1) * PAGE_SIZE + i + 1;
                  return (
                    <tr key={`${row.timestamp}-${i}`}
                        className="tr-row">
                      <td className="td td--index">{rowNum}</td>
                      <td className="td">{formatTs(row.timestamp)}</td>
                      <td className="td td--temp" style={{ color: st.color }}>
                        {row.temp.toFixed(1)}°C
                      </td>
                      <td className="td">
                        <span style={{
                          fontSize: '11px', fontWeight: 500,
                          padding: '2px 10px', borderRadius: '20px',
                          color: st.color, background: st.bg,
                          display: 'inline-block',
                        }}>
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pg-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                ‹ ก่อนหน้า
              </button>
              <span className="pg-info">
                หน้า <strong>{safePage}</strong> / {totalPages}
              </span>
              <button
                className="pg-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                ถัดไป ›
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          ยังไม่มีข้อมูล — รอสักครู่ขณะระบบสร้างข้อมูลจำลอง
        </div>
      )}

    </div>
  );
}

History.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      time:      PropTypes.string.isRequired,
      temp:      PropTypes.number.isRequired,
      timestamp: PropTypes.string.isRequired,
    })
  ).isRequired,
};
