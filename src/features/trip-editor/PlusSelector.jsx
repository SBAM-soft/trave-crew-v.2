import { useState } from 'react';
import styles from './PlusSelector.module.css';

function PlusSelector({ availablePlus = [], selectedPlus = [], onChange }) {
  
  const handlePlusToggle = (plus) => {
    const isSelected = selectedPlus.find(p => p.id === plus.id);
    
    if (isSelected) {
      // Rimuovi
      const newSelected = selectedPlus.filter(p => p.id !== plus.id);
      onChange(newSelected);
    } else {
      // Aggiungi
      const newSelected = [...selectedPlus, plus];
      onChange(newSelected);
    }
  };

  // Calcola totale plus selezionati
  const totalPlus = selectedPlus.reduce((sum, plus) => sum + plus.prezzo, 0);

  return (
    <div className={styles.plusSelector}>
      <h4 className={styles.title}>Aggiungi Extra</h4>
      <p className={styles.subtitle}>
        Personalizza la tua esperienza con questi upgrade opzionali
      </p>

      {/* Grid plus disponibili */}
      <div className={styles.plusGrid}>
        {availablePlus.map((plus) => {
          const isSelected = selectedPlus.find(p => p.id === plus.id);
          
          return (
            <div
              key={plus.id}
              className={`${styles.plusCard} ${isSelected ? styles.selected : ''}`}
              onClick={() => handlePlusToggle(plus)}
            >
              {/* Checkbox */}
              <div className={styles.checkbox}>
                {isSelected && <span className={styles.checkmark}>✓</span>}
              </div>

              {/* Content */}
              <div className={styles.plusContent}>
                <p className={styles.plusName}>{plus.nome}</p>
                <p className={styles.plusPrice}>€{plus.prezzo}</p>
              </div>

              {/* Badge selezionato */}
              {isSelected && (
                <div className={styles.selectedBadge}>Selezionato</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {selectedPlus.length > 0 && (
        <div className={styles.summary}>
          <p className={styles.summaryText}>
            {selectedPlus.length} extra selezionati
          </p>
          <p className={styles.summaryTotal}>+€{totalPlus}</p>
        </div>
      )}
    </div>
  );
}

export default PlusSelector;