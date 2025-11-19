import { useState, memo } from 'react';
import PropTypes from 'prop-types';
import styles from './HotelCard.module.css';

function HotelCard({ hotel, onSelect, isSelected = false }) {
  const [showDetails, setShowDetails] = useState(false);

  // Robust validation - prevent crash if hotel is invalid
  if (!hotel || !hotel.CODICE) {
    console.warn('❌ HotelCard: hotel invalido', hotel);
    return (
      <div className={styles.hotelCard} style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#6b7280' }}>Hotel non disponibile</p>
      </div>
    );
  }

  // Estrai stelle dai SERVIZI_MINIMI (es. "3 o 4 stelle" → 3, "Max 2 stelle" → 2, "5 stelle" → 5)
  const getStelle = () => {
    const servizi = hotel.SERVIZI_MINIMI || '';
    if (servizi.includes('5 stelle')) return 5;
    if (servizi.includes('3 o 4 stelle')) return 4;
    if (servizi.includes('Max 2 stelle') || servizi.includes('2 stelle')) return 2;
    return 3; // default
  };

  // Nome hotel generato da ZONA + QUARTIERE
  const getNome = () => {
    const zona = hotel.ZONA || '';
    const quartiere = hotel.QUARTIERE ? ` - ${hotel.QUARTIERE.split('|')[0].trim()}` : '';
    return `${zona}${quartiere}`;
  };

  // Calcola prezzo medio per notte (usa PRZ_PAX_NIGHT_*)
  const getPrezzoMedioNotte = () => {
    const campiPrezzo = Object.keys(hotel).filter(k => k.startsWith('PRZ_PAX_NIGHT_'));
    const prezzi = campiPrezzo
      .map(campo => parseFloat(hotel[campo]) || 0)
      .filter(p => p > 0);

    if (prezzi.length === 0) return 0;

    const media = prezzi.reduce((a, b) => a + b, 0) / prezzi.length;
    return Math.round(media);
  };

  // Formatta servizi (separati da |, rimuovi info stelle)
  const serviziArray = hotel.SERVIZI_MINIMI
    ? hotel.SERVIZI_MINIMI.split('|')
        .filter(s => s.trim())
        .filter(s => !s.includes('stelle')) // Rimuovi "Max 2 stelle", "3 o 4 stelle", ecc
    : [];

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
  const stelle = getStelle();
  const nomeHotel = getNome();

  return (
    <div className={`${styles.hotelCard} ${isSelected ? styles.selected : ''}`}>
      {/* Immagine */}
      <div className={styles.imageWrapper}>
        <img
          src={hotel.IMMAGINE_URL || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
          alt={nomeHotel}
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
            {'⭐'.repeat(stelle)}
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
            <h4 className={styles.name}>{nomeHotel}</h4>
            <p className={styles.type}>{hotel.ZONA} • {hotel.BUDGET}</p>
          </div>
        </div>

        {/* Location */}
        <div className={styles.location}>
          <span className={styles.locationIcon}>📍</span>
          <span>{hotel.QUARTIERE || hotel.ZONA}</span>
        </div>

        {/* Servizi (tutti dalla descrizione) */}
        {serviziArray.length > 0 && (
          <div className={styles.services}>
            {serviziArray.slice(0, 2).map((servizio, i) => (
              <span key={i} className={styles.service}>
                • {servizio.trim()}
              </span>
            ))}
            {serviziArray.length > 2 && (
              <span className={styles.service}>
                +{serviziArray.length - 2} altri
              </span>
            )}
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
    TIPO: PropTypes.string,
    DESTINAZIONE: PropTypes.string,
    ZONA: PropTypes.string,
    QUARTIERE: PropTypes.string,
    BUDGET: PropTypes.oneOf(['LOW', 'MEDIUM', 'HIGH']),
    SERVIZI_MINIMI: PropTypes.string,
    IMMAGINE_URL: PropTypes.string,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
};

export default memo(HotelCard);
