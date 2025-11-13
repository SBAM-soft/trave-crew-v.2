import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HeaderWizardSummary.module.css';

function HeaderWizardSummary({ wizardData }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  // Funzione per ottenere l'etichetta del budget
  const getBudgetLabel = (budget) => {
    const labels = {
      'low': 'Economico',
      'medium': 'Medio',
      'high': 'Alto'
    };
    return labels[budget] || budget;
  };

  // Funzione per ottenere il colore del budget
  const getBudgetColor = (budget) => {
    const colors = {
      'low': '#10b981',
      'medium': '#f59e0b',
      'high': '#ef4444'
    };
    return colors[budget] || '#6b7280';
  };

  // Limita interessi visibili
  const maxInteressiVisibili = isExpanded ? wizardData.interessi?.length : 3;
  const interessiVisibili = wizardData.interessi?.slice(0, maxInteressiVisibili) || [];
  const interessiNascosti = wizardData.interessi?.length - maxInteressiVisibili || 0;

  return (
    <div className={styles.header}>
      <div className={styles.container}>
        {/* Titolo + Toggle */}
        <div className={styles.titleRow}>
          <h2 className={styles.title}>Il tuo viaggio</h2>
          <button 
            className={styles.toggleBtn}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Comprimi dettagli" : "Espandi dettagli"}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>

        {/* Info principali sempre visibili */}
        <div className={styles.mainInfo}>
          {/* Destinazione */}
          <div className={styles.infoItem}>
            <span className={styles.icon}>🌍</span>
            <span className={styles.label}>Destinazione:</span>
            <strong className={styles.value}>{wizardData.destinazione || 'Non selezionata'}</strong>
          </div>

          {/* Persone */}
          <div className={styles.infoItem}>
            <span className={styles.icon}>👥</span>
            <span className={styles.label}>Persone:</span>
            <strong className={styles.value}>{wizardData.numeroPersone || 0}</strong>
            {wizardData.tipoViaggio && (
              <span className={styles.badge} data-type={wizardData.tipoViaggio}>
                {wizardData.tipoViaggio === 'pubblico' ? 'Pubblico' : 'Privato'}
              </span>
            )}
          </div>
        </div>

        {/* Dettagli espandibili */}
        {isExpanded && (
          <div className={styles.expandedInfo}>
            {/* Budget */}
            {wizardData.budget && (
              <div className={styles.infoItem}>
                <span className={styles.icon}>💰</span>
                <span className={styles.label}>Budget:</span>
                <span 
                  className={styles.budgetBadge}
                  style={{ backgroundColor: getBudgetColor(wizardData.budget) }}
                >
                  {getBudgetLabel(wizardData.budget)}
                </span>
              </div>
            )}

            {/* Interessi */}
            {wizardData.interessi && wizardData.interessi.length > 0 && (
              <div className={styles.infoItem}>
                <span className={styles.icon}>⭐</span>
                <span className={styles.label}>Interessi:</span>
                <div className={styles.interessiList}>
                  {interessiVisibili.map((interesse, index) => (
                    <span key={index} className={styles.interesseBadge}>
                      {interesse}
                    </span>
                  ))}
                  {interessiNascosti > 0 && !isExpanded && (
                    <span className={styles.interesseBadge} style={{ opacity: 0.7 }}>
                      +{interessiNascosti}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Date (se disponibili) */}
            {wizardData.dataPartenza && (
              <div className={styles.infoItem}>
                <span className={styles.icon}>📅</span>
                <span className={styles.label}>Partenza:</span>
                <strong className={styles.value}>
                  {new Date(wizardData.dataPartenza).toLocaleDateString('it-IT')}
                </strong>
              </div>
            )}

            {/* Età range per viaggi pubblici */}
            {wizardData.tipoViaggio === 'pubblico' && wizardData.etaRange && wizardData.etaRange.length > 0 && (
              <div className={styles.infoItem}>
                <span className={styles.icon}>🎂</span>
                <span className={styles.label}>Età:</span>
                <div className={styles.etaList}>
                  {wizardData.etaRange.map((eta, index) => (
                    <span key={index} className={styles.etaBadge}>
                      {eta}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Genere per viaggi pubblici */}
            {wizardData.tipoViaggio === 'pubblico' && wizardData.genere && (
              <div className={styles.infoItem}>
                <span className={styles.icon}>👫</span>
                <span className={styles.label}>Genere:</span>
                <strong className={styles.value}>{wizardData.genere}</strong>
              </div>
            )}
          </div>
        )}

        {/* Pulsante modifica */}
        <button 
          className={styles.editBtn}
          onClick={() => navigate('/create')}
        >
          ✏️ Modifica preferenze
        </button>
      </div>
    </div>
  );
}

export default HeaderWizardSummary;