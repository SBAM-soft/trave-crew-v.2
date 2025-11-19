import PropTypes from 'prop-types';
import Timeline from '../ui/Timeline';
import styles from './TripTimeline.module.css';

/**
 * TripTimeline - Timeline del viaggio con giorni
 *
 * Props:
 * - days: Durata del viaggio in giorni
 * - destination: Destinazione del viaggio
 * - expanded: Se true, mostra la timeline
 */
function TripTimeline({ days, destination, expanded = false }) {
  if (!expanded) return null;

  // Genera timeline giorni
  const generateTimeline = () => {
    const timeline = [];
    const durataGiorni = parseInt(days) || 3;

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

    for (let i = 1; i <= durataGiorni; i++) {
      let type, title, description;

      if (i === 1) {
        type = 'arrival';
        title = `Giorno ${i} - Arrivo`;
        description = `Arrivo a ${destination} e sistemazione in hotel`;
      } else if (i === durataGiorni) {
        type = 'departure';
        title = `Giorno ${i} - Partenza`;
        description = `Check-out e partenza da ${destination}`;
      } else {
        type = 'experience';
        title = `Giorno ${i} - Esplorazione`;
        description = `Giornata di esperienze e attività a ${destination}`;
      }

      timeline.push({
        title,
        description,
        icon: getDayTypeIcon(type),
        color: getDayTypeColor(type),
      });
    }

    return timeline;
  };

  const timeline = generateTimeline();

  return (
    <div className={styles.timelineSection}>
      <h4 className={styles.timelineTitle}>📅 Itinerario del viaggio</h4>
      <Timeline items={timeline} variant="vertical" showConnector={true} />
    </div>
  );
}

TripTimeline.propTypes = {
  days: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  destination: PropTypes.string.isRequired,
  expanded: PropTypes.bool,
};

export default TripTimeline;
