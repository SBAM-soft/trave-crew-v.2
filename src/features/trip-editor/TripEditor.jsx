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
import {
  findItinerarioByZone,
  getCostiAccessoriItinerario,
  getExtraSuggeriti,
  getZoneItinerario
} from '../../core/utils/itinerarioHelpers';
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

  // State per database itinerari (🆕)
  const [itinerari, setItinerari] = useState([]);
  const [costiAccessori, setCostiAccessori] = useState([]);
  const [plus, setPlus] = useState([]);

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

      // Carica tutti i CSV necessari (🆕 aggiunti itinerario, plus, costi_accessori)
      const [
        destinazioniData,
        zoneData,
        pacchettiData,
        itinerariData,
        plusData,
        costiAccessoriData
      ] = await Promise.all([
        loadCSV('destinazioni.csv'),
        loadCSV('zone.csv'),
        loadCSV('pacchetti.csv'),
        loadCSV('itinerario.csv'),
        loadCSV('plus.csv'),
        loadCSV('costi_accessori.csv')
      ]);

      // Trova destinazione selezionata (case-insensitive)
      const dest = destinazioniData.find(d =>
        d.NOME?.toLowerCase() === wizardData.destinazione?.toLowerCase()
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

      // Salva database itinerari, plus e costi accessori (🆕)
      setItinerari(itinerariData);
      setPlus(plusData);
      setCostiAccessori(costiAccessoriData);

      setLoading(false);
    } catch (err) {
      console.error('Errore caricamento dati:', err);
      setError('Errore nel caricamento dei dati. Riprova.');
      setLoading(false);
    }
  };

  // State per pacchetti filtrati
  const [filteredPacchetti, setFilteredPacchetti] = useState([]);

  // Handler selezione zona
  const handleZoneClick = (zona) => {
    setSelectedZone(zona.CODICE);

    // Filtra pacchetti per zona usando ZONA_COLLEGATA
    const zonePacchetti = pacchetti.filter(p =>
      p.ZONA_COLLEGATA === zona.CODICE
    );

    setFilteredPacchetti(zonePacchetti);

    if (zonePacchetti.length > 0) {
      setSelectedPacchetto(zonePacchetti[0]);
    } else {
      setSelectedPacchetto(null);
    }

    console.log(`🗺️ Zona selezionata: ${zona.ZONA} (${zona.CODICE})`);
    console.log(`📦 Pacchetti trovati: ${zonePacchetti.length}`);
  };

  // Handler click pacchetto → Apre PEXP Panel
  const handlePacchettoClick = (pexp) => {
    setCurrentPexp(pexp);
    setIsPanelOpen(true);
  };

  // Handler conferma pacchetto dal Panel
  const handleConfirmPackage = (validExperiences) => {
    if (!currentPexp || !validExperiences || validExperiences.length === 0) return;

    // Trova codice zona corrispondente (🆕)
    const zonaObj = zone.find(z =>
      z.ZONA?.toLowerCase() === currentPexp.ZONA?.toLowerCase()
    );
    const codiceZona = zonaObj?.CODICE || null;

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
          packageName: currentPexp.NOME || currentPexp.nome,
          zona: currentPexp.ZONA, // 🆕 Traccia zona del pacchetto
          codiceZona: codiceZona // 🆕 Codice zona (es: ZTHBA01)
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

  // Handler crea itinerario (🆕 con logica itinerari pre-compilati)
  const handleCreateItinerary = () => {
    if (filledBlocks.length < totalDays - 1) {
      alert('Completa tutti i giorni prima di creare l\'itinerario!');
      return;
    }

    // 🆕 Estrai zone uniche dai pacchetti confermati
    const zoneUsate = [...new Set(
      filledBlocks
        .map(block => block.codiceZona)
        .filter(codice => codice !== null && codice !== undefined)
    )];

    console.log('🗺️ Zone utilizzate nei pacchetti:', zoneUsate);

    // 🆕 Cerca itinerario pre-compilato che matcha le zone
    let itinerarioMatch = null;
    let costiAccessoriItinerario = [];
    let extraSuggeriti = [];

    if (zoneUsate.length > 0 && itinerari.length > 0) {
      itinerarioMatch = findItinerarioByZone(zoneUsate, itinerari);

      if (itinerarioMatch) {
        console.log('✅ Itinerario pre-compilato trovato:', itinerarioMatch.CODICE);

        // Carica costi accessori dell'itinerario
        costiAccessoriItinerario = getCostiAccessoriItinerario(
          itinerarioMatch,
          costiAccessori
        );

        // Carica extra suggeriti
        extraSuggeriti = getExtraSuggeriti(itinerarioMatch, plus);

        console.log('💰 Costi accessori:', costiAccessoriItinerario.length);
        console.log('✨ Extra suggeriti:', extraSuggeriti.length);
      } else {
        console.log('⚠️ Nessun itinerario pre-compilato per questa combinazione di zone');
      }
    }

    // Naviga alla timeline con tutti i dati necessari
    navigate('/timeline-editor', {
      state: {
        wizardData,
        filledBlocks,
        totalDays,
        selectedHotel,
        // 🆕 Dati itinerario pre-compilato (se trovato)
        itinerario: itinerarioMatch,
        costiAccessori: costiAccessoriItinerario,
        extraSuggeriti: extraSuggeriti,
        zoneUsate: zoneUsate
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
                ? `Pacchetti per ${zone.find(z => z.CODICE === selectedZone)?.ZONA}`
                : 'Seleziona una zona per vedere i pacchetti'}
            </p>
          </div>

          <div className={styles.packagesGrid}>
            {selectedZone ? (
              filteredPacchetti.length > 0 ? (
                filteredPacchetti.map((pexp, idx) => (
                  <PEXPCard
                    key={pexp.CODICE || idx}
                    pexp={pexp}
                    onClick={handlePacchettoClick}
                    isSelected={selectedPacchetto?.CODICE === pexp.CODICE}
                  />
                ))
              ) : (
                <div className={styles.noPacchetti}>
                  <p>Nessun pacchetto disponibile per questa zona.</p>
                </div>
              )
            ) : (
              <div className={styles.noPacchetti}>
                <p>Seleziona una zona sulla mappa per vedere i pacchetti disponibili.</p>
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