import { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from './contexts/AuthContext';
import { useSync } from './hooks/useSync';

const SearchPage = lazy(() => import('./pages/SearchPage'));
const ListsPage = lazy(() => import('./pages/ListsPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const RecsPage = lazy(() => import('./pages/RecsPage'));
const MoviePage = lazy(() => import('./pages/MoviePage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const SyncStatus = lazy(() => import('./components/SyncStatus'));
const NotificationSettings = lazy(() => import('./components/NotificationSettings'));

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

const btnStyle = {
  background: 'var(--bg3)',
  border: 'none',
  borderRadius: 'var(--radius)',
  padding: '10px 12px',
  marginBottom: 8,
  color: 'var(--text)',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
  textAlign: 'left' as const,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
};

export default function App() {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();
  const { user, isLoading, logout } = useAuth();
  useSync();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(ts => ts === 'dark' ? 'light' : 'dark');
  const toggleLang = () => i18n.changeLanguage(i18n.language === 'en' ? 'ru' : 'en');

  const isDetail = pathname.startsWith('/movie/');

  const NAV = [
    { to: '/', labelKey: 'search', icon: '🔍' },
    { to: '/lists', labelKey: 'myLists', icon: '📋' },
    { to: '/calendar', labelKey: 'premieres', icon: '📅' },
    { to: '/recs', labelKey: 'forYou', icon: '✨' },
    { to: '/stats', labelKey: 'statistics', icon: '📊' },
  ];

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><PageLoader /></div>;
  }

  if (!user) {
    return (
      <Suspense fallback={<PageLoader />}>
        <AuthPage />
      </Suspense>
    );
  }

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">{t('skipToContent')}</a>
      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
        aria-expanded={menuOpen}
        aria-controls="sidebar-nav"
      >
        {menuOpen ? '✕' : '☰'}
      </button>
      <nav
        id="sidebar-nav"
        className={`sidebar${menuOpen ? ' open' : ''}`}
        aria-label="Main navigation"
      >
        <div className="logo">Films</div>
        <div className="user-info">
          <span>👤</span>
          <span>{user.name || user.email}</span>
        </div>
        <button onClick={toggleTheme} style={btnStyle}>
          <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
          {theme === 'dark' ? t('lightMode') : t('darkMode')}
        </button>
        <button onClick={toggleLang} style={btnStyle}>
          <span aria-hidden="true">🌐</span>
          {i18n.language === 'en' ? 'Русский' : 'English'}
        </button>
        <button onClick={logout} style={btnStyle}>
          <span aria-hidden="true">🚪</span>
          {t('logout')}
        </button>
        <div style={{ height: 16 }} />
        <Suspense fallback={null}>
          <NotificationSettings />
        </Suspense>
        <Suspense fallback={null}>
          <SyncStatus />
        </Suspense>
        {NAV.map(n => (
          <Link
            key={n.to}
            to={n.to}
            className={`nav-link${pathname === n.to ? ' active' : ''}`}
            onClick={() => setMenuOpen(false)}
            aria-current={pathname === n.to ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{n.icon}</span>
            {t(n.labelKey)}
          </Link>
        ))}
      </nav>
      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <main id="main-content" className="content">
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
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/movie/:id" element={<MoviePage />} />
                <Route path="*" element={
                  <div className="empty">
                    <h2 style={{ marginBottom: 8 }}>404</h2>
                    <p>{t('pageNotFound')}</p>
                    <Link to="/" className="btn btn-outline" style={{ marginTop: 16, display: 'inline-block', textDecoration: 'none' }}>
                      {t('goHome')}
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
