// src/components/explore/TripCard.jsx
import styles from './TripCard.module.css';

function TripCard({ viaggio }) {
  const getBudgetLabel = (budget) => {
    const labels = {
      'LOW': '€ Economico',
      'MEDIUM': '€€ Medio',
      'HIGH': '€€€ Lusso'
    };
    return labels[budget] || budget;
  };

  const getStatoBadge = (stato) => {
    const badges = {
      'aperto': { label: '✓ Posti disponibili', className: styles.badgeSuccess },
      'completo': { label: '✕ Completo', className: styles.badgeDanger },
      'in_corso': { label: '✈️ In corso', className: styles.badgeInfo }
    };
    return badges[stato] || { label: stato, className: styles.badgeDefault };
  };

  const statoBadge = getStatoBadge(viaggio.STATO);

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img 
          src={viaggio.IMMAGINE_URL} 
          alt={viaggio.TITOLO}
          className={styles.image}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828';
          }}
        />
        <div className={styles.badges}>
          <span className={statoBadge.className}>
            {statoBadge.label}
          </span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{viaggio.TITOLO}</h3>
          <div className={styles.meta}>
            <span>📍 {viaggio.DESTINAZIONE}</span>
            <span>•</span>
            <span>📅 {viaggio.DURATA_GIORNI} giorni</span>
            <span>•</span>
            <span>{getBudgetLabel(viaggio.BUDGET_CATEGORIA)}</span>
          </div>
        </div>

        <p className={styles.description}>
          {viaggio.DESCRIZIONE}
        </p>

        {/* Info viaggio - RIMOSSA la riga "Tipo" */}
        <div className={styles.info}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Età:</span>
            <span>{viaggio.ETA_MIN}-{viaggio.ETA_MAX} anni</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Genere:</span>
            <span>{viaggio.GENERE === 'misto' ? '👫 Misto' : viaggio.GENERE === 'donne' ? '👩 Solo donne' : '👨 Solo uomini'}</span>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.price}>
            <span className={styles.priceLabel}>da</span>
            <span className={styles.priceAmount}>€{viaggio.COSTO_TOTALE_PP}</span>
            <span className={styles.priceLabel}>/ persona</span>
          </div>
          <button className={styles.button}>
            Vedi dettagli →
          </button>
        </div>
      </div>
    </div>
  );
}

export default TripCard;