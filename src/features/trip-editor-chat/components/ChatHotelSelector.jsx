import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './ChatHotelSelector.module.css';

/**
 * Componente per selezione hotel (tier + extra)
 */
function ChatHotelSelector({ zona, notti, tiers, extras = [], onSelect }) {
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [note, setNote] = useState('');

  const handleTierSelect = (tierId) => {
    setSelectedTier(tierId);
  };

  const handleExtraToggle = (extraId) => {
    setSelectedExtras(prev => {
      if (prev.includes(extraId)) {
        return prev.filter(id => id !== extraId);
      } else {
        return [...prev, extraId];
      }
    });
  };

  const handleConfirm = () => {
    if (!selectedTier) return;

    const selectedExtrasData = extras.filter(e => selectedExtras.includes(e.id));

    if (onSelect) {
      onSelect({
        tier: selectedTier,
        extras: selectedExtrasData,
        note
      });
    }
  };

  // Calcola costo totale
  const calculateTotal = () => {
    if (!selectedTier) return 0;

    const tierData = tiers.find(t => t.id === selectedTier);
    const tierCost = tierData ? tierData.prezzo * notti : 0;

    const extrasCost = selectedExtras.reduce((sum, extraId) => {
      const extra = extras.find(e => e.id === extraId);
      return sum + (extra ? extra.prezzo * notti : 0);
    }, 0);

    return tierCost + extrasCost;
  };

  return (
    <div className={styles.hotelSelector}>
      <div className={styles.header}>
        <h3>🏨 Hotel per {zona}</h3>
        <span className={styles.nights}>{notti} {notti === 1 ? 'notte' : 'notti'}</span>
      </div>

      <div className={styles.tiersGrid}>
        {tiers.map(tier => (
          <div
            key={tier.id}
            className={`${styles.tierCard} ${selectedTier === tier.id ? styles.selected : ''} ${tier.recommended ? styles.recommended : ''}`}
            onClick={() => handleTierSelect(tier.id)}
          >
            {tier.recommended && (
              <div className={styles.recommendedBadge}>⭐ CONSIGLIATO</div>
            )}

            <div className={styles.tierHeader}>
              <span className={styles.tierEmoji}>{tier.emoji}</span>
              <span className={styles.tierName}>{tier.nome}</span>
            </div>

            <div className={styles.tierPrice}>
              €{tier.prezzo}
              <span className={styles.priceLabel}>/notte</span>
            </div>

            <ul className={styles.tierFeatures}>
              {tier.features.map((feature, idx) => (
                <li key={idx}>• {feature}</li>
              ))}
            </ul>

            <div className={styles.tierTotal}>
              Totale: €{tier.prezzo * notti}
            </div>

            {selectedTier === tier.id && (
              <div className={styles.checkmark}>✓</div>
            )}
          </div>
        ))}
      </div>

      {selectedTier && extras.length > 0 && (
        <div className={styles.extrasSection}>
          <h4>➕ Extra hotel</h4>
          <div className={styles.extrasList}>
            {extras.map(extra => (
              <label key={extra.id} className={styles.extraItem}>
                <input
                  type="checkbox"
                  checked={selectedExtras.includes(extra.id)}
                  onChange={() => handleExtraToggle(extra.id)}
                />
                <div className={styles.extraInfo}>
                  <span className={styles.extraName}>{extra.nome}</span>
                  {extra.descrizione && (
                    <span className={styles.extraDesc}>{extra.descrizione}</span>
                  )}
                </div>
                <span className={styles.extraPrice}>+€{extra.prezzo}/notte</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {selectedTier && (
        <div className={styles.notesSection}>
          <label className={styles.notesLabel}>💬 Preferenze (opzionale)</label>
          <textarea
            className={styles.notesInput}
            placeholder="Es: vicino alla metro, quartiere tranquillo..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        </div>
      )}

      {selectedTier && (
        <div className={styles.footer}>
          <div className={styles.totalCost}>
            <span className={styles.totalLabel}>Costo totale</span>
            <span className={styles.totalAmount}>€{calculateTotal()}</span>
          </div>
          <button
            className={styles.confirmButton}
            onClick={handleConfirm}
            type="button"
          >
            ✅ Conferma hotel
          </button>
        </div>
      )}
    </div>
  );
}

ChatHotelSelector.propTypes = {
  zona: PropTypes.string.isRequired,
  notti: PropTypes.number.isRequired,
  tiers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    nome: PropTypes.string.isRequired,
    emoji: PropTypes.string,
    prezzo: PropTypes.number.isRequired,
    recommended: PropTypes.bool,
    features: PropTypes.arrayOf(PropTypes.string)
  })).isRequired,
  extras: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    nome: PropTypes.string.isRequired,
    prezzo: PropTypes.number.isRequired,
    descrizione: PropTypes.string
  })),
  onSelect: PropTypes.func
};

export default ChatHotelSelector;
