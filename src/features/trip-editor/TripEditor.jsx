import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// import useNavigationGuard from '../../hooks/useNavigationGuard'; // Temporarily disabled - causing crashes
import HeaderWizardSummary from './HeaderWizardSummary';
import MapInteractive from './MapInteractive';
import DayBlocksGrid from './DayBlocksGrid';
import PEXPCard from './PEXPCard';
import PEXPPanel from './PEXPPanel';
import HotelCard from './HotelCard';
import HotelPanel from './HotelPanel';
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

  // State per Hotel Panel
  const [isHotelPanelOpen, setIsHotelPanelOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);

  // Protezione navigazione - TEMPORARILY DISABLED due to useBlocker issues
  // const hasUnsavedChanges = filledBlocks.length > 0 || selectedHotel !== null;
  // useNavigationGuard(
  //   hasUnsavedChanges,
  //   'Sei sicuro di voler uscire dal Trip Editor? Il viaggio non è stato completato e le modifiche andranno perse.'
  // );

  // Carica dati iniziali
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carica destinazioni, zone e pacchetti dal CSV
      const destinazioniData = await loadCSV('destinazioni.csv');
      const zoneData = await loadCSV('zone.csv');
      const pacchettiData = await loadCSV('pacchetti.csv');

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

      // Carica pacchetti reali dal CSV
      const destPacchetti = pacchettiData.filter(p =>
        p.DESTINAZIONE?.toLowerCase() === wizardData.destinazione?.toLowerCase()
      );
      setPacchetti(destPacchetti);

      setLoading(false);
    } catch (err) {
      console.error('Errore caricamento dati:', err);
      setError('Errore nel caricamento dei dati. Riprova.');
      setLoading(false);
    }
  };

  // Handler selezione zona
  const handleZoneClick = (zona) => {
    setSelectedZone(zona.ZONA);
    // Filtra pacchetti per zona
    const zonePacchetti = pacchetti.filter(p =>
      p.ZONA?.toLowerCase() === zona.ZONA?.toLowerCase()
    );
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
    if (!currentPexp || !validExperiences || validExperiences.length === 0) return;

    // Calcola giorni necessari (1 esperienza = 1 giorno)
    const experienceDays = validExperiences.length;

    // Riempi blocchi giorni con le esperienze
    const newBlocks = [];
    const startDay = filledBlocks.length > 0 ? Math.max(...filledBlocks.map(b => b.day || b)) + 1 : 2; // Inizia dal giorno 2 (1 è arrivo)

    for (let i = 0; i < experienceDays; i++) {
      const dayNum = startDay + i;
      if (dayNum <= totalDays) {
        newBlocks.push({
          day: dayNum,
          experience: validExperiences[i],
          packageName: currentPexp.NOME || currentPexp.nome
        });
      }
    }

    // Aggiungi i nuovi blocchi
    setFilledBlocks([...filledBlocks, ...newBlocks]);
    setIsPanelOpen(false);
    setCurrentPexp(null);

    // Feedback utente
    alert(`✓ Pacchetto "${currentPexp.NOME || currentPexp.nome}" confermato!\n${newBlocks.length} esperienze aggiunte al viaggio (giorni ${startDay}-${startDay + newBlocks.length - 1}).`);
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

  // Handler click card hotel → Apre Hotel Panel
  const handleHotelCardClick = () => {
    setIsHotelPanelOpen(true);
  };

  // Handler conferma hotel dal panel
  const handleConfirmHotel = (hotel) => {
    setSelectedHotel(hotel);
    setIsHotelPanelOpen(false);
  };

  // Handler chiusura hotel panel
  const handleCloseHotelPanel = () => {
    setIsHotelPanelOpen(false);
  };

  // Handler crea itinerario
  const handleCreateItinerary = () => {
    if (filledBlocks.length < totalDays - 1) {
      alert('Completa tutti i giorni prima di creare l\'itinerario!');
      return;
    }

    // Naviga alla timeline con tutti i dati necessari
    navigate('/timeline-editor', {
      state: {
        wizardData,
        filledBlocks,
        totalDays
      }
    });
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
                ? `Pacchetti per ${zone.find(z => z.ZONA === selectedZone)?.ZONA}`
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

        {/* Sezione Hotel - FASE 2: Mostrata solo dopo aver riempito almeno metà dei giorni */}
        {filledBlocks.length >= Math.floor((totalDays - 1) / 2) && (
          <section className={styles.section}>
            <div className={styles.packagesHeader}>
              <h3 className={styles.sectionTitle}>🏨 Scegli il tuo Hotel</h3>
              <p className={styles.sectionSubtitle}>
                Seleziona dove alloggiare durante il tuo viaggio
              </p>
            </div>
            <div className={styles.packagesGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
              {selectedHotel ? (
                <HotelCard
                  hotel={selectedHotel}
                  onClick={handleHotelCardClick}
                  isSelected={true}
                />
              ) : (
                <div
                  className={styles.hotelPlaceholder}
                  onClick={handleHotelCardClick}
                  style={{
                    border: '2px dashed #d1d5db',
                    borderRadius: '12px',
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#f9fafb'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏨</div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                    Nessun hotel selezionato
                  </h4>
                  <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                    Clicca per scegliere dove alloggiare
                  </p>
                  <button
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Seleziona Hotel
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

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

      {/* Hotel Panel - Modal */}
      {isHotelPanelOpen && (
        <HotelPanel
          destinazione={wizardData.destinazione}
          zone={zone}
          onConfirm={handleConfirmHotel}
          onClose={handleCloseHotelPanel}
        />
      )}
    </div>
  );
}

export default TripEditor;