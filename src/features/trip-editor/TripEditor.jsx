import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HeaderWizardSummary from './HeaderWizardSummary';
import MapInteractive from './MapInteractive';
import DayBlocksGrid from './DayBlocksGrid';
import PEXPCard from './PEXPCard';
import PEXPPanel from './PEXPPanel';
import Button from '../../shared/Button';
import { loadCSV } from '../../core/utils/dataLoader';
import styles from './TripEditor.module.css';

function TripEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Recupera dati wizard (passati dalla route)
  const wizardData = location.state?.wizardData || {
    destinazione: 'Thailandia',
    stato_id: 1,
    numeroPersone: 2,
    tipoViaggio: 'privato',
    budget: 'medium',
    interessi: ['Natura', 'Avventura'],
    dataPartenza: null
  };

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [destinazioneData, setDestinazioneData] = useState(null);
  const [zone, setZone] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [pacchetti, setPacchetti] = useState([]);
  const [selectedPacchetto, setSelectedPacchetto] = useState(null);
  const [filledBlocks, setFilledBlocks] = useState([]);
  const [totalDays, setTotalDays] = useState(7); // Default 7 giorni
  
  // State per PEXP Panel (Livello 2)
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentPexp, setCurrentPexp] = useState(null);

  // Carica dati iniziali
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carica destinazioni e zone
      const destinazioniData = await loadCSV('/data/destinazioni.csv');
      const zoneData = await loadCSV('/data/zone.csv');
      
      // Trova destinazione selezionata (case-insensitive)
      const dest = destinazioniData.find(d => 
        d.STATO?.toLowerCase() === wizardData.destinazione?.toLowerCase()
      );
      setDestinazioneData(dest);
      
      // Filtra zone per destinazione (case-insensitive)
      const destZone = zoneData.filter(z => 
        z.DESTINAZIONE?.toLowerCase() === wizardData.destinazione?.toLowerCase()
      );
      setZone(destZone);
      
      // Per ora usa pacchetti mock (poi si caricheranno da CSV)
      const mockPacchetti = generateMockPacchetti(destZone);
      setPacchetti(mockPacchetti);
      
      setLoading(false);
    } catch (err) {
      console.error('Errore caricamento dati:', err);
      setError('Errore nel caricamento dei dati. Riprova.');
      setLoading(false);
    }
  };

  // Genera pacchetti mock per test
  const generateMockPacchetti = (zoneData) => {
    if (!zoneData || zoneData.length === 0) return [];
    
    return zoneData.slice(0, 3).map((zona, index) => ({
      id: index + 1,
      nome: `Avventura ${zona.ZONA}`,
      zona_nome: zona.ZONA,
      zona_id: zona.CODICE,
      giorni_totali: zona.GIORNI_CONSIGLIATI || 3,
      notti: (zona.GIORNI_CONSIGLIATI || 3) - 1,
      esperienze_ids: Array.from({ length: (zona.GIORNI_CONSIGLIATI || 3) - 1 }, (_, i) => i + 1 + (index * 10)),
      storytelling: {
        intro: zona.DESCRIZIONE || 'Un\'esperienza indimenticabile',
        titolo: `Scopri ${zona.ZONA}`,
        descrizione_dettagliata: zona.DESCRIZIONE
      },
      citta_arrivo: zona.CITTA_PRINCIPALE,
      prezzo_base: 350 + (index * 100),
      likes: 80 + (index * 20),
      dislikes: 10 + (index * 5),
      caratteristiche: zona.CARATTERISTICHE
    }));
  };

  // Handler selezione zona
  const handleZoneClick = (zona) => {
    setSelectedZone(zona.CODICE);
    // Filtra pacchetti per zona (mock)
    const zonePacchetti = pacchetti.filter(p => p.zona_id === zona.CODICE);
    if (zonePacchetti.length > 0) {
      setSelectedPacchetto(zonePacchetti[0]);
    }
  };

  // Handler click pacchetto → Apre PEXP Panel
  const handlePacchettoClick = (pexp) => {
    setCurrentPexp(pexp);
    setIsPanelOpen(true);
  };

  // Handler conferma pacchetto dal Panel
  const handleConfirmPackage = (validExperiences) => {
    if (!currentPexp) return;
    
    // Simula riempimento giorni
    const newFilledBlocks = [];
    for (let i = 2; i <= currentPexp.giorni_totali; i++) {
      if (!filledBlocks.includes(i)) {
        newFilledBlocks.push(i);
      }
    }
    
    setFilledBlocks([...filledBlocks, ...newFilledBlocks]);
    setIsPanelOpen(false);
    setCurrentPexp(null);
    
    // Feedback utente
    alert(`Pacchetto "${currentPexp.nome}" confermato!\n${newFilledBlocks.length} giorni aggiunti al viaggio.`);
  };

  // Handler chiusura panel
  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setCurrentPexp(null);
  };

  // Handler click blocco giorno
  const handleBlockClick = (day) => {
    alert(`Modifica giorno ${day}\n(Da implementare - riaprire PEXP Panel per modifiche)`);
  };

  // Handler crea itinerario
  const handleCreateItinerary = () => {
    if (filledBlocks.length < totalDays - 1) {
      alert('Completa tutti i giorni prima di creare l\'itinerario!');
      return;
    }
    
    alert('Creazione Timeline Itinerario...\n(Da implementare nella Fase 2 - Timeline Trip Editor)');
    // navigate('/timeline-editor');
  };

  // Rendering
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Caricamento Trip Editor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>⚠️ Errore</h2>
        <p>{error}</p>
        <Button onClick={() => navigate('/create')}>
          Torna al Wizard
        </Button>
      </div>
    );
  }

  const allBlocksFilled = filledBlocks.length >= totalDays - 1;

  return (
    <div className={styles.tripEditor}>
      {/* Header con riepilogo wizard */}
      <HeaderWizardSummary wizardData={wizardData} />

      {/* Contenuto principale */}
      <div className={styles.content}>
        {/* Mappa interattiva */}
        <section className={styles.section}>
          <MapInteractive
            destinazione={destinazioneData}
            zone={zone}
            selectedZone={selectedZone}
            onZoneClick={handleZoneClick}
          />
        </section>

        {/* Blocchi giorni */}
        <section className={styles.section}>
          <DayBlocksGrid
            totalDays={totalDays}
            filledBlocks={filledBlocks}
            onBlockClick={handleBlockClick}
          />
        </section>

        {/* Pacchetti disponibili */}
        <section className={styles.section}>
          <div className={styles.packagesHeader}>
            <h3 className={styles.sectionTitle}>
              📦 Pacchetti Esperienza Disponibili
            </h3>
            <p className={styles.sectionSubtitle}>
              {selectedZone 
                ? `Pacchetti per ${zone.find(z => z.CODICE === selectedZone)?.ZONA}` 
                : 'Seleziona una zona per vedere i pacchetti'}
            </p>
          </div>

          <div className={styles.packagesGrid}>
            {pacchetti.length > 0 ? (
              pacchetti.map((pexp) => (
                <PEXPCard
                  key={pexp.id}
                  pexp={pexp}
                  onClick={handlePacchettoClick}
                  isSelected={selectedPacchetto?.id === pexp.id}
                />
              ))
            ) : (
              <div className={styles.noPacchetti}>
                <p>Nessun pacchetto disponibile. Seleziona una zona sulla mappa.</p>
              </div>
            )}
          </div>
        </section>

        {/* Pulsante crea itinerario */}
        <section className={styles.finalSection}>
          <div className={styles.finalCard}>
            <h3>🎯 Pronto per creare l'itinerario?</h3>
            <p>
              {allBlocksFilled 
                ? 'Tutti i giorni sono pianificati! Crea ora il tuo itinerario ottimizzato.' 
                : `Mancano ancora ${totalDays - 1 - filledBlocks.length} giorni da pianificare.`}
            </p>
            <Button
              onClick={handleCreateItinerary}
              variant="primary"
              size="lg"
              disabled={!allBlocksFilled}
            >
              {allBlocksFilled ? '🚀 Crea Itinerario' : '⏳ Completa i giorni'}
            </Button>
          </div>
        </section>
      </div>

      {/* PEXP Panel (Livello 2) - Modal */}
      {isPanelOpen && currentPexp && (
        <PEXPPanel
          pexp={currentPexp}
          onConfirm={handleConfirmPackage}
          onClose={handleClosePanel}
        />
      )}
    </div>
  );
}

export default TripEditor;