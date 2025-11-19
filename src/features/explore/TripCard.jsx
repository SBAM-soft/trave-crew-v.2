import { useState } from 'react';
import PropTypes from 'prop-types';
import TripCardImage from '../../components/trip-card/TripCardImage';
import TripCardHeader from '../../components/trip-card/TripCardHeader';
import TripCardInfo from '../../components/trip-card/TripCardInfo';
import TripCardFooter from '../../components/trip-card/TripCardFooter';
import TripTimeline from '../../components/trip-card/TripTimeline';
import styles from './TripCard.module.css';

/**
 * TripCard - Card del viaggio (Refactored Phase 2)
 *
 * Componente principale che orchestra i sotto-componenti:
 * - TripCardImage: Immagine + badges
 * - TripCardHeader: Titolo + metadata
 * - TripCardInfo: Info viaggio
 * - TripCardFooter: Prezzo + azioni
 * - TripTimeline: Timeline itinerario
 */
function TripCard({ viaggio }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Utility: Get budget label
  const getBudgetLabel = (budget) => {
    const labels = {
      'LOW': '€ Economico',
      'MEDIUM': '€€ Medio',
      'HIGH': '€€€ Lusso'
    };
    return labels[budget] || budget;
  };

  // Utility: Get stato badge config
  const getStatoBadge = (stato) => {
    const badges = {
      'aperto': { label: '✓ Posti disponibili', variant: 'success' },
      'completo': { label: '✕ Completo', variant: 'danger' },
      'in_corso': { label: '✈️ In corso', variant: 'info' }
    };
    return badges[stato] || { label: stato, variant: 'default' };
  };

  // Utility: Get genere label
  const getGenereLabel = (genere) => {
    const labels = {
      'misto': '👫 Misto',
      'donne': '👩 Solo donne',
      'uomini': '👨 Solo uomini'
    };
    return labels[genere] || genere;
  };

  // Prepare data for sub-components
  const statoBadge = getStatoBadge(viaggio.STATO);

  const badges = [
    { label: statoBadge.label, variant: statoBadge.variant }
  ];

  const metadata = [
    { icon: '📍', value: viaggio.DESTINAZIONE },
    { icon: '📅', value: `${viaggio.DURATA_GIORNI} giorni` },
    { value: getBudgetLabel(viaggio.BUDGET_CATEGORIA) }
  ];

  const infoItems = [
    {
      label: 'Età',
      value: `${viaggio.ETA_MIN}-${viaggio.ETA_MAX} anni`
    },
    {
      label: 'Genere',
      value: getGenereLabel(viaggio.GENERE)
    }
  ];

  return (
    <div className={styles.card}>
      {/* Image with badges */}
      <TripCardImage
        imageUrl={viaggio.IMMAGINE_URL}
        imageAlt={viaggio.TITOLO}
        badges={badges}
      />

      {/* Card content */}
      <div className={styles.content}>
        {/* Header: Title + Metadata */}
        <TripCardHeader
          title={viaggio.TITOLO}
          metadata={metadata}
        />

        {/* Description */}
        <p className={styles.description}>
          {viaggio.DESCRIZIONE}
        </p>

        {/* Info: Age, Gender, etc */}
        <TripCardInfo items={infoItems} />

        {/* Footer: Price + Actions */}
        <TripCardFooter
          price={viaggio.COSTO_TOTALE_PP}
          onButtonClick={() => setIsExpanded(!isExpanded)}
          expanded={isExpanded}
        />

        {/* Timeline (expandable) */}
        <TripTimeline
          days={viaggio.DURATA_GIORNI}
          destination={viaggio.DESTINAZIONE}
          expanded={isExpanded}
        />
      </div>
    </div>
  );
}

TripCard.propTypes = {
  viaggio: PropTypes.shape({
    CODICE: PropTypes.string.isRequired,
    TITOLO: PropTypes.string.isRequired,
    DESTINAZIONE: PropTypes.string.isRequired,
    DESCRIZIONE: PropTypes.string,
    IMMAGINE_URL: PropTypes.string,
    DURATA_GIORNI: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    BUDGET_CATEGORIA: PropTypes.oneOf(['LOW', 'MEDIUM', 'HIGH']),
    STATO: PropTypes.oneOf(['aperto', 'completo', 'in_corso']),
    COSTO_TOTALE_PP: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    ETA_MIN: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    ETA_MAX: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    GENERE: PropTypes.oneOf(['misto', 'donne', 'uomini']),
  }).isRequired,
};

export default TripCard;
