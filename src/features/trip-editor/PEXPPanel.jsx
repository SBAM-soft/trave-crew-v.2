import { useState } from 'react';
import Button from '../../shared/Button';
import EXPCard from './EXPCard';
import DETEXP from './DETEXP';
import styles from './PEXPPanel.module.css';

function PEXPPanel({ pexp, onConfirm, onClose }) {
  // Stati per le esperienze
  const [experiences, setExperiences] = useState(pexp.esperienze_ids || []);
  const [dislikedExperiences, setDislikedExperiences] = useState([]);
  
  // Stati per DETEXP (Livello 3)
  const [showDETEXP, setShowDETEXP] = useState(false);
  const [selectedExpId, setSelectedExpId] = useState(null);

  // Handler click su esperienza → Apre DETEXP (Livello 3)
  const handleExpClick = (expId) => {
    setSelectedExpId(expId);
    setShowDETEXP(true);
  };

  // Handler dislike da DETEXP
  const handleExpDislike = (expId) => {
    setDislikedExperiences([...dislikedExperiences, expId]);
    setShowDETEXP(false);
    // Nota: slot diventa vuoto/tratteggiato
  };

  // Handler like da DETEXP
  const handleExpLike = () => {
    setShowDETEXP(false);
    // Esperienza confermata!
  };

  // Handler sostituzione esperienza (se slot vuoto)
  const handleReplaceExp = (oldExpId, newExpId) => {
    setExperiences(experiences.map(id => id === oldExpId ? newExpId : id));
    setDislikedExperiences(dislikedExperiences.filter(id => id !== oldExpId));
  };

  // Mock data pacchetto (poi da CSV)
  const mockPEXP = {
    ...pexp,
    nome: pexp.nome || 'Pacchetto Nord Thailandia',
    descrizione: pexp.descrizione || 'Esplora la giungla, i templi e la cultura del nord',
    durata_giorni: pexp.durata_giorni || 4,
    durata_notti: pexp.durata_notti || 3,
    zona: pexp.zona || 'Chiang Mai',
    immagine: pexp.immagine || 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
    esperienze: [
      { id: 'exp1', nome: 'Trekking Giungla', descrizione: 'Avventura nella foresta', durata: 'Giorno intero' },
      { id: 'exp2', nome: 'Villaggi Tribù', descrizione: 'Cultura locale autentica', durata: 'Giorno intero' },
      { id: 'exp3', nome: 'Elephant Sanctuary', descrizione: 'Giornata con gli elefanti', durata: 'Giorno intero' }
    ]
  };

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
          
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h2 className={styles.title}>{mockPEXP.nome}</h2>
              <p className={styles.subtitle}>{mockPEXP.descrizione}</p>
              <div className={styles.meta}>
                <span className={styles.metaBadge}>📍 {mockPEXP.zona}</span>
                <span className={styles.metaBadge}>
                  🗓️ {mockPEXP.durata_giorni} giorni / {mockPEXP.durata_notti} notti
                </span>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>

          {/* Immagine pacchetto */}
          <div className={styles.imageSection}>
            <img 
              src={mockPEXP.immagine} 
              alt={mockPEXP.nome}
              className={styles.image}
            />
          </div>

          {/* Content scrollabile */}
          <div className={styles.content}>
            
            {/* Esperienze grid */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>🎯 Esperienze incluse</h3>
              <div className={styles.expGrid}>
                {mockPEXP.esperienze.map((exp) => {
                  const isDisliked = dislikedExperiences.includes(exp.id);
                  
                  return (
                    <div key={exp.id} className={styles.expWrapper}>
                      {isDisliked ? (
                        // Slot vuoto/tratteggiato
                        <div className={styles.emptySlot}>
                          <p className={styles.emptyText}>Slot disponibile</p>
                          <button 
                            className={styles.replaceBtn}
                            onClick={() => {
                              // Logica sostituzione (da implementare)
                              alert('Scegli esperienza alternativa');
                            }}
                          >
                            🔄 Sostituisci
                          </button>
                        </div>
                      ) : (
                        // Card esperienza normale
                        <EXPCard
                          exp={exp}
                          onClick={() => handleExpClick(exp.id)}
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
                onConfirm(mockPEXP);
                onClose();
              }}
            >
              ✓ Conferma Pacchetto
            </Button>
          </div>

        </div>
      </div>

      {/* DETEXP Modal (Livello 3) */}
      {showDETEXP && (
        <DETEXP
          expId={selectedExpId}
          onLike={handleExpLike}
          onDislike={() => handleExpDislike(selectedExpId)}
          onClose={() => setShowDETEXP(false)}
        />
      )}
    </>
  );
}

export default PEXPPanel;