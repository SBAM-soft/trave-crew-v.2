import { useState, useEffect } from 'react';
import { loadCSV } from '../../core/utils/dataLoader';
import HotelCard from './HotelCard';
import Button from '../../shared/Button';
import styles from './HotelSelector.module.css';

function HotelSelector({ destinazione, zone = [], onConfirm, onClose }) {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState(null);

  // Filtri
  const [filters, setFilters] = useState({
    budget: 'ALL', // ALL, LOW, MEDIUM, HIGH
    stelle: 'ALL', // ALL, 2, 3, 4, 5
    zona: 'ALL', // ALL, o nome zona
    servizi: {
      colazione: false,
      wifi: false,
      piscina: false
    }
  });

  // Carica hotel dal CSV
  useEffect(() => {
    const loadHotels = async () => {
      try {
        setLoading(true);
        const hotelsData = await loadCSV('hotel.csv');

        // Filtra per destinazione
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

    if (destinazione) {
      loadHotels();
    }
  }, [destinazione]);

  // Applica filtri
  useEffect(() => {
    let result = [...hotels];

    // Filtro budget
    if (filters.budget !== 'ALL') {
      result = result.filter(h => h.BUDGET === filters.budget);
    }

    // Filtro stelle
    if (filters.stelle !== 'ALL') {
      result = result.filter(h => parseInt(h.STELLE) === parseInt(filters.stelle));
    }

    // Filtro zona
    if (filters.zona !== 'ALL') {
      result = result.filter(h => h.ZONA === filters.zona);
    }

    // Filtro servizi
    if (filters.servizi.colazione) {
      result = result.filter(h => h.COLAZIONE_INCLUSA === 'si');
    }
    if (filters.servizi.wifi) {
      result = result.filter(h => h.WIFI === 'si');
    }
    if (filters.servizi.piscina) {
      result = result.filter(h => h.PISCINA === 'si');
    }

    setFilteredHotels(result);
  }, [filters, hotels]);

  // Handler cambio filtro
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'servizio') {
      setFilters({
        ...filters,
        servizi: {
          ...filters.servizi,
          [value]: !filters.servizi[value]
        }
      });
    } else {
      setFilters({ ...filters, [filterType]: value });
    }
  };

  // Handler selezione hotel
  const handleSelectHotel = (hotel) => {
    if (selectedHotel?.CODICE === hotel.CODICE) {
      setSelectedHotel(null);
    } else {
      setSelectedHotel(hotel);
    }
  };

  // Handler conferma
  const handleConfirm = () => {
    if (selectedHotel) {
      onConfirm(selectedHotel);
    } else {
      alert('⚠️ Seleziona un hotel prima di confermare');
    }
  };

  // Reset filtri
  const handleResetFilters = () => {
    setFilters({
      budget: 'ALL',
      stelle: 'ALL',
      zona: 'ALL',
      servizi: {
        colazione: false,
        wifi: false,
        piscina: false
      }
    });
  };

  if (loading) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
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
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>🏨 Scegli il tuo Hotel</h2>
            <p className={styles.subtitle}>
              {filteredHotels.length} hotel disponibili a {destinazione}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Filtri */}
        <div className={styles.filters}>
          {/* Budget */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Budget</label>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterBtn} ${filters.budget === 'ALL' ? styles.active : ''}`}
                onClick={() => handleFilterChange('budget', 'ALL')}
              >
                Tutti
              </button>
              <button
                className={`${styles.filterBtn} ${filters.budget === 'LOW' ? styles.active : ''}`}
                onClick={() => handleFilterChange('budget', 'LOW')}
              >
                € Budget
              </button>
              <button
                className={`${styles.filterBtn} ${filters.budget === 'MEDIUM' ? styles.active : ''}`}
                onClick={() => handleFilterChange('budget', 'MEDIUM')}
              >
                €€ Medio
              </button>
              <button
                className={`${styles.filterBtn} ${filters.budget === 'HIGH' ? styles.active : ''}`}
                onClick={() => handleFilterChange('budget', 'HIGH')}
              >
                €€€ Lusso
              </button>
            </div>
          </div>

          {/* Stelle */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Stelle</label>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterBtn} ${filters.stelle === 'ALL' ? styles.active : ''}`}
                onClick={() => handleFilterChange('stelle', 'ALL')}
              >
                Tutte
              </button>
              {[2, 3, 4, 5].map(stelle => (
                <button
                  key={stelle}
                  className={`${styles.filterBtn} ${filters.stelle === stelle ? styles.active : ''}`}
                  onClick={() => handleFilterChange('stelle', stelle)}
                >
                  {'⭐'.repeat(stelle)}
                </button>
              ))}
            </div>
          </div>

          {/* Zona */}
          {zone.length > 0 && (
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Zona</label>
              <select
                value={filters.zona}
                onChange={(e) => handleFilterChange('zona', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="ALL">Tutte le zone</option>
                {zone.map((z, i) => (
                  <option key={i} value={z.ZONA}>{z.ZONA}</option>
                ))}
              </select>
            </div>
          )}

          {/* Servizi */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Servizi</label>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={filters.servizi.colazione}
                  onChange={() => handleFilterChange('servizio', 'colazione')}
                />
                <span>🍳 Colazione inclusa</span>
              </label>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={filters.servizi.wifi}
                  onChange={() => handleFilterChange('servizio', 'wifi')}
                />
                <span>📶 WiFi gratuito</span>
              </label>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={filters.servizi.piscina}
                  onChange={() => handleFilterChange('servizio', 'piscina')}
                />
                <span>🏊 Piscina</span>
              </label>
            </div>
          </div>

          {/* Reset */}
          <button className={styles.resetBtn} onClick={handleResetFilters}>
            🔄 Reset filtri
          </button>
        </div>

        {/* Content - Hotel Grid */}
        <div className={styles.content}>
          {filteredHotels.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🏨</div>
              <h3 className={styles.emptyTitle}>Nessun hotel trovato</h3>
              <p className={styles.emptyText}>
                Prova a modificare i filtri per vedere più opzioni
              </p>
              <button className={styles.emptyBtn} onClick={handleResetFilters}>
                Reset filtri
              </button>
            </div>
          ) : (
            <div className={styles.hotelsGrid}>
              {filteredHotels.map((hotel) => (
                <HotelCard
                  key={hotel.CODICE}
                  hotel={hotel}
                  onSelect={handleSelectHotel}
                  isSelected={selectedHotel?.CODICE === hotel.CODICE}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerInfo}>
            {selectedHotel ? (
              <>
                <span className={styles.selectedLabel}>Hotel selezionato:</span>
                <span className={styles.selectedName}>{selectedHotel.NOME}</span>
              </>
            ) : (
              <span className={styles.selectedLabel}>Seleziona un hotel per continuare</span>
            )}
          </div>
          <div className={styles.footerActions}>
            <Button variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={!selectedHotel}
            >
              ✓ Conferma Hotel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HotelSelector;
