// src/components/explore/TripGrid.jsx
import TripCard from './TripCard';
import styles from './TripGrid.module.css';

function TripGrid({ viaggi }) {
  if (viaggi.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🔍</div>
        <h3>Nessun viaggio trovato</h3>
        <p>Prova a modificare i filtri per vedere più risultati</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {viaggi.map((viaggio) => (
        <TripCard key={viaggio.CODICE} viaggio={viaggio} />
      ))}
    </div>
  );
}

export default TripGrid;