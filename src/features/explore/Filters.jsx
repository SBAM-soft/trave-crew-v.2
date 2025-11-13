// src/components/explore/Filters.jsx
import { useState } from 'react';
import styles from './Filters.module.css';

function Filters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    destinazione: 'all',
    budget: 'all',
    durata: 'all',
    genere: 'all', // ← Cambiato da 'tipo' a 'genere'
    stato: 'all'
  });

  const handleChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const resetFilters = {
      destinazione: 'all',
      budget: 'all',
      durata: 'all',
      genere: 'all', // ← Cambiato
      stato: 'all'
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className={styles.filters}>
      <div className={styles.filtersHeader}>
        <h3>🎯 Filtra i risultati</h3>
        <button className={styles.resetBtn} onClick={resetFilters}>
          ↻ Reset
        </button>
      </div>

      <div className={styles.filtersGrid}>
        {/* Filtro Destinazione */}
        <div className={styles.filterGroup}>
          <label>📍 Destinazione</label>
          <select 
            value={filters.destinazione}
            onChange={(e) => handleChange('destinazione', e.target.value)}
          >
            <option value="all">Tutte</option>
            <option value="Thailandia">Thailandia</option>
            <option value="Grecia">Grecia</option>
            <option value="Cuba">Cuba</option>
            <option value="Marocco">Marocco</option>
            <option value="Spagna">Spagna</option>
            <option value="Giappone">Giappone</option>
          </select>
        </div>

        {/* Filtro Budget */}
        <div className={styles.filterGroup}>
          <label>💰 Budget</label>
          <select 
            value={filters.budget}
            onChange={(e) => handleChange('budget', e.target.value)}
          >
            <option value="all">Tutti</option>
            <option value="LOW">Economico (€)</option>
            <option value="MEDIUM">Medio (€€)</option>
            <option value="HIGH">Lusso (€€€)</option>
          </select>
        </div>

        {/* Filtro Durata */}
        <div className={styles.filterGroup}>
          <label>📅 Durata</label>
          <select 
            value={filters.durata}
            onChange={(e) => handleChange('durata', e.target.value)}
          >
            <option value="all">Tutte</option>
            <option value="short">3-5 giorni</option>
            <option value="medium">6-9 giorni</option>
            <option value="long">10+ giorni</option>
          </select>
        </div>

        {/* Filtro Genere - NUOVO */}
        <div className={styles.filterGroup}>
          <label>👥 Genere</label>
          <select 
            value={filters.genere}
            onChange={(e) => handleChange('genere', e.target.value)}
          >
            <option value="all">Tutti</option>
            <option value="misto">👫 Misto</option>
            <option value="donne">👩 Solo donne</option>
            <option value="uomini">👨 Solo uomini</option>
          </select>
        </div>

        {/* Filtro Stato */}
        <div className={styles.filterGroup}>
          <label>🎫 Disponibilità</label>
          <select 
            value={filters.stato}
            onChange={(e) => handleChange('stato', e.target.value)}
          >
            <option value="all">Tutti</option>
            <option value="aperto">Solo posti disponibili</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default Filters;