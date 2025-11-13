import { Link } from 'react-router-dom';
import styles from './Hero.module.css';

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.background}>
        <img 
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600" 
          alt="Travel background"
          className={styles.backgroundImage}
        />
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>
          Organizza viaggi di gruppo
          <span className={styles.titleGradient}>democratici</span>
        </h1>
        
        <p className={styles.subtitle}>
          Crea itinerari personalizzati, vota le modifiche insieme e parti con chi condivide le tue passioni
        </p>

        <div className={styles.buttons}>
          <Link to="/create">
            <button className={styles.buttonPrimary}>
              ✈️ Crea il tuo viaggio
            </button>
          </Link>
          <Link to="/explore">
            <button className={styles.buttonSecondary}>
              🗺️ Esplora viaggi
            </button>
          </Link>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statNumber}>500+</div>
            <div className={styles.statLabel}>Viaggiatori</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>150+</div>
            <div className={styles.statLabel}>Viaggi attivi</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>25</div>
            <div className={styles.statLabel}>Destinazioni</div>
          </div>
        </div>
      </div>

      <div className={styles.scrollIndicator}>
        <div className={styles.scrollIcon}>
          <div className={styles.scrollDot} />
        </div>
      </div>
    </section>
  );
}

export default Hero;