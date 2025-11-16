import { useState, memo } from 'react';
import PropTypes from 'prop-types';
import styles from './HotelCard.module.css';

function HotelCard({ hotel, onSelect, isSelected = false }) {
  const [showDetails, setShowDetails] = useState(false);

  // Robust validation - prevent crash if hotel is invalid
  if (!hotel || !hotel.NOME || !hotel.CODICE) {
    return (
      <div className={styles.hotelCard} style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#6b7280' }}>Hotel non disponibile</p>
      </div>
    );
  }

  // Calcola prezzo medio per notte
  const getPrezzoMedioNotte = () => {
    const mesi = [
      'PRZ_NOTTE_GEN', 'PRZ_NOTTE_FEB', 'PRZ_NOTTE_MAR', 'PRZ_NOTTE_APR',
      'PRZ_NOTTE_MAG', 'PRZ_NOTTE_GIU', 'PRZ_NOTTE_LUG', 'PRZ_NOTTE_AGO',
      'PRZ_NOTTE_SET', 'PRZ_NOTTE_OTT', 'PRZ_NOTTE_NOV', 'PRZ_NOTTE_DIC'
    ];
    const prezzi = mesi.map(mese => parseFloat(hotel[mese]) || 0).filter(p => p > 0);
    const media = prezzi.reduce((a, b) => a + b, 0) / prezzi.length;
    return Math.round(media);
  };

  // Formatta servizi
  const serviziArray = hotel.SERVIZI_MINIMI ? hotel.SERVIZI_MINIMI.split(';').filter(s => s.trim()) : [];

  // Badge budget
  const getBudgetBadge = () => {
    const badges = {
      LOW: { text: '€', color: '#10b981' },
      MEDIUM: { text: '€€', color: '#f59e0b' },
      HIGH: { text: '€€€', color: '#ef4444' }
    };
    return badges[hotel.BUDGET] || badges.MEDIUM;
  };

  const budgetBadge = getBudgetBadge();
  const prezzoMedio = getPrezzoMedioNotte();

  return (
    <div className={`${styles.hotelCard} ${isSelected ? styles.selected : ''}`}>
      {/* Immagine */}
      <div className={styles.imageWrapper}>
        <img
          src={hotel.IMMAGINE_URL || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
          alt={hotel.NOME}
          className={styles.image}
        />

        {/* Badges */}
        <div className={styles.badges}>
          <span
            className={styles.budgetBadge}
            style={{ backgroundColor: budgetBadge.color }}
          >
            {budgetBadge.text}
          </span>
          <span className={styles.starsBadge}>
            {'⭐'.repeat(hotel.STELLE || 3)}
          </span>
        </div>

        {isSelected && (
          <div className={styles.selectedOverlay}>
            <div className={styles.checkmark}>✓</div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h4 className={styles.name}>{hotel.NOME}</h4>
            <p className={styles.type}>{hotel.TIPO_STRUTTURA}</p>
          </div>
        </div>

        {/* Location */}
        <div className={styles.location}>
          <span className={styles.locationIcon}>📍</span>
          <span>{hotel.QUARTIERE || hotel.ZONA}</span>
        </div>

        {/* Description (collapsible) */}
        {hotel.DESCRIZIONE && hotel.DESCRIZIONE.length > 0 && (
          <p className={styles.description}>
            {showDetails ? hotel.DESCRIZIONE : `${hotel.DESCRIZIONE.substring(0, 100)}...`}
            {hotel.DESCRIZIONE.length > 100 && (
              <button
                className={styles.toggleBtn}
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Mostra meno' : 'Leggi tutto'}
              </button>
            )}
          </p>
        )}

        {/* Features */}
        <div className={styles.features}>
          {hotel.COLAZIONE_INCLUSA === 'si' && (
            <span className={styles.feature}>🍳 Colazione</span>
          )}
          {hotel.WIFI === 'si' && (
            <span className={styles.feature}>📶 WiFi</span>
          )}
          {hotel.PISCINA === 'si' && (
            <span className={styles.feature}>🏊 Piscina</span>
          )}
        </div>

        {/* Servizi (primi 3) */}
        {serviziArray.length > 0 && (
          <div className={styles.services}>
            {serviziArray.slice(0, 3).map((servizio, i) => (
              <span key={i} className={styles.service}>
                • {servizio.trim()}
              </span>
            ))}
            {serviziArray.length > 3 && (
              <span className={styles.service}>
                +{serviziArray.length - 3} altri
              </span>
            )}
          </div>
        )}

        {/* Recensioni */}
        {hotel.RECENSIONE_MEDIA && (
          <div className={styles.reviews}>
            <span className={styles.rating}>
              ⭐ {hotel.RECENSIONE_MEDIA}
            </span>
            <span className={styles.reviewCount}>
              ({hotel.NUMERO_RECENSIONI} recensioni)
            </span>
          </div>
        )}

        {/* Footer: Prezzo e Azione */}
        <div className={styles.footer}>
          <div className={styles.price}>
            <span className={styles.priceLabel}>Media a notte</span>
            <span className={styles.priceValue}>€{prezzoMedio}</span>
          </div>
          <button
            className={`${styles.selectBtn} ${isSelected ? styles.selectedBtn : ''}`}
            onClick={() => onSelect(hotel)}
          >
            {isSelected ? '✓ Selezionato' : 'Seleziona'}
          </button>
        </div>
      </div>
    </div>
  );
}

HotelCard.propTypes = {
  hotel: PropTypes.shape({
    CODICE: PropTypes.string.isRequired,
    NOME: PropTypes.string.isRequired,
    DESCRIZIONE: PropTypes.string,
    TIPO_STRUTTURA: PropTypes.string,
    ZONA: PropTypes.string,
    QUARTIERE: PropTypes.string,
    BUDGET: PropTypes.oneOf(['LOW', 'MEDIUM', 'HIGH']),
    STELLE: PropTypes.number,
    IMMAGINE_URL: PropTypes.string,
    COLAZIONE_INCLUSA: PropTypes.oneOf(['si', 'no']),
    WIFI: PropTypes.oneOf(['si', 'no']),
    PISCINA: PropTypes.oneOf(['si', 'no']),
    SERVIZI_MINIMI: PropTypes.string,
    RECENSIONE_MEDIA: PropTypes.number,
    NUMERO_RECENSIONI: PropTypes.number,
    PRZ_NOTTE_GEN: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    PRZ_NOTTE_FEB: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    PRZ_NOTTE_MAR: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    PRZ_NOTTE_APR: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    PRZ_NOTTE_MAG: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    PRZ_NOTTE_GIU: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    PRZ_NOTTE_LUG: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    PRZ_NOTTE_AGO: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    PRZ_NOTTE_SET: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    PRZ_NOTTE_OTT: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    PRZ_NOTTE_NOV: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    PRZ_NOTTE_DIC: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
};

export default memo(HotelCard);
