import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../../shared/Button';
import EXPCard from './EXPCard';
import DETEXP from './DETEXP';
import { loadCSV } from '../../core/utils/dataLoader';
import styles from './PEXPPanel.module.css';

function PEXPPanel({ pexp, onConfirm, onClose }) {
  // Stati per le esperienze
  const [experiences, setExperiences] = useState([]);
  const [dislikedExperiences, setDislikedExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stati per DETEXP (Livello 3)
  const [showDETEXP, setShowDETEXP] = useState(false);
  const [selectedExp, setSelectedExp] = useState(null);

  // Carica esperienze reali dal CSV
  useEffect(() => {
    const loadExperiences = async () => {
      try {
        setLoading(true);
        const experiencesData = await loadCSV('esperienze.csv');

        // Filtra esperienze del pacchetto
        const pexpExperiences = [];

        // Prendi le esperienze dagli slot del pacchetto
        ['DAY2_ESPERIENZA_STD', 'DAY3_ESPERIENZA_STD', 'DAY4_ESPERIENZA_STD',
         'DAY5_ESPERIENZA_STD', 'DAY6_ESPERIENZA_STD', 'DAY7_ESPERIENZA_STD',
         'DAY8_ESPERIENZA_STD', 'DAY9_ESPERIENZA_STD', 'DAY10_ESPERIENZA_STD'].forEach(slot => {
          if (pexp[slot]) {
            const exp = experiencesData.find(e => e.CODICE === pexp[slot]);
            if (exp) {
              pexpExperiences.push({
                id: exp.CODICE,
                nome: exp.ESPERIENZE || exp.ESPERIENZA,
                descrizione: exp.DESCRIZIONE || '',
                durata: `${exp.SLOT || 1} giorni`,
                prezzo: exp.PRX_PAX || 0,
                tags: [],
                difficolta: exp.DIFFICOLTA || 1,
                include: '',
                nonInclude: ''
              });
            }
          }
        });

        setExperiences(pexpExperiences);
        setLoading(false);
      } catch (err) {
        console.error('Errore caricamento esperienze:', err);
        setLoading(false);
      }
    };

    loadExperiences();
  }, [pexp]);

  // Handler click su esperienza → Apre DETEXP (Livello 3)
  const handleExpClick = (exp) => {
    setSelectedExp(exp);
    setShowDETEXP(true);
  };

  // Handler dislike da DETEXP
  const handleExpDislike = (expId) => {
    setDislikedExperiences([...dislikedExperiences, expId]);
    setShowDETEXP(false);
    setSelectedExp(null);
  };

  // Handler like da DETEXP
  const handleExpLike = () => {
    setShowDETEXP(false);
    setSelectedExp(null);
    // Esperienza confermata!
  };

  if (loading) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
          <div className={styles.loadingContent}>
            <div className={styles.spinner}></div>
            <p>Caricamento esperienze...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handler sostituzione esperienza (se slot vuoto)
  const handleReplaceExp = (oldExpId) => {
    // Per ora alert, poi si può implementare modale con alternative
    alert('Funzionalità sostituzione esperienza in arrivo!\nPer ora puoi lasciare vuoto o confermare il pacchetto.');
  };

  const validExperiences = experiences.filter(exp => !dislikedExperiences.includes(exp.id));

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
          
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h2 className={styles.title}>{pexp.NOME || pexp.nome}</h2>
              <p className={styles.subtitle}>{pexp.DESCRIZIONE || 'Pacchetto esperienza completo'}</p>
              <div className={styles.meta}>
                <span className={styles.metaBadge}>📍 {pexp.ZONA || pexp.zona}</span>
                <span className={styles.metaBadge}>
                  🗓️ {pexp.MIN_NOTTI + 1 || 3} giorni / {pexp.MIN_NOTTI || 2} notti
                </span>
                {pexp.PRX_PAX && (
                  <span className={styles.metaBadge}>
                    💰 €{pexp.PRX_PAX} p.p.
                  </span>
                )}
              </div>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>

          {/* Content scrollabile */}
          <div className={styles.content}>
            
            {/* Esperienze grid */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>🎯 Esperienze incluse</h3>
              <div className={styles.expGrid}>
                {experiences.map((exp) => {
                  const isDisliked = dislikedExperiences.includes(exp.id);

                  return (
                    <div key={exp.id} className={styles.expWrapper}>
                      {isDisliked ? (
                        // Slot vuoto/tratteggiato
                        <div className={styles.emptySlot}>
                          <p className={styles.emptyText}>❌ Esperienza rifiutata</p>
                          <button
                            className={styles.replaceBtn}
                            onClick={() => handleReplaceExp(exp.id)}
                          >
                            🔄 Sostituisci
                          </button>
                        </div>
                      ) : (
                        // Card esperienza normale
                        <EXPCard
                          exp={exp}
                          onClick={() => handleExpClick(exp)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Note e informazioni */}
            <div className={styles.section}>
              <div className={styles.infoBox}>
                <p className={styles.infoText}>
                  💡 <strong>Nota:</strong> Ogni esperienza occupa un giorno intero. 
                  Il primo giorno è dedicato all'arrivo e alla logistica.
                </p>
              </div>
            </div>

          </div>

          {/* Footer con azioni */}
          <div className={styles.footer}>
            <Button variant="outline" onClick={onClose}>
              Indietro
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onConfirm(validExperiences);
                onClose();
              }}
              disabled={validExperiences.length === 0}
            >
              ✓ Conferma Pacchetto ({validExperiences.length} exp.)
            </Button>
          </div>

        </div>
      </div>

      {/* DETEXP Modal (Livello 3) */}
      {showDETEXP && selectedExp && (
        <DETEXP
          exp={selectedExp}
          onLike={handleExpLike}
          onDislike={() => handleExpDislike(selectedExp.id)}
          onClose={() => setShowDETEXP(false)}
        />
      )}
    </>
  );
}

PEXPPanel.propTypes = {
  pexp: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PEXPPanel;