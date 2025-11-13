import styles from './Step4_Interessi.module.css';

function Step4_Interessi({ value, onChange, error }) {
  const interessi = [
    { id: 'mare', label: 'Mare', icon: '🏖️' },
    { id: 'cultura', label: 'Cultura', icon: '🏛️' },
    { id: 'avventura', label: 'Avventura', icon: '🏔️' },
    { id: 'cibo', label: 'Cibo', icon: '🍜' },
    { id: 'relax', label: 'Relax', icon: '🧘' },
    { id: 'vita-notturna', label: 'Vita notturna', icon: '🎉' },
    { id: 'sport', label: 'Sport', icon: '⚽' },
    { id: 'natura', label: 'Natura', icon: '🌿' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'fotografia', label: 'Fotografia', icon: '📸' }
  ];

  const toggleInteresse = (id) => {
    if (value.includes(id)) {
      // Rimuovi
      onChange(value.filter(i => i !== id));
    } else {
      // Aggiungi
      onChange([...value, id]);
    }
  };

  return (
    <div className={styles.step}>
      <h2 className={styles.title}>Quali sono i tuoi interessi?</h2>
      <p className={styles.subtitle}>
        Seleziona almeno un interesse (puoi sceglierne più di uno)
      </p>

      <div className={styles.selectedCount}>
        {value.length > 0 ? (
          <span className={styles.countBadge}>
            ✓ {value.length} interess{value.length === 1 ? 'e' : 'i'} selezionat{value.length === 1 ? 'o' : 'i'}
          </span>
        ) : (
          <span className={styles.countPlaceholder}>
            Nessun interesse selezionato
          </span>
        )}
      </div>

      <div className={styles.interessiGrid}>
        {interessi.map(interesse => (
          <button
            key={interesse.id}
            className={`${styles.interesseCard} ${
              value.includes(interesse.id) ? styles.selected : ''
            }`}
            onClick={() => toggleInteresse(interesse.id)}
          >
            <div className={styles.interesseIcon}>{interesse.icon}</div>
            <div className={styles.interesseLabel}>{interesse.label}</div>
            
            {value.includes(interesse.id) && (
              <div className={styles.checkmark}>✓</div>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className={styles.error}>
          ⚠️ {error}
        </div>
      )}

      <div className={styles.hint}>
        💡 <strong>Suggerimento:</strong> Scegli 2-3 interessi per un viaggio bilanciato
      </div>
    </div>
  );
}

export default Step4_Interessi;