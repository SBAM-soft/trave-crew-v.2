import styles from './Step3_Budget.module.css';

function Step3_Budget({ value, onChange }) {
  const budgetOptions = [
  {
    id: 'LOW',
    title: 'Economy',
    icon: '💰',
    description: 'Essenziale e conveniente',
    features: [
      'Ostelli e hotel basic',
      'Trasporti locali',
      'Esperienze base',
      'Voli low-cost con scali'
    ]
  },
  {
    id: 'MEDIUM',
    title: 'Comfort',
    icon: '✨',
    description: 'Bilanciato e completo',
    features: [
      'Hotel 3-4★',
      'Mix trasporti pubblici/privati',
      'Esperienze varie',
      'Voli diretti economy'
    ],
    recommended: true
  },
  {
    id: 'HIGH',
    title: 'Lusso',
    icon: '👑',
    description: 'Premium e esclusivo',
    features: [
      'Hotel 5★ e resort',
      'Transfer privati',
      'Esperienze VIP',
      'Voli business class'
    ]
  }
];

  return (
    <div className={styles.step}>
      <h2 className={styles.title}>Qual è il tuo budget?</h2>
      <p className={styles.subtitle}>
        Scegli la fascia di prezzo che preferisci (puoi saltare questo step)
      </p>

      <div className={styles.budgetGrid}>
        {budgetOptions.map(budget => (
          <div
            key={budget.id}
            className={`${styles.budgetCard} ${value === budget.id ? styles.selected : ''}`}
            onClick={() => onChange(budget.id)}
          >
            {budget.recommended && (
              <div className={styles.recommendedBadge}>
                ⭐ Consigliato
              </div>
            )}

            <div className={styles.budgetIcon}>{budget.icon}</div>
            
            <h3 className={styles.budgetTitle}>{budget.title}</h3>
            <p className={styles.budgetDesc}>{budget.description}</p>
            
            
            <ul className={styles.featuresList}>
              {budget.features.map((feature, idx) => (
                <li key={idx}>
                  <span className={styles.checkIcon}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            {value === budget.id && (
              <div className={styles.selectedCheck}>✓</div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.skipNote}>
        💡 <strong>Nota:</strong> Puoi saltare questo step e scegliere il budget dopo
      </div>
    </div>
  );
}

export default Step3_Budget;