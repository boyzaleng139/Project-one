import { useCallback } from 'react';
import PropTypes from 'prop-types';

/* ── Icons ────────────────────────────────────────────────── */

function FlameIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#D85A30">
      <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
    </svg>
  );
}

function GridIcon({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill={color}>
      <rect x="1.5" y="1.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="10"  y="1.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="1.5" y="10"  width="6.5" height="6.5" rx="1.5" />
      <rect x="10"  y="10"  width="6.5" height="6.5" rx="1.5" />
    </svg>
  );
}

function HistoryIcon({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18"
         fill="none" stroke={color} strokeWidth="1.5">
      <circle cx="9" cy="9" r="7" />
      <polyline points="9,5 9,9 12,11" strokeLinecap="round" />
    </svg>
  );
}

/* ── Nav item definitions ─────────────────────────────────── */
const NAV_ITEMS = [
  { id: 'dashboard', label: 'แดชบอร์ด', IconComp: GridIcon   },
  { id: 'history',   label: 'ประวัติ',   IconComp: HistoryIcon },
];

/* ── Sidebar ──────────────────────────────────────────────── */
export default function Sidebar({ activePage, onNavigate }) {
  const handleClick = useCallback((id) => onNavigate(id), [onNavigate]);

  return (
    <aside className="sidebar">

      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon-wrap">
          <FlameIcon />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title">Hot Air Dryer</span>
          <span className="sidebar-logo-sub">ระบบติดตามอุณหภูมิ</span>
        </div>
      </div>

      <div className="sidebar-divider" />

      {/* ── Navigation ── */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ id, label, IconComp }) => {
          const active = activePage === id;
          const iconColor = active
            ? '#D85A30'
            : 'rgba(245,196,179,0.45)';
          return (
            <button
              key={id}
              className={`sidebar-item${active ? ' sidebar-item--active' : ''}`}
              onClick={() => handleClick(id)}
              aria-current={active ? 'page' : undefined}
            >
              <span className="sidebar-item-icon">
                <IconComp color={iconColor} />
              </span>
              <span className="sidebar-item-label">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        <span className="sidebar-footer-text">v2.0</span>
      </div>

    </aside>
  );
}

Sidebar.propTypes = {
  activePage: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
};
