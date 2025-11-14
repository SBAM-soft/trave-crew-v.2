import { useState } from 'react';
import styles from './Step2_NumeroPersone.module.css';

function Step2_NumeroPersone({ numeroPersone, tipoViaggio, etaRange, genere, onChange, errors }) {
  const [customPersone, setCustomPersone] = useState(numeroPersone > 4 ? numeroPersone : '');

  const selectPersone = (num) => {
    onChange('numeroPersone', num);
    setCustomPersone('');
  };

  const handleCustomChange = (e) => {
    const value = parseInt(e.target.value) || '';
    setCustomPersone(value);
    if (value >= 5) {
      onChange('numeroPersone', value);
    }
  };

  return (
    <div className={styles.step}>
      <h2 className={styles.title}>Quante persone partecipano?</h2>
      <p className={styles.subtitle}>
        Indica il numero di viaggiatori
      </p>

      <div className={styles.peopleGrid}>
        <button
          className={`${styles.peopleBtn} ${numeroPersone === 1 ? styles.selected : ''}`}
          onClick={() => selectPersone(1)}
        >
          <span className={styles.peopleIcon}>👤</span>
          <span className={styles.peopleLabel}>Singolo</span>
        </button>

        <button
          className={`${styles.peopleBtn} ${numeroPersone === 2 ? styles.selected : ''}`}
          onClick={() => selectPersone(2)}
        >
          <span className={styles.peopleIcon}>👫</span>
          <span className={styles.peopleLabel}>Coppia</span>
        </button>

        <button
          className={`${styles.peopleBtn} ${numeroPersone === 3 ? styles.selected : ''}`}
          onClick={() => selectPersone(3)}
        >
          <span className={styles.peopleIcon}>👨‍👩‍👦</span>
          <span className={styles.peopleLabel}>Trio</span>
        </button>

        <button
          className={`${styles.peopleBtn} ${numeroPersone === 4 ? styles.selected : ''}`}
          onClick={() => selectPersone(4)}
        >
          <span className={styles.peopleIcon}>👨‍👩‍👧‍👦</span>
          <span className={styles.peopleLabel}>Gruppo 4</span>
        </button>
      </div>

      <div className={styles.customInput}>
        <label>5+ persone</label>
        <input
          type="number"
          min="5"
          max="50"
          value={customPersone}
          onChange={handleCustomChange}
          placeholder="Inserisci numero"
        />
      </div>

      {errors.numeroPersone && (
        <div className={styles.error}>⚠️ {errors.numeroPersone}</div>
      )}

      <div className={styles.divider}></div>

      <h3 className={styles.sectionTitle}>Questo viaggio è:</h3>

      <div className={styles.toggleGroup}>
        <button
          className={`${styles.toggleBtn} ${tipoViaggio === 'privato' ? styles.selected : ''}`}
          onClick={() => onChange('tipoViaggio', 'privato')}
        >
          <span className={styles.toggleIcon}>🔒</span>
          <div>
            <div className={styles.toggleTitle}>Privato</div>
            <div className={styles.toggleDesc}>Solo per te e i tuoi amici</div>
          </div>
        </button>

        <button
          className={`${styles.toggleBtn} ${tipoViaggio === 'pubblico' ? styles.selected : ''}`}
          onClick={() => onChange('tipoViaggio', 'pubblico')}
        >
          <span className={styles.toggleIcon}>🌍</span>
          <div>
            <div className={styles.toggleTitle}>Pubblico</div>
            <div className={styles.toggleDesc}>Aperto ad altri viaggiatori</div>
          </div>
        </button>
      </div>

      {tipoViaggio === 'pubblico' && (
        <div className={styles.publicOptions}>
          <div className={styles.ageRange}>
            <label>Fascia d'età partecipanti</label>
            <p className={styles.selectHint}>Seleziona una o più fasce</p>
            <div className={styles.ageButtons}>
              {['18-25', '25-35', '35-45', 'over 50'].map(fascia => (
                <button
                  key={fascia}
                  className={`${styles.ageBtn} ${
                    etaRange.includes(fascia) ? styles.selected : ''
                  }`}
                  onClick={() => {
                    if (etaRange.includes(fascia)) {
                      // Rimuovi
                      onChange('etaRange', etaRange.filter(f => f !== fascia));
                    } else {
                      // Aggiungi
                      onChange('etaRange', [...etaRange, fascia]);
                    }
                  }}
                >
                  {fascia === 'over 50' ? '50+ anni' : `${fascia} anni`}
                </button>
              ))}
            </div>
            {errors.etaRange && (
              <div className={styles.errorInline}>⚠️ {errors.etaRange}</div>
            )}
          </div>

          <div className={styles.genderSelect}>
            <label>Composizione gruppo</label>
            <div className={styles.genderButtons}>
              <button
                className={`${styles.genderBtn} ${genere === 'misto' ? styles.selected : ''}`}
                onClick={() => onChange('genere', 'misto')}
              >
                Misto
              </button>
              <button
                className={`${styles.genderBtn} ${genere === 'uomini' ? styles.selected : ''}`}
                onClick={() => onChange('genere', 'uomini')}
              >
                Solo uomini
              </button>
              <button
                className={`${styles.genderBtn} ${genere === 'donne' ? styles.selected : ''}`}
                onClick={() => onChange('genere', 'donne')}
              >
                Solo donne
              </button>
            </div>
          </div>

          {errors.genere && (
            <div className={styles.error}>⚠️ {errors.genere}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default Step2_NumeroPersone;