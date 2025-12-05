import PropTypes from 'prop-types';
import Timeline from '../ui/Timeline';
import { BLOCK_TYPE, BLOCK_CONFIG } from '../../core/constants';
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

  // Genera timeline giorni usando BLOCK_CONFIG
  const generateTimeline = () => {
    const timeline = [];
    const durataGiorni = parseInt(days) || 3;

    for (let i = 1; i <= durataGiorni; i++) {
      let type, title, description;

      if (i === 1) {
        // Giorno 1 - BLOCCO TECNICO ARRIVO
        type = BLOCK_TYPE.ARRIVAL;
        title = `Giorno ${i} - ${BLOCK_CONFIG[BLOCK_TYPE.ARRIVAL].label}`;
        description = BLOCK_CONFIG[BLOCK_TYPE.ARRIVAL].description(destination);
      } else if (i === durataGiorni) {
        // Ultimo giorno - BLOCCO TECNICO PARTENZA
        type = BLOCK_TYPE.DEPARTURE;
        title = `Giorno ${i} - ${BLOCK_CONFIG[BLOCK_TYPE.DEPARTURE].label}`;
        description = BLOCK_CONFIG[BLOCK_TYPE.DEPARTURE].description(destination);
      } else {
        // Giorni intermedi - ESPERIENZE
        type = BLOCK_TYPE.EXPERIENCE;
        title = `Giorno ${i} - Esplorazione`;
        description = `Giornata di esperienze e attività a ${destination}`;
      }

      const blockConfig = BLOCK_CONFIG[type];
      timeline.push({
        title,
        description,
        icon: blockConfig.icon,
        color: blockConfig.color,
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
