import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'sonner';
import Accordion from '../../shared/Accordion';
import Button from '../../shared/Button';
import EXPCard from './EXPCard';
import DETEXPAccordion from './DETEXPAccordion';
import { useExperiences } from '../../hooks/useExperiences';
import styles from './PEXPAccordion.module.css';

/**
 * PEXP Package accordion - Shows experiences in a package (inline, no modal)
 * Replaces PEXPPanel modal with integrated accordion
 */
function PEXPAccordion({ pexp, isOpen, onToggle, onConfirm }) {
  // Stati per le esperienze
  const [dislikedExperiences, setDislikedExperiences] = useState([]);
  const [expandedExpId, setExpandedExpId] = useState(null);

  // Extract experience IDs from package
  const experienceIds = useMemo(() => {
    const ids = [];
    ['DAY2_ESPERIENZA_STD', 'DAY3_ESPERIENZA_STD', 'DAY4_ESPERIENZA_STD',
     'DAY5_ESPERIENZA_STD', 'DAY6_ESPERIENZA_STD', 'DAY7_ESPERIENZA_STD',
     'DAY8_ESPERIENZA_STD', 'DAY9_ESPERIENZA_STD', 'DAY10_ESPERIENZA_STD'].forEach(slot => {
      if (pexp[slot]) {
        ids.push(pexp[slot]);
      }
    });
    return ids;
  }, [pexp]);

  // Load experiences with caching
  const { filteredExperiences: allExperiences, isLoading } = useExperiences({ experienceIds });

  // Map experiences to expected format
  const experiences = useMemo(() => {
    return allExperiences.map(exp => ({
      id: exp.CODICE,
      nome: exp.ESPERIENZE || exp.ESPERIENZA,
      descrizione: exp.DESCRIZIONE || '',
      durata: `${exp.SLOT || 1} giorni`,
      prezzo: exp.PRX_PAX || 0,
      tags: [],
      difficolta: exp.DIFFICOLTA || 1,
      include: '',
      nonInclude: ''
    }));
  }, [allExperiences]);

  // Handler click su esperienza → Toggle DETEXP accordion
  const handleExpClick = (exp) => {
    setExpandedExpId(expandedExpId === exp.id ? null : exp.id);
  };

  // Handler dislike da DETEXP
  const handleExpDislike = (expId) => {
    setDislikedExperiences([...dislikedExperiences, expId]);
    setExpandedExpId(null); // Close DETEXP
    toast.info('Esperienza rifiutata', {
      description: 'Puoi sostituirla con un\'alternativa',
    });
  };

  // Handler like da DETEXP
  const handleExpLike = () => {
    setExpandedExpId(null); // Close DETEXP
    toast.success('Esperienza confermata!');
  };

  // Handler sostituzione esperienza
  const handleReplaceExp = (oldExpId) => {
    toast.info('Funzionalità sostituzione esperienza in arrivo!', {
      description: 'Per ora puoi lasciare vuoto o confermare il pacchetto',
    });
  };

  const validExperiences = experiences.filter(exp => !dislikedExperiences.includes(exp.id));

  // Accordion title
  const accordionTitle = (
    <div className={styles.accordionTitle}>
      <div className={styles.titleContent}>
        <h3 className={styles.packageName}>{pexp.NOME || pexp.nome}</h3>
        <p className={styles.packageDesc}>{pexp.DESCRIZIONE || 'Pacchetto esperienza completo'}</p>
      </div>
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
  );

  return (
    <Accordion
      title={accordionTitle}
      isOpen={isOpen}
      onToggle={onToggle}
      level={1}
      className={styles.pexpAccordion}
    >
      {isLoading ? (
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p>Caricamento esperienze...</p>
        </div>
      ) : (
        <>
          {/* Esperienze grid */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>🎯 Esperienze incluse</h4>
            <div className={styles.expGrid}>
              {experiences.map((exp) => {
                const isDisliked = dislikedExperiences.includes(exp.id);
                const isExpanded = expandedExpId === exp.id;

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
                      <>
                        {/* Card esperienza normale */}
                        <EXPCard
                          exp={exp}
                          onClick={() => handleExpClick(exp)}
                        />

                        {/* DETEXP Accordion (nested) */}
                        {isExpanded && (
                          <DETEXPAccordion
                            exp={exp}
                            isOpen={isExpanded}
                            onToggle={() => setExpandedExpId(null)}
                            onLike={handleExpLike}
                            onDislike={() => handleExpDislike(exp.id)}
                          />
                        )}
                      </>
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

          {/* Footer con azioni */}
          <div className={styles.footer}>
            <Button variant="outline" onClick={onToggle}>
              Chiudi
            </Button>
            <Button
              variant="primary"
              onClick={() => onConfirm(validExperiences, pexp)}
              disabled={validExperiences.length === 0}
            >
              ✓ Conferma Pacchetto ({validExperiences.length} exp.)
            </Button>
          </div>
        </>
      )}
    </Accordion>
  );
}

PEXPAccordion.propTypes = {
  pexp: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default PEXPAccordion;
