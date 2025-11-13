import { useState } from 'react';
import styles from './MapInteractive.module.css';

function MapInteractive({ destinazione, zone, selectedZone, onZoneClick }) {
  const [hoveredZone, setHoveredZone] = useState(null);

  // Placeholder immagine mappa
  const destinazioneName = (destinazione?.NOME || destinazione?.STATO || 'Destinazione')
    .replace(/\s+/g, '+'); // Sostituisce spazi con +
  const mapPlaceholder = `https://via.placeholder.com/800x500/667eea/ffffff?text=${destinazioneName}`;

  return (
    <div className={styles.mapContainer}>
      {/* Header mappa */}
      <div className={styles.mapHeader}>
        <h3 className={styles.mapTitle}>🗺️ {destinazione?.STATO || 'Destinazione'}</h3>
        <p className={styles.mapSubtitle}>Seleziona una zona per vedere i pacchetti disponibili</p>
      </div>

      {/* Immagine mappa placeholder */}
      <div className={styles.mapImageWrapper}>
        <img 
          src={destinazione?.IMMAGINE_URL || mapPlaceholder}
          alt={`Mappa di ${destinazione?.STATO}`}
          className={styles.mapImage}
        />
        <div className={styles.mapOverlay}>
          <span className={styles.mapLabel}>Vista mappa interattiva</span>
        </div>
      </div>

      {/* Zone disponibili */}
      <div className={styles.zonesSection}>
        <h4 className={styles.zonesTitle}>Zone disponibili:</h4>
        <div className={styles.zonesGrid}>
          {zone && zone.length > 0 ? (
            zone.map((zona) => (
              <div
                key={zona.CODICE}
                className={`${styles.zoneCard} ${
                  selectedZone === zona.CODICE ? styles.selected : ''
                } ${hoveredZone === zona.CODICE ? styles.hovered : ''}`}
                onClick={() => onZoneClick(zona)}
                onMouseEnter={() => setHoveredZone(zona.CODICE)}
                onMouseLeave={() => setHoveredZone(null)}
              >
                {/* Badge tipo area */}
                <div className={styles.zoneBadge} data-type={zona.TIPO_AREA}>
                  {zona.TIPO_AREA === 'città' && '🏙️'}
                  {zona.TIPO_AREA === 'mare' && '🏖️'}
                  {zona.TIPO_AREA === 'montagna' && '⛰️'}
                  {zona.TIPO_AREA === 'natura' && '🌿'}
                  {zona.TIPO_AREA === 'deserto' && '🏜️'}
                  {zona.TIPO_AREA === 'città-cultura' && '🏛️'}
                  {zona.TIPO_AREA === 'città-mare' && '🌊'}
                  {!zona.TIPO_AREA && '📍'}
                </div>

                {/* Nome zona */}
                <h5 className={styles.zoneName}>{zona.ZONA}</h5>

                {/* Descrizione breve */}
                <p className={styles.zoneDescription}>
                  {zona.DESCRIZIONE ? 
                    `${zona.DESCRIZIONE.substring(0, 80)}...` : 
                    'Scopri questa zona'}
                </p>

                {/* Info aggiuntive */}
                <div className={styles.zoneInfo}>
                  {zona.GIORNI_CONSIGLIATI && (
                    <span className={styles.infoItem}>
                      📅 {zona.GIORNI_CONSIGLIATI} giorni
                    </span>
                  )}
                  {zona.CITTA_PRINCIPALE && (
                    <span className={styles.infoItem}>
                      📍 {zona.CITTA_PRINCIPALE}
                    </span>
                  )}
                </div>

                {/* Indicatore selezione */}
                {selectedZone === zona.CODICE && (
                  <div className={styles.selectedIndicator}>
                    ✓ Selezionata
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={styles.noZones}>
              <p>Nessuna zona disponibile per questa destinazione</p>
            </div>
          )}
        </div>
      </div>

      {/* Info selezionata */}
      {selectedZone && (
        <div className={styles.selectedInfo}>
          {(() => {
            const zona = zone.find(z => z.CODICE === selectedZone);
            return zona ? (
              <>
                <h4>📌 Zona selezionata: {zona.ZONA}</h4>
                <p>{zona.DESCRIZIONE}</p>
                {zona.CARATTERISTICHE && (
                  <div className={styles.caratteristiche}>
                    <strong>Caratteristiche:</strong>
                    {zona.CARATTERISTICHE.split(';').map((car, idx) => (
                      <span key={idx} className={styles.caratteristica}>
                        {car.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
}

export default MapInteractive;