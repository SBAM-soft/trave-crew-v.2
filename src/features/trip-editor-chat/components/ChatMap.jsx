import { useState } from 'react';
import PropTypes from 'prop-types';
import MapInteractive from './MapInteractive';
import styles from './ChatMap.module.css';

/**
 * Wrapper per MapInteractive con supporto multi-select
 */
function ChatMap({ zones, selectedZones = [], onZoneSelect, multiSelect = false, daysAvailable = 0 }) {
  const [selectedZoneCodes, setSelectedZoneCodes] = useState(selectedZones.map(z => z.code || z));

  const handleZoneClick = (zona) => {
    const zoneCode = zona.CODICE;

    if (multiSelect) {
      // Multi-select: toggle zone
      let newSelected;
      if (selectedZoneCodes.includes(zoneCode)) {
        // Deselect
        newSelected = selectedZoneCodes.filter(code => code !== zoneCode);
      } else {
        // Select
        newSelected = [...selectedZoneCodes, zoneCode];
      }
      setSelectedZoneCodes(newSelected);
    } else {
      // Single select
      setSelectedZoneCodes([zoneCode]);
    }

    // Trova dati zona completi
    const zoneData = zones.find(z => z.code === zoneCode);

    if (onZoneSelect && zoneData) {
      onZoneSelect({
        action: selectedZoneCodes.includes(zoneCode) ? 'remove' : 'add',
        zone: zoneData
      });
    }
  };

  // Trasforma zones in formato per MapInteractive
  const mappedZones = zones.map(z => ({
    CODICE: z.code,
    ZONA: z.name,
    COORDINATE_LAT: z.coordinates.lat,
    COORDINATE_LNG: z.coordinates.lng,
    TIPO_AREA: z.tipo,
    GIORNI_CONSIGLIATI: z.daysRecommended,
    DESCRIZIONE: z.description
  }));

  // Crea fake destinazione per MapInteractive
  const fakeDestinazione = {
    NOME: 'Thailandia',
    CODICE: 'TH'
  };

  // Calcola giorni selezionati
  const selectedDays = selectedZoneCodes.reduce((sum, code) => {
    const zone = zones.find(z => z.code === code);
    return sum + (zone?.daysRecommended || 0);
  }, 0);

  return (
    <div className={styles.chatMap}>
      <div className={styles.mapInfo}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Zone selezionate:</span>
          <span className={styles.infoValue}>{selectedZoneCodes.length}</span>
        </div>
        {daysAvailable > 0 && (
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Giorni pianificati:</span>
            <span className={styles.infoValue}>
              {selectedDays} / {daysAvailable}
            </span>
          </div>
        )}
      </div>

      <div className={styles.mapContainer}>
        <MapInteractive
          destinazione={fakeDestinazione}
          zone={mappedZones}
          selectedZone={selectedZoneCodes[0]}
          onZoneClick={handleZoneClick}
          filledBlocks={[]}
        />
      </div>

      {selectedZoneCodes.length > 0 && (
        <div className={styles.selectedZones}>
          <h4>Zone selezionate:</h4>
          <div className={styles.zonesList}>
            {selectedZoneCodes.map(code => {
              const zone = zones.find(z => z.code === code);
              if (!zone) return null;
              return (
                <div key={code} className={styles.zoneChip}>
                  <span>{zone.name}</span>
                  <span className={styles.zoneDays}>
                    ({zone.daysRecommended} {zone.daysRecommended === 1 ? 'giorno' : 'giorni'})
                  </span>
                  {multiSelect && (
                    <button
                      className={styles.removeButton}
                      onClick={() => handleZoneClick({ CODICE: code })}
                      type="button"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

ChatMap.propTypes = {
  zones: PropTypes.arrayOf(PropTypes.shape({
    code: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    coordinates: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired
    }).isRequired,
    daysRecommended: PropTypes.number,
    tipo: PropTypes.string,
    description: PropTypes.string
  })).isRequired,
  selectedZones: PropTypes.array,
  onZoneSelect: PropTypes.func,
  multiSelect: PropTypes.bool,
  daysAvailable: PropTypes.number
};

export default ChatMap;
