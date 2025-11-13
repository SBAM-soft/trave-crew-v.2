// src/components/explore/Explore.jsx
import { useState, useEffect } from 'react';
import { loadCSV } from '../../core/utils/dataLoader';
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
        const data = await loadCSV('/data/viaggi.csv');
        setViaggi(data);
        setViaggiFiltrati(data);
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
    let risultati = [...viaggi];

    // Filtro ricerca testuale
    if (searchText) {
      risultati = risultati.filter(v => 
        v.TITOLO?.toLowerCase().includes(searchText.toLowerCase()) ||
        v.DESCRIZIONE?.toLowerCase().includes(searchText.toLowerCase()) ||
        v.DESTINAZIONE?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filtro destinazione
    if (filters.destinazione !== 'all') {
      risultati = risultati.filter(v => v.DESTINAZIONE === filters.destinazione);
    }

    // Filtro budget
    if (filters.budget !== 'all') {
      risultati = risultati.filter(v => v.BUDGET_CATEGORIA === filters.budget);
    }

    // Filtro durata
    if (filters.durata !== 'all') {
      risultati = risultati.filter(v => {
        const giorni = v.DURATA_GIORNI;
        if (filters.durata === 'short') return giorni >= 3 && giorni <= 5;
        if (filters.durata === 'medium') return giorni >= 6 && giorni <= 9;
        if (filters.durata === 'long') return giorni >= 10;
        return true;
      });
    }

    // Filtro tipo viaggio
    if (filters.genere !== 'all') {
      risultati = risultati.filter(v => v.GENERE === filters.genere);
    }

    // Filtro stato
    if (filters.stato === 'aperto') {
      risultati = risultati.filter(v => v.STATO === 'aperto');
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        risultati.sort((a, b) => (a.COSTO_TOTALE_PP || 0) - (b.COSTO_TOTALE_PP || 0));
        break;
      case 'price-high':
        risultati.sort((a, b) => (b.COSTO_TOTALE_PP || 0) - (a.COSTO_TOTALE_PP || 0));
        break;
      case 'duration':
        risultati.sort((a, b) => (b.DURATA_GIORNI || 0) - (a.DURATA_GIORNI || 0));
        break;
      case 'recent':
      default:
        // Ordine originale
        break;
    }

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