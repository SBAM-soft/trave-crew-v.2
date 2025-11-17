import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'sonner';
import TabView from '../../shared/TabView';
import Button from '../../shared/Button';
import Breadcrumb from '../../shared/Breadcrumb';
import DayBlocksGrid from './DayBlocksGrid';
import EXPCard from './EXPCard';
import { useExperiences } from '../../hooks/useExperiences';
import styles from './PEXPTab.module.css';

/**
 * PEXP Tab - Fullscreen tab showing package experiences
 */
function PEXPTab({
  pexp,
  onClose,
  onConfirm,
  onExpClick,
  totalDays = 7,
  filledBlocks = [],
  isEditing = false,
  editingBlock = null,
  onRemove = null
}) {
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

  // Load experiences
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

  const validExperiences = experiences.filter(exp => !dislikedExperiences.includes(exp.id));

  const handleReplaceExp = (oldExpId) => {
    toast.info('Funzionalità sostituzione esperienza in arrivo!');
  };

  const handleConfirm = () => {
    onConfirm(validExperiences, pexp);
  };

  const title = pexp.NOME_PACCHETTO || pexp.NOME || pexp.nome;
  const subtitle = (
    <div className={styles.subtitleMeta}>
      <span>📍 {pexp.ZONA || pexp.zona}</span>
      <span>🗓️ {pexp.MIN_NOTTI + 1 || 3} giorni / {pexp.MIN_NOTTI || 2} notti</span>
      {pexp.PRX_PAX && <span>💰 €{pexp.PRX_PAX} p.p.</span>}
      {isEditing && editingBlock && (
        <span style={{ color: '#ff9800' }}>✏️ Modifica Giorno {editingBlock.day}</span>
      )}
    </div>
  );

  const handleRemoveClick = () => {
    if (editingBlock && onRemove) {
      onRemove(editingBlock.day);
    }
  };

  return (
    <TabView
      isOpen={true}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      zIndex={1000}
      headerActions={
        <div style={{ display: 'flex', gap: '12px' }}>
          {isEditing && onRemove && (
            <Button
              variant="outline"
              onClick={handleRemoveClick}
              style={{ color: '#f44336' }}
            >
              🗑️ Rimuovi Giorno
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={validExperiences.length === 0}
          >
            {isEditing ? '✓ Sostituisci' : '✓ Conferma Pacchetto'} ({validExperiences.length})
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Caricamento esperienze...</p>
        </div>
      ) : (
        <>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Crea Viaggio', href: '/create' },
              { label: 'Trip Editor', href: '/trip-editor' },
              { label: `Pacchetto: ${title}` }
            ]}
          />

          <DayBlocksGrid
            totalDays={totalDays}
            filledBlocks={filledBlocks}
            compact={true}
            stickyCompact={true}
          />

          <div className={styles.description}>
            <p>{pexp.DESCRIZIONE || 'Pacchetto esperienza completo'}</p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>🎯 Esperienze incluse</h3>
            <div className={styles.expGrid}>
              {experiences.map((exp) => {
                const isDisliked = dislikedExperiences.includes(exp.id);

                return (
                  <div key={exp.id} className={styles.expWrapper}>
                    {isDisliked ? (
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
                      <EXPCard
                        exp={exp}
                        onClick={() => onExpClick(exp)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              💡 <strong>Nota:</strong> Clicca su un'esperienza per vedere i dettagli completi.
              Ogni esperienza occupa un giorno intero del viaggio.
            </p>
          </div>
        </>
      )}
    </TabView>
  );
}

PEXPTab.propTypes = {
  pexp: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onExpClick: PropTypes.func.isRequired,
  totalDays: PropTypes.number,
  filledBlocks: PropTypes.array,
  isEditing: PropTypes.bool,
  editingBlock: PropTypes.object,
  onRemove: PropTypes.func,
};

export default PEXPTab;
