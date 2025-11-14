import { useState, useEffect } from 'react';
import { loadCSV } from '../../core/utils/dataLoader';
import styles from './Step1_Destinazione.module.css';

function Step1_Destinazione({ value, destinazione, onChange, error }) {
  const [destinazioni, setDestinazioni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    console.log('🔄 Loading destinazioni CSV...');
    loadCSV('/data/destinazioni.csv')
      .then(data => {
        console.log('✅ Destinazioni loaded:', data.length, 'items');
        setDestinazioni(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Errore caricamento destinazioni:', err);
        setLoadError(err.message || 'Errore durante il caricamento delle destinazioni');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Caricamento destinazioni...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.step}>
        <div className={styles.error}>
          <h3>⚠️ Errore</h3>
          <p>{loadError}</p>
          <button onClick={() => window.location.reload()} style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (destinazioni.length === 0) {
    return (
      <div className={styles.step}>
        <div className={styles.error}>
          <h3>⚠️ Nessuna destinazione disponibile</h3>
          <p>Non sono state trovate destinazioni nel database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.step}>
      <h2 className={styles.title}>Dove vuoi andare?</h2>
      <p className={styles.subtitle}>
        Scegli la destinazione del tuo prossimo viaggio
      </p>

      <div className={styles.grid}>
        {destinazioni.map(dest => (
          <div
            key={dest.CODICE}
            className={`${styles.card} ${value === dest.CODICE ? styles.selected : ''}`}
            onClick={() => onChange(dest.CODICE, dest.NOME)}
          >
            <div className={styles.cardImage}>
              <img
                src={dest.IMMAGINE_URL || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400'}
                alt={dest.NOME}
              />
            </div>

            <div className={styles.cardContent}>
              <div className={styles.cardHeader}>
                <span className={styles.emoji}>{dest.EMOJI}</span>
                <h3 className={styles.cardTitle}>{dest.NOME}</h3>
              </div>

              <p className={styles.tagline}>{dest.TAGLINE}</p>

              <div className={styles.cardMeta}>
                <span>🌍 {dest.CONTINENTE}</span>
                <span>📅 {dest.GIORNI_CONSIGLIATI} giorni</span>
              </div>

              {value === dest.CODICE && (
                <div className={styles.checkmark}>✓</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className={styles.error}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

export default Step1_Destinazione;
