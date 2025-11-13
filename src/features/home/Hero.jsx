import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './Hero.module.css';

// Hook per animare i numeri
function useCounter(end, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
}

function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const travelers = useCounter(500, 2000);
  const trips = useCounter(150, 2000);
  const destinations = useCounter(25, 2000);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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

      <div className={`${styles.content} ${isVisible ? styles.fadeIn : ''}`}>
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
            <div className={styles.statNumber}>{travelers}+</div>
            <div className={styles.statLabel}>Viaggiatori</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>{trips}+</div>
            <div className={styles.statLabel}>Viaggi attivi</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>{destinations}</div>
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