// src/components/explore/Explore.jsx
import { useState, useEffect } from 'react';
import { loadCSV } from '../../core/utils/dataLoader';
import { filterByField, filterByTextSearch, sortByField } from '../../core/utils/filterHelpers';
import { storageService } from '../../core/services/storageService';
import SearchBar from './SearchBar';
import Filters from './Filters';
import TripGrid from './TripGrid';
import SkeletonCard from './SkeletonCard';
import styles from './Explore.module.css';

function Explore() {
  const [viaggi, setViaggi] = useState([]);
  const [viaggiFiltrati, setViaggiFiltrati] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filters, setFilters] = useState({
    destinazione: 'all',
    budget: 'all',
    durata: 'all',
    genere: 'all',
    stato: 'all'
  });

  // Carica viaggi all'avvio
  useEffect(() => {
    const fetchViaggi = async () => {
      try {
        setLoading(true);

        // Carica viaggi dal CSV
        const csvData = await loadCSV('/data/viaggi.csv');

        // Carica viaggi pubblicati dagli utenti dallo storage
        const userTrips = storageService.getExploreTrips();

        // Combina i due set di dati
        const allTrips = [...csvData, ...userTrips];

        setViaggi(allTrips);
        setViaggiFiltrati(allTrips);
      } catch (err) {
        console.error('Errore:', err);
        setError('Impossibile caricare i viaggi');
      } finally {
        setLoading(false);
      }
    };

    fetchViaggi();
  }, []);

  // Applica filtri quando cambiano
  useEffect(() => {
    let risultati = viaggi;

    // Use centralized filter helpers
    risultati = filterByTextSearch(risultati, searchText, [
      'TITOLO',
      'DESCRIZIONE',
      'DESTINAZIONE'
    ]);

    risultati = filterByField(risultati, 'DESTINAZIONE', filters.destinazione);
    risultati = filterByField(risultati, 'BUDGET_CATEGORIA', filters.budget);
    risultati = filterByField(risultati, 'GENERE', filters.genere);

    // Filtro durata (custom logic)
    if (filters.durata !== 'all') {
      risultati = risultati.filter(v => {
        const giorni = v.DURATA_GIORNI;
        if (filters.durata === 'short') return giorni >= 3 && giorni <= 5;
        if (filters.durata === 'medium') return giorni >= 6 && giorni <= 9;
        if (filters.durata === 'long') return giorni >= 10;
        return true;
      });
    }

    // Filtro stato
    if (filters.stato === 'aperto') {
      risultati = risultati.filter(v => v.STATO === 'aperto');
    }

    // Use centralized sorting helper
    if (sortBy === 'price-low') {
      risultati = sortByField(risultati, 'COSTO_TOTALE_PP', 'asc');
    } else if (sortBy === 'price-high') {
      risultati = sortByField(risultati, 'COSTO_TOTALE_PP', 'desc');
    } else if (sortBy === 'duration') {
      risultati = sortByField(risultati, 'DURATA_GIORNI', 'desc');
    }
    // sortBy === 'recent' keeps original order

    setViaggiFiltrati(risultati);
  }, [searchText, filters, viaggi, sortBy]);

  const handleSearch = (text) => {
    setSearchText(text);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className={styles.explore}>
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <h1>Esplora Viaggi</h1>
            <p className={styles.subtitle}>
              Caricamento viaggi in corso...
            </p>
          </div>

          <div className={styles.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.explore}>
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.explore}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <h1>Esplora Viaggi</h1>
          <p className={styles.subtitle}>
            Scopri {viaggi.length} viaggi di gruppo organizzati dalla community
          </p>
        </div>

        {/* Barra di ricerca */}
        <SearchBar onSearch={handleSearch} />

        {/* Filtri */}
        <Filters onFilterChange={handleFilterChange} />

        {/* Risultati */}
        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <p className={styles.resultsCount}>
              {viaggiFiltrati.length} {viaggiFiltrati.length === 1 ? 'viaggio trovato' : 'viaggi trovati'}
            </p>
            <div className={styles.sortWrapper}>
              <label htmlFor="sort">Ordina per:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="recent">Più recenti</option>
                <option value="price-low">Prezzo: basso → alto</option>
                <option value="price-high">Prezzo: alto → basso</option>
                <option value="duration">Durata</option>
              </select>
            </div>
          </div>
          <TripGrid viaggi={viaggiFiltrati} />
        </div>
      </div>
    </div>
  );
}

export default Explore;