import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadCSV } from '../../core/utils/dataLoader';
import HotelCard from '../trip-editor/HotelCard';
import Button from '../../shared/Button';
import styles from './HotelSelectionPage.module.css';

function HotelSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Recupera dati della Fase 1
  const tripData = location.state || {};
  const { wizardData = {}, filledBlocks = [], totalDays = 7 } = tripData;

  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [zone, setZone] = useState([]);

  // Filtri
  const [filters, setFilters] = useState({
    budget: 'ALL',
    stelle: 'ALL',
    zona: 'ALL',
    servizi: {
      colazione: false,
      wifi: false,
      piscina: false
    }
  });

  // Carica hotel e zone
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [hotelsData, zoneData] = await Promise.all([
          loadCSV('hotel.csv'),
          loadCSV('zone.csv')
        ]);

        // Filtra per destinazione
        const destHotels = hotelsData.filter(h =>
          h.DESTINAZIONE?.toLowerCase() === wizardData.destinazione?.toLowerCase()
        );

        const destZone = zoneData.filter(z =>
          z.DESTINAZIONE?.toLowerCase() === wizardData.destinazione?.toLowerCase()
        );

        setHotels(destHotels);
        setFilteredHotels(destHotels);
        setZone(destZone);
        setLoading(false);
      } catch (err) {
        console.error('Errore caricamento dati:', err);
        setLoading(false);
      }
    };

    if (wizardData.destinazione) {
      loadData();
    }
  }, [wizardData.destinazione]);

  // Applica filtri
  useEffect(() => {
    let result = [...hotels];

    if (filters.budget !== 'ALL') {
      result = result.filter(h => h.BUDGET === filters.budget);
    }

    if (filters.stelle !== 'ALL') {
      result = result.filter(h => parseInt(h.STELLE) === parseInt(filters.stelle));
    }

    if (filters.zona !== 'ALL') {
      result = result.filter(h => h.ZONA === filters.zona);
    }

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

  // Handler conferma e vai a riepilogo finale
  const handleConfirmHotel = () => {
    if (!selectedHotel) {
      alert('⚠️ Seleziona un hotel prima di continuare');
      return;
    }

    // Naviga al riepilogo finale con tutti i dati
    navigate('/trip-summary', {
      state: {
        ...tripData,
        selectedHotel
      }
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Caricamento hotel disponibili...</p>
      </div>
    );
  }

  return (
    <div className={styles.hotelSelectionPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.phaseIndicator}>
            <span className={styles.phaseNumber}>Fase 2/2</span>
            <div className={styles.phaseSteps}>
              <div className={styles.stepCompleted}>✓ Esperienze</div>
              <div className={styles.stepActive}>🏨 Hotel</div>
            </div>
          </div>
          <h1 className={styles.title}>Scegli il tuo Hotel</h1>
          <p className={styles.subtitle}>
            {wizardData.destinazione} • {totalDays} giorni • {wizardData.numeroPersone} {wizardData.numeroPersone === 1 ? 'persona' : 'persone'}
          </p>
        </div>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Torna all'itinerario
        </button>
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
              <span>🍳 Colazione</span>
            </label>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={filters.servizi.wifi}
                onChange={() => handleFilterChange('servizio', 'wifi')}
              />
              <span>📶 WiFi</span>
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
          🔄 Reset
        </button>
      </div>

      {/* Hotel Grid */}
      <div className={styles.content}>
        <div className={styles.resultsHeader}>
          <h3 className={styles.resultsTitle}>
            {filteredHotels.length} hotel disponibili
          </h3>
        </div>

        {filteredHotels.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏨</div>
            <h3 className={styles.emptyTitle}>Nessun hotel trovato</h3>
            <p className={styles.emptyText}>
              Modifica i filtri per vedere più opzioni
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
                onClick={() => handleSelectHotel(hotel)}
                isSelected={selectedHotel?.CODICE === hotel.CODICE}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer fisso */}
      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerInfo}>
            {selectedHotel ? (
              <>
                <span className={styles.selectedLabel}>Hotel selezionato:</span>
                <span className={styles.selectedName}>{selectedHotel.NOME}</span>
                <span className={styles.selectedStars}>{'⭐'.repeat(parseInt(selectedHotel.STELLE || 0))}</span>
              </>
            ) : (
              <span className={styles.selectedLabel}>Seleziona un hotel per continuare</span>
            )}
          </div>
          <div className={styles.footerActions}>
            <Button variant="outline" onClick={() => navigate(-1)}>
              ← Indietro
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmHotel}
              disabled={!selectedHotel}
              size="lg"
            >
              Conferma e Continua →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HotelSelectionPage;
