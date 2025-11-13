import { Link, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

function Layout({ children }) {
  const location = useLocation();

  // Nascondi navbar su wizard e trip-editor per UX pulita
  const hideNavbar = location.pathname.includes('/create') ||
                     location.pathname.includes('/trip-editor');

  return (
    <div className={styles.layout}>
      {!hideNavbar && (
        <nav className={styles.navbar}>
          <div className={styles.navContainer}>
            <Link to="/" className={styles.logo}>
              🌍 Travel Crew
            </Link>

            <div className={styles.navLinks}>
              <Link
                to="/"
                className={location.pathname === '/' ? styles.active : ''}
              >
                Home
              </Link>
              <Link
                to="/explore"
                className={location.pathname === '/explore' ? styles.active : ''}
              >
                Esplora
              </Link>
              <Link
                to="/create"
                className={`${styles.btnCreate} ${location.pathname === '/create' ? styles.active : ''}`}
              >
                + Crea Viaggio
              </Link>
            </div>
          </div>
        </nav>
      )}

      <main className={styles.main}>
        {children}
      </main>

      {!hideNavbar && (
        <footer className={styles.footer}>
          <div className={styles.footerContainer}>
            <p>© 2025 Travel Crew v2.0 - Sistema PEXP</p>
            <div className={styles.footerLinks}>
              <a href="#about">About</a>
              <a href="#contact">Contatti</a>
              <a href="#privacy">Privacy</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default Layout;
