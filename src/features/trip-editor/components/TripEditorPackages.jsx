import PEXPCard from '../PEXPCard';
import styles from './TripEditorPackages.module.css';

/**
 * Componente per visualizzare grid di pacchetti filtrati
 */
function TripEditorPackages({ pacchetti, selectedZone, onPacchettoClick }) {
  if (!pacchetti || pacchetti.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📦</div>
        <p className={styles.emptyTitle}>
          {selectedZone
            ? 'Nessun pacchetto disponibile per questa zona'
            : 'Seleziona una zona sulla mappa'}
        </p>
        <p className={styles.emptyDescription}>
          {selectedZone
            ? 'Prova a selezionare un\'altra zona'
            : 'Clicca su una zona per vedere i pacchetti disponibili'}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Pacchetti disponibili {selectedZone && `per ${selectedZone.ZONA}`}
        </h3>
        <span className={styles.count}>
          {pacchetti.length} {pacchetti.length === 1 ? 'pacchetto' : 'pacchetti'}
        </span>
      </div>

      <div className={styles.grid}>
        {pacchetti.map((pexp) => (
          <PEXPCard
            key={pexp.CODICE || pexp.id}
            pexp={pexp}
            onClick={() => onPacchettoClick(pexp)}
          />
        ))}
      </div>
    </div>
  );
}

export default TripEditorPackages;
