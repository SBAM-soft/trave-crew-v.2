import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'sonner';
import usePanelStore from '../../store/usePanelStore';
import PanelContainer from '../../components/PanelContainer';
import Button from '../../shared/Button';
import EXPCard from './EXPCard';
import DETEXP from './DETEXP';
import { useExperiences } from '../../hooks/useExperiences';
import styles from './PEXPPanel.module.css';

function PEXPPanel({ panelId, pexp, onConfirm, onClose }) {
  const { pushPanel, getPanelsByType } = usePanelStore();

  // Stati per le esperienze
  const [dislikedExperiences, setDislikedExperiences] = useState([]);

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
  const { experiences: allExperiences, isLoading } = useExperiences({ experienceIds });

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

  // Handler click su esperienza → Apre DETEXP (Livello 3)
  const handleExpClick = (exp) => {
    pushPanel('detexp', { exp, pexpId: panelId });
  };

  // Handler dislike da DETEXP
  const handleExpDislike = (expId) => {
    setDislikedExperiences([...dislikedExperiences, expId]);
    toast.info('Esperienza rifiutata', {
      description: 'Puoi sostituirla con un\'alternativa',
    });
  };

  // Handler like da DETEXP
  const handleExpLike = () => {
    toast.success('Esperienza confermata!');
  };

  // Handler sostituzione esperienza (se slot vuoto)
  const handleReplaceExp = (oldExpId) => {
    toast.info('Funzionalità sostituzione esperienza in arrivo!', {
      description: 'Per ora puoi lasciare vuoto o confermare il pacchetto',
    });
  };

  if (isLoading) {
    return (
      <PanelContainer panelId={panelId} onClose={onClose}>
        <div className={styles.panel}>
          <div className={styles.loadingContent}>
            <div className={styles.spinner}></div>
            <p>Caricamento esperienze...</p>
          </div>
        </div>
      </PanelContainer>
    );
  }

  const validExperiences = experiences.filter(exp => !dislikedExperiences.includes(exp.id));

  // Get DETEXP panels for this PEXP
  const detexpPanels = getPanelsByType('detexp').filter(
    (panel) => panel.data.pexpId === panelId
  );

  return (
    <>
      <PanelContainer panelId={panelId} onClose={onClose}>
        <div className={styles.panel}>

          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h2 id="pexp-panel-title" className={styles.title}>
                {pexp.NOME || pexp.nome}
              </h2>
              <p id="pexp-panel-description" className={styles.subtitle}>
                {pexp.DESCRIZIONE || 'Pacchetto esperienza completo'}
              </p>
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
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Chiudi pannello esperienze"
            >
              ✕
            </button>
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
              onClick={() => onConfirm(validExperiences, pexp)}
              disabled={validExperiences.length === 0}
            >
              ✓ Conferma Pacchetto ({validExperiences.length} exp.)
            </Button>
          </div>

        </div>
      </PanelContainer>

      {/* DETEXP Modals (Livello 3) - Rendered from panel stack */}
      {detexpPanels.map((panel) => (
        <DETEXP
          key={panel.id}
          panelId={panel.id}
          exp={panel.data.exp}
          onLike={handleExpLike}
          onDislike={() => handleExpDislike(panel.data.exp.id)}
        />
      ))}
    </>
  );
}

PEXPPanel.propTypes = {
  panelId: PropTypes.string.isRequired,
  pexp: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PEXPPanel;