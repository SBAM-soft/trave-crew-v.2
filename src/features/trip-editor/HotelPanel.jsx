import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../../shared/Button';
import HotelCard from './HotelCard';
import { loadCSV } from '../../core/utils/dataLoader';
import styles from './PEXPPanel.module.css'; // Riutilizziamo lo stesso stile di PEXP Panel

function HotelPanel({ destinazione, zone, onConfirm, onClose }) {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filtri
  const [budgetFilter, setBudgetFilter] = useState('ALL');
  const [stelleFilter, setStelleFilter] = useState('ALL');
  const [zonaFilter, setZonaFilter] = useState('ALL');
  const [serviziFiltri, setServiziFiltri] = useState({
    colazione: false,
    wifi: false,
    piscina: false
  });

  // Carica hotel dal CSV
  useEffect(() => {
    const loadHotels = async () => {
      try {
        setLoading(true);
        const hotelsData = await loadCSV('hotel.csv');

        // Filtra hotel per destinazione
        const destHotels = hotelsData.filter(h =>
          h.DESTINAZIONE?.toLowerCase() === destinazione?.toLowerCase()
        );

        setHotels(destHotels);
        setFilteredHotels(destHotels);
        setLoading(false);
      } catch (err) {
        console.error('Errore caricamento hotel:', err);
        setLoading(false);
      }
    };

    loadHotels();
  }, [destinazione]);

  // Applica filtri
  useEffect(() => {
    let filtered = [...hotels];

    // Filtro budget
    if (budgetFilter !== 'ALL') {
      filtered = filtered.filter(h => h.BUDGET === budgetFilter);
    }

    // Filtro stelle
    if (stelleFilter !== 'ALL') {
      filtered = filtered.filter(h => parseInt(h.STELLE) === parseInt(stelleFilter));
    }

    // Filtro zona
    if (zonaFilter !== 'ALL') {
      filtered = filtered.filter(h => h.ZONA === zonaFilter);
    }

    // Filtri servizi
    if (serviziFiltri.colazione) {
      filtered = filtered.filter(h => h.COLAZIONE_INCLUSA === 'si');
    }
    if (serviziFiltri.wifi) {
      filtered = filtered.filter(h => h.WIFI === 'si');
    }
    if (serviziFiltri.piscina) {
      filtered = filtered.filter(h => h.PISCINA === 'si');
    }

    setFilteredHotels(filtered);
  }, [budgetFilter, stelleFilter, zonaFilter, serviziFiltri, hotels]);

  const handleSelectHotel = (hotel) => {
    setSelectedHotel(hotel);
  };

  const handleConfirm = () => {
    if (selectedHotel) {
      onConfirm(selectedHotel);
    }
  };

  const toggleServizio = (servizio) => {
    setServiziFiltri(prev => ({
      ...prev,
      [servizio]: !prev[servizio]
    }));
  };

  if (loading) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
          <div className={styles.loadingContent}>
            <div className={styles.spinner}></div>
            <p>Caricamento hotel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>🏨 Scegli il tuo Hotel</h2>
            <p className={styles.subtitle}>
              Trova l'alloggio perfetto per il tuo viaggio a {destinazione}
            </p>
            <div className={styles.meta}>
              <span className={styles.metaBadge}>
                🏨 {filteredHotels.length} hotel disponibili
              </span>
              {selectedHotel && (
                <span className={styles.metaBadge}>
                  ✓ 1 hotel selezionato
                </span>
              )}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>

          {/* Filtri */}
          <div className={styles.filtersSection}>
            <h3 className={styles.filtersTitle}>🔍 Filtra Hotel</h3>

            <div className={styles.filtersGrid}>
              {/* Budget */}
              <div className={styles.filterGroup}>
                <label>Budget</label>
                <select
                  value={budgetFilter}
                  onChange={(e) => setBudgetFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="ALL">Tutti</option>
                  <option value="LOW">💰 Budget</option>
                  <option value="MEDIUM">💰💰 Medio</option>
                  <option value="HIGH">💰💰💰 Lusso</option>
                </select>
              </div>

              {/* Stelle */}
              <div className={styles.filterGroup}>
                <label>Stelle</label>
                <select
                  value={stelleFilter}
                  onChange={(e) => setStelleFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="ALL">Tutte</option>
                  <option value="2">⭐⭐ 2 stelle</option>
                  <option value="3">⭐⭐⭐ 3 stelle</option>
                  <option value="4">⭐⭐⭐⭐ 4 stelle</option>
                  <option value="5">⭐⭐⭐⭐⭐ 5 stelle</option>
                </select>
              </div>

              {/* Zona */}
              <div className={styles.filterGroup}>
                <label>Zona</label>
                <select
                  value={zonaFilter}
                  onChange={(e) => setZonaFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="ALL">Tutte le zone</option>
                  {zone.map((z) => (
                    <option key={z.CODICE} value={z.ZONA}>
                      {z.ZONA}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Servizi (checkboxes) */}
            <div className={styles.serviziFiltri}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={serviziFiltri.colazione}
                  onChange={() => toggleServizio('colazione')}
                />
                🍳 Colazione inclusa
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={serviziFiltri.wifi}
                  onChange={() => toggleServizio('wifi')}
                />
                📶 WiFi gratuito
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={serviziFiltri.piscina}
                  onChange={() => toggleServizio('piscina')}
                />
                🏊 Piscina
              </label>
            </div>
          </div>

          {/* Grid Hotel */}
          <div className={styles.expGrid}>
            {filteredHotels.length > 0 ? (
              filteredHotels.map((hotel) => (
                <HotelCard
                  key={hotel.CODICE}
                  hotel={hotel}
                  onSelect={handleSelectHotel}
                  isSelected={selectedHotel?.CODICE === hotel.CODICE}
                />
              ))
            ) : (
              <div className={styles.noResults}>
                <p>Nessun hotel trovato con questi filtri. Prova a modificare i criteri di ricerca.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!selectedHotel}
          >
            {selectedHotel ? `Conferma ${selectedHotel.NOME}` : 'Seleziona un hotel'}
          </Button>
        </div>
      </div>
    </div>
  );
}

HotelPanel.propTypes = {
  destinazione: PropTypes.string.isRequired,
  zone: PropTypes.array,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default HotelPanel;
