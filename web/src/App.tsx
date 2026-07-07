import { lazy, Suspense, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const SearchPage = lazy(() => import('./pages/SearchPage'));
const ListsPage = lazy(() => import('./pages/ListsPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const RecsPage = lazy(() => import('./pages/RecsPage'));
const MoviePage = lazy(() => import('./pages/MoviePage'));

const NAV = [
  { to: '/', label: 'Search', icon: '🔍' },
  { to: '/lists', label: 'My Lists', icon: '📋' },
  { to: '/calendar', label: 'Premieres', icon: '📅' },
  { to: '/recs', label: 'For You', icon: '✨' },
];

function PageLoader() {
  return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
    <div className="skeleton-card" />
  </div>;
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.15 } },
};

export default function App() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isDetail = pathname.startsWith('/movie/');

  return (
    <div className="app">
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? '✕' : '☰'}
      </button>
      <nav className={`sidebar${menuOpen ? ' open' : ''}`}>
        <div className="logo">Films</div>
        {NAV.map(n => (
          <Link
            key={n.to}
            to={n.to}
            className={`nav-link${pathname === n.to ? ' active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </Link>
        ))}
      </nav>
      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}
      <main className="content">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={isDetail ? 'detail' : pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Routes location={isDetail ? undefined : undefined}>
                <Route path="/" element={<SearchPage />} />
                <Route path="/lists" element={<ListsPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/recs" element={<RecsPage />} />
                <Route path="/movie/:id" element={<MoviePage />} />
                <Route path="*" element={
                  <div className="empty">
                    <h2 style={{ marginBottom: 8 }}>404</h2>
                    <p>Page not found</p>
                    <Link to="/" className="btn btn-outline" style={{ marginTop: 16, display: 'inline-block', textDecoration: 'none' }}>
                      Go Home
                    </Link>
                  </div>
                } />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
    </div>
  );
}
