import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  getClimateInfo,
  getSuggestedDates,
  getQuickDates
} from '../../core/utils/seasonalityData';
import Button from '../../shared/Button';
import styles from './Step5_DataPartenza.module.css';

function Step5_DataPartenza({ value, onChange, destinazione }) {
  // Calcola le date suggerite basate sulla destinazione
  const suggestedDates = useMemo(() => {
    if (!destinazione) return [];
    return getSuggestedDates(destinazione);
  }, [destinazione]);

  // Ottieni info sul clima per la data selezionata
  const climateInfo = useMemo(() => {
    if (!value || !destinazione) return null;
    return getClimateInfo(destinazione, value);
  }, [value, destinazione]);

  // Quick date options
  const quickDates = useMemo(() => getQuickDates(), []);

  // Handler per quick date selection
  const handleQuickDate = (getDays) => {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + getDays());
    onChange(targetDate.toISOString().split('T')[0]);
  };

  // Handler per date suggerite
  const handleSuggestedDate = (dateString) => {
    onChange(dateString);
  };

  return (
    <div className={styles.step}>
      <h2 className={styles.title}>Quando vuoi partire?</h2>
      <p className={styles.subtitle}>
        Scegli una data di partenza indicativa (opzionale)
      </p>

      {/* Quick Date Selector */}
      <div className={styles.quickDates}>
        <h3 className={styles.sectionTitle}>🚀 Selezione Rapida</h3>
        <div className={styles.quickDateButtons}>
          {quickDates.map((quick, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              onClick={() => handleQuickDate(quick.getDays)}
            >
              {quick.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Suggested Dates (basate sulla destinazione) */}
      {suggestedDates.length > 0 && (
        <div className={styles.suggestedDates}>
          <h3 className={styles.sectionTitle}>
            ⭐ Date Consigliate per {destinazione}
          </h3>
          <div className={styles.suggestedGrid}>
            {suggestedDates.map((suggestion, idx) => (
              <div
                key={idx}
                className={`${styles.suggestionCard} ${
                  value === suggestion.date ? styles.selected : ''
                }`}
                onClick={() => handleSuggestedDate(suggestion.date)}
              >
                <div className={styles.suggestionDate}>{suggestion.label}</div>
                <div className={styles.suggestionReason}>
                  🌤️ {suggestion.reason}
                </div>
                <div className={`${styles.suggestionPrice} ${
                  suggestion.priceLevel === 'Alta' ? styles.priceHigh :
                  suggestion.priceLevel === 'Media-Alta' ? styles.priceMediumHigh :
                  suggestion.priceLevel === 'Media' ? styles.priceMedium :
                  styles.priceLow
                }`}>
                  💰 Prezzo: {suggestion.priceLevel}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Date Input */}
      <div className={styles.dateContainer}>
        <h3 className={styles.sectionTitle}>📅 Oppure Scegli Manualmente</h3>

        <input
          type="date"
          className={styles.dateInput}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />

        <p className={styles.dateNote}>
          Puoi modificare la data in qualsiasi momento
        </p>
      </div>

      {/* Climate Info (quando una data è selezionata) */}
      {climateInfo && (
        <div className={styles.climateInfo}>
          <h3 className={styles.sectionTitle}>🌍 Info Clima e Stagione</h3>
          <div className={styles.climateCard}>
            <div className={styles.climateRow}>
              <span className={styles.climateLabel}>Stagione:</span>
              <span className={styles.climateValue}>{climateInfo.season}</span>
            </div>
            <div className={styles.climateRow}>
              <span className={styles.climateLabel}>Meteo Tipico:</span>
              <span className={styles.climateValue}>{climateInfo.weather}</span>
            </div>
            <div className={styles.climateRow}>
              <span className={styles.climateLabel}>Temperatura:</span>
              <span className={styles.climateValue}>{climateInfo.temp}</span>
            </div>
            <div className={styles.climateRow}>
              <span className={styles.climateLabel}>Livello Prezzi:</span>
              <span className={`${styles.climateValue} ${
                climateInfo.price === 'Alta' ? styles.priceHigh :
                climateInfo.price.includes('Media') ? styles.priceMedium :
                styles.priceLow
              }`}>
                {climateInfo.price}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.skipNote}>
        💡 Puoi saltare questo step e decidere la data dopo
      </div>
    </div>
  );
}

Step5_DataPartenza.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  destinazione: PropTypes.string,
};

export default memo(Step5_DataPartenza);