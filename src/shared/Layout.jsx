import { Link, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

function Layout({ children }) {
  const location = useLocation();

  // Mock user state (in futuro da context)
  const isLoggedIn = true; // Cambia a false per testare login

  return (
    <div className={styles.layout}>
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
              {isLoggedIn && (
                <Link
                  to="/my-trips"
                  className={location.pathname === '/my-trips' ? styles.active : ''}
                >
                  I miei viaggi
                </Link>
              )}
              <Link
                to="/create"
                className={`${styles.btnCreate} ${location.pathname === '/create' ? styles.active : ''}`}
              >
                + Crea Viaggio
              </Link>
            </div>

            <div className={styles.navUser}>
              {isLoggedIn ? (
                <Link
                  to="/profile"
                  className={styles.profileLink}
                >
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mario"
                    alt="Profilo"
                    className={styles.avatar}
                  />
                </Link>
              ) : (
                <Link to="/login" className={styles.loginBtn}>
                  Accedi
                </Link>
              )}
            </div>
          </div>
        </nav>

      <main className={styles.main}>
        {children}
      </main>

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
    </div>
  );
}

export default Layout;
