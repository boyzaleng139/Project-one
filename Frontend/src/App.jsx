import { useState, useCallback } from 'react';
import Sidebar        from './components/Sidebar';
import Dashboard      from './pages/Dashboard';
import History        from './pages/History';
import { useMockData } from './hooks/useMockData';

/* ── Bottom-nav icons ─────────────────────────────────────── */
function GridIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="currentColor">
      <rect x="2"  y="2"  width="8" height="8" rx="2" />
      <rect x="12" y="2"  width="8" height="8" rx="2" />
      <rect x="2"  y="12" width="8" height="8" rx="2" />
      <rect x="12" y="12" width="8" height="8" rx="2" />
    </svg>
  );
}

function ClockOutlineIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22"
         fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="8.5" />
      <polyline points="11,6 11,11 14.5,13.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── App ──────────────────────────────────────────────────── */
export default function App() {
  const [page, setPage]    = useState('dashboard');
  const handleNavigate     = useCallback((p) => setPage(p), []);
  const mockData           = useMockData();

  return (
    <div className="app-shell">

      {/* Desktop / Tablet sidebar */}
      <Sidebar activePage={page} onNavigate={handleNavigate} />

      {/* Main scrollable area */}
      <main className="main-content">
        {page === 'dashboard'
          ? <Dashboard {...mockData} />
          : <History   history={mockData.history} />
        }
      </main>

      {/* Mobile bottom navigation */}
      <nav className="bottom-nav">
        <button
          className={`bottom-nav-item${page === 'dashboard' ? ' bottom-nav-item--active' : ''}`}
          onClick={() => handleNavigate('dashboard')}
        >
          <GridIcon />
          <span>แดชบอร์ด</span>
        </button>
        <button
          className={`bottom-nav-item${page === 'history' ? ' bottom-nav-item--active' : ''}`}
          onClick={() => handleNavigate('history')}
        >
          <ClockOutlineIcon />
          <span>ประวัติ</span>
        </button>
      </nav>

    </div>
  );
}
