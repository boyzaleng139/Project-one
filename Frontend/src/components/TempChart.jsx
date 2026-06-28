import { useMemo } from 'react';
import PropTypes   from 'prop-types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

/* ── Custom Tooltip ──────────────────────────────────────── */

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const temp  = payload[0].value;
  const color = temp <= 50 ? '#3B82F6' : temp <= 70 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{
      background:   '#ffffff',
      border:       '1px solid var(--border)',
      borderRadius: '10px',
      padding:      '10px 14px',
      boxShadow:    '0 4px 16px rgba(44,26,14,0.1)',
    }}>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
        {label}
      </p>
      <p style={{ fontSize: '16px', fontWeight: 500, color }}>
        {Number(temp).toFixed(1)}
        <span style={{ fontSize: '12px', marginLeft: '2px' }}>°C</span>
      </p>
    </div>
  );
}

/* ── TempChart ───────────────────────────────────────────── */

/**
 * Responsive temperature-over-time line chart (warm theme).
 * Expects data in ascending order (oldest → newest).
 * Shows dashed reference lines at 50 °C and 70 °C zone boundaries.
 *
 * @param {{ data: Array<{time: string, temp: number}> }} props
 */
export default function TempChart({ data }) {
  const formattedData = useMemo(
    () => data.map((d) => ({ time: d.time, temp: parseFloat(d.temp) })),
    [data]
  );

  return (
    <div className="card chart-card">

      {/* ── Header ── */}
      <div className="card-header">
        <div>
          <span className="card-title">แนวโน้มอุณหภูมิ</span>
          <p style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '2px' }}>
            บันทึกย้อนหลัง {data.length} จุด
          </p>
        </div>
        {data.length > 0 && (
          <span className="live-badge">
            <span className="live-dot" />
            LIVE
          </span>
        )}
      </div>

      {/* ── Chart or empty state ── */}
      {data.length === 0 ? (
        <div className="chart-empty">
          <svg className="chart-empty-svg" width="120" height="56" viewBox="0 0 120 56"
               fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Skeleton grid lines */}
            <line x1="0" y1="14" x2="120" y2="14" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
            <line x1="0" y1="28" x2="120" y2="28" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
            <line x1="0" y1="42" x2="120" y2="42" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
            {/* Skeleton wave */}
            <polyline
              points="0,42 18,34 36,38 54,20 72,26 90,18 108,28 120,24"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              fill="none" opacity="0.55"
            />
          </svg>
          <span className="chart-empty-text">รอรับข้อมูลจากเซ็นเซอร์...</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={formattedData}
            margin={{ top: 8, right: 14, left: -16, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="var(--border)"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />

            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}°`}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
            />

            {/* Zone boundary reference lines */}
            <ReferenceLine
              y={50} stroke="#3B82F6"
              strokeDasharray="4 3" strokeOpacity={0.5} strokeWidth={1}
            />
            <ReferenceLine
              y={70} stroke="#EF4444"
              strokeDasharray="4 3" strokeOpacity={0.5} strokeWidth={1}
            />

            <Line
              type="monotone"
              dataKey="temp"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: 'var(--accent)', stroke: '#FFFFFF', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* ── Zone key ── */}
      <div className="chart-ref-row">
        <span>
          <span className="chart-ref-line" style={{ background: '#3B82F6' }} />
          50°C  ปกติ / อุ่น
        </span>
        <span>
          <span className="chart-ref-line" style={{ background: '#EF4444' }} />
          70°C  อุ่น / ร้อน
        </span>
        <span className="chart-note">อัปเดตทุก 3 วินาที</span>
      </div>

    </div>
  );
}

TempChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.string.isRequired,
      temp: PropTypes.number.isRequired,
    })
  ).isRequired,
};
