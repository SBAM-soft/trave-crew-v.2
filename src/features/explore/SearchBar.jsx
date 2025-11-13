// src/components/explore/SearchBar.jsx
import { useState } from 'react';
import styles from './SearchBar.module.css';

function SearchBar({ onSearch }) {
  const [searchText, setSearchText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchText);
  };

  return (
    <form className={styles.searchBar} onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Cerca una destinazione, città o esperienza..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className={styles.input}
      />
      <button type="submit" className={styles.button}>
        🔍 Cerca
      </button>
    </form>
  );
}

export default SearchBar;