// src/components/explore/TripCard.jsx
import { useState } from 'react';
import styles from './TripCard.module.css';

function TripCard({ viaggio }) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Genera timeline giorni (semplificata)
  const generateTimeline = () => {
    const giorni = [];
    const durataGiorni = parseInt(viaggio.DURATA_GIORNI) || 3;

    for (let i = 1; i <= durataGiorni; i++) {
      if (i === 1) {
        giorni.push({
          day: i,
          type: 'arrival',
          title: `Giorno ${i} - Arrivo`,
          description: `Arrivo a ${viaggio.DESTINAZIONE} e sistemazione in hotel`
        });
      } else if (i === durataGiorni) {
        giorni.push({
          day: i,
          type: 'departure',
          title: `Giorno ${i} - Partenza`,
          description: `Check-out e partenza da ${viaggio.DESTINAZIONE}`
        });
      } else {
        giorni.push({
          day: i,
          type: 'experience',
          title: `Giorno ${i} - Esplorazione`,
          description: `Giornata di esperienze e attività a ${viaggio.DESTINAZIONE}`
        });
      }
    }

    return giorni;
  };

  const timeline = generateTimeline();

  const getDayTypeIcon = (type) => {
    switch (type) {
      case 'arrival':
        return '✈️';
      case 'departure':
        return '🏠';
      case 'experience':
        return '⭐';
      default:
        return '📍';
    }
  };

  const getDayTypeColor = (type) => {
    switch (type) {
      case 'arrival':
        return '#fbbf24';
      case 'departure':
        return '#ef4444';
      case 'experience':
        return '#667eea';
      default:
        return '#6b7280';
    }
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
          <button
            className={styles.button}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '▲ Chiudi itinerario' : '▼ Vedi itinerario'}
          </button>
        </div>

        {/* Timeline espandibile */}
        {isExpanded && (
          <div className={styles.timelineSection}>
            <h4 className={styles.timelineTitle}>📅 Itinerario del viaggio</h4>
            <div className={styles.timeline}>
              {timeline.map((giorno, index) => (
                <div
                  key={giorno.day}
                  className={`${styles.timelineDay} ${index === timeline.length - 1 ? styles.last : ''}`}
                >
                  {/* Timeline line */}
                  {index < timeline.length - 1 && <div className={styles.timelineLine} />}

                  {/* Day marker */}
                  <div
                    className={styles.dayMarker}
                    style={{ backgroundColor: getDayTypeColor(giorno.type) }}
                  >
                    <span className={styles.dayIcon}>{getDayTypeIcon(giorno.type)}</span>
                  </div>

                  {/* Day content */}
                  <div className={styles.dayContent}>
                    <h5 className={styles.dayTitle}>{giorno.title}</h5>
                    <p className={styles.dayDescription}>{giorno.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TripCard;