import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
// import useNavigationGuard from '../../hooks/useNavigationGuard'; // Temporarily disabled - causing crashes
import HeaderWizardSummary from './HeaderWizardSummary';
import MapInteractive from './MapInteractive';
import DayBlocksGrid from './DayBlocksGrid';
import PEXPCard from './PEXPCard';
import PEXPTab from './PEXPTab';
import DETEXPTab from './DETEXPTab';
import HotelCard from './HotelCard';
import HotelPanel from './HotelPanel';
import Button from '../../shared/Button';
import Breadcrumb from '../../shared/Breadcrumb';
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

  // State per Hotel selection
  const [selectedHotel, setSelectedHotel] = useState(null);

  // State per tab management fullscreen (sostituisce accordion/panelStack)
  const [activeTab, setActiveTab] = useState(null); // 'pexp' | 'detexp' | null
  const [currentPexp, setCurrentPexp] = useState(null);
  const [currentExp, setCurrentExp] = useState(null);

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

      console.log('📥 Caricamento CSV in corso...');

      // Carica tutti i CSV necessari (🆕 aggiunti itinerario, plus, costi_accessori)
      const [
        destinazioniData,
        zoneData,
        pacchettiData,
        itinerariData,
        plusData,
        costiAccessoriData
      ] = await Promise.all([
        loadCSV('destinazioni.csv').catch(e => { console.error('❌ Errore destinazioni.csv:', e); return []; }),
        loadCSV('zone.csv').catch(e => { console.error('❌ Errore zone.csv:', e); return []; }),
        loadCSV('pacchetti.csv').catch(e => { console.error('❌ Errore pacchetti.csv:', e); return []; }),
        loadCSV('itinerario.csv').catch(e => { console.error('❌ Errore itinerario.csv:', e); return []; }),
        loadCSV('plus.csv').catch(e => { console.error('❌ Errore plus.csv:', e); return []; }),
        loadCSV('costi_accessori.csv').catch(e => { console.error('❌ Errore costi_accessori.csv:', e); return []; })
      ]);

      console.log('✅ CSV caricati:', {
        destinazioni: destinazioniData.length,
        zone: zoneData.length,
        pacchetti: pacchettiData.length,
        itinerari: itinerariData.length,
        plus: plusData.length,
        costiAccessori: costiAccessoriData.length
      });

      // Trova destinazione selezionata (case-insensitive + trim)
      // Il wizard può passare sia il NOME che il CODICE
      const destInput = wizardData.destinazione?.toLowerCase().trim();
      console.log('🎯 Cercando destinazione (input wizard):', destInput);

      const dest = destinazioniData.find(d =>
        d.NOME?.toLowerCase().trim() === destInput ||
        d.CODICE?.toLowerCase().trim() === destInput
      );

      if (!dest) {
        console.error('❌ Destinazione non trovata:', destInput);
        setError('Destinazione non trovata');
        setLoading(false);
        return;
      }

      console.log('✅ Destinazione trovata:', dest.NOME, '(', dest.CODICE, ')');
      setDestinazioneData(dest);

      // Usa il NOME della destinazione per filtrare zone e pacchetti
      const destName = dest.NOME?.toLowerCase().trim();
      console.log('🔍 Filtrando per nome destinazione:', destName);

      // Filtra zone per destinazione (case-insensitive + trim)
      const destZone = zoneData.filter(z => {
        const zoneDest = z.DESTINAZIONE?.toLowerCase().trim();
        return zoneDest === destName;
      });
      console.log('🗺️ Zone caricate:', destZone.length, destZone);
      setZone(destZone);

      // Carica pacchetti reali dal CSV
      const destPacchetti = pacchettiData.filter(p => {
        const paccDest = p.DESTINAZIONE?.toLowerCase().trim();
        return paccDest === destName;
      });
      console.log('📦 Pacchetti caricati:', destPacchetti.length, destPacchetti);
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

  // Handler click pacchetto → Apre TAB PEXP fullscreen
  const handlePacchettoClick = (pexp) => {
    setCurrentPexp(pexp);
    setActiveTab('pexp');
  };

  // Handler chiusura TAB PEXP
  const handleClosePexpTab = () => {
    setActiveTab(null);
    setCurrentPexp(null);
  };

  // Handler click esperienza → Apre TAB DETEXP fullscreen
  const handleExpClick = (exp) => {
    setCurrentExp(exp);
    setActiveTab('detexp');
  };

  // Handler chiusura TAB DETEXP
  const handleCloseDetexpTab = () => {
    setActiveTab('pexp'); // Torna alla tab PEXP
    setCurrentExp(null);
  };

  // Handler conferma pacchetto dal Panel
  const handleConfirmPackage = (validExperiences, pexp) => {
    if (!pexp || !validExperiences || validExperiences.length === 0) return;

    // Trova codice zona corrispondente (🆕)
    const zonaObj = zone.find(z =>
      z.ZONA?.toLowerCase() === pexp.ZONA?.toLowerCase()
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
          packageName: pexp.NOME || pexp.nome,
          zona: pexp.ZONA, // 🆕 Traccia zona del pacchetto
          codiceZona: codiceZona // 🆕 Codice zona (es: ZTHBA01)
        });
      }
    }

    // Aggiungi i nuovi blocchi
    setFilledBlocks([...filledBlocks, ...newBlocks]);

    // Chiudi tutte le tab
    setActiveTab(null);
    setCurrentPexp(null);
    setCurrentExp(null);

    // Feedback utente con toast
    toast.success(`Pacchetto "${pexp.NOME_PACCHETTO || pexp.NOME || pexp.nome}" confermato!`, {
      description: `${newBlocks.length} esperienze aggiunte al viaggio (giorni ${startDay}-${startDay + newBlocks.length - 1})`,
    });
  };

  // Handler click blocco giorno
  const handleBlockClick = (day) => {
    toast.info(`Modifica giorno ${day}`, {
      description: 'Da implementare - riaprire PEXP Panel per modifiche',
    });
  };

  // Handler click card hotel → Apre Hotel Panel (still uses modal for now)
  const handleHotelCardClick = () => {
    // Hotel panel remains modal for now - can be converted later
    toast.info('Hotel selection coming soon!');
  };

  // Handler crea automatico - Riempie tutti i blocchi con pacchetti random
  const handleAutoFill = () => {
    if (pacchetti.length === 0) {
      toast.error('Nessun pacchetto disponibile per questa destinazione!');
      return;
    }

    // Calcola quanti giorni restano da riempire
    const daysToFill = totalDays - 1 - filledBlocks.length;

    if (daysToFill <= 0) {
      toast.info('Tutti i giorni sono già pianificati!');
      return;
    }

    // Seleziona pacchetti random fino a riempire tutti i giorni
    const newBlocks = [];
    let currentDay = filledBlocks.length > 0 ? Math.max(...filledBlocks.map(b => b.day || b)) + 1 : 2;
    let remainingDays = daysToFill;

    while (remainingDays > 0 && pacchetti.length > 0) {
      // Seleziona un pacchetto random
      const randomPexp = pacchetti[Math.floor(Math.random() * pacchetti.length)];
      const pexpDays = randomPexp.MIN_NOTTI || 3;

      // Estrai esperienze dal pacchetto
      const experienceIds = [];
      ['DAY2_ESPERIENZA_STD', 'DAY3_ESPERIENZA_STD', 'DAY4_ESPERIENZA_STD',
       'DAY5_ESPERIENZA_STD', 'DAY6_ESPERIENZA_STD', 'DAY7_ESPERIENZA_STD',
       'DAY8_ESPERIENZA_STD', 'DAY9_ESPERIENZA_STD', 'DAY10_ESPERIENZA_STD'].forEach(slot => {
        if (randomPexp[slot]) {
          experienceIds.push(randomPexp[slot]);
        }
      });

      // Trova codice zona
      const zonaObj = zone.find(z =>
        z.ZONA?.toLowerCase() === randomPexp.ZONA?.toLowerCase()
      );
      const codiceZona = zonaObj?.CODICE || null;

      // Aggiungi blocchi per questo pacchetto
      const daysForThisPackage = Math.min(experienceIds.length, remainingDays);

      for (let i = 0; i < daysForThisPackage; i++) {
        newBlocks.push({
          day: currentDay,
          experience: {
            id: experienceIds[i],
            nome: `Esperienza ${experienceIds[i]}`,
            descrizione: 'Auto-generata',
            durata: '1 giorno',
            prezzo: 0
          },
          packageName: randomPexp.NOME_PACCHETTO || randomPexp.nome,
          zona: randomPexp.ZONA,
          codiceZona: codiceZona
        });
        currentDay++;
        remainingDays--;
      }
    }

    setFilledBlocks([...filledBlocks, ...newBlocks]);

    toast.success('Itinerario creato automaticamente!', {
      description: `${newBlocks.length} giorni pianificati con pacchetti selezionati`,
    });
  };

  // Handler crea itinerario (🆕 con logica itinerari pre-compilati)
  const handleCreateItinerary = () => {
    if (filledBlocks.length < totalDays - 1) {
      toast.warning('Completa tutti i giorni prima di creare l\'itinerario!');
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
      {/* Breadcrumb */}
      <div className={styles.content}>
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Crea Viaggio', href: '/create' },
            { label: 'Trip Editor' }
          ]}
        />
      </div>

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

        {/* Pulsante crea itinerario */}
        <section className={styles.finalSection}>
          <div className={styles.finalCard}>
            <h3>🎯 Pronto per creare l'itinerario?</h3>
            <p>
              {allBlocksFilled
                ? 'Tutti i giorni sono pianificati! Crea ora il tuo itinerario ottimizzato.'
                : `Mancano ancora ${totalDays - 1 - filledBlocks.length} giorni da pianificare.`}
            </p>
            <div className={styles.finalActions}>
              {!allBlocksFilled && (
                <Button
                  onClick={handleAutoFill}
                  variant="outline"
                  size="lg"
                >
                  🎲 Crea Automatico
                </Button>
              )}
              <Button
                onClick={handleCreateItinerary}
                variant="primary"
                size="lg"
                disabled={!allBlocksFilled}
              >
                {allBlocksFilled ? '🚀 Crea Itinerario' : '⏳ Completa i giorni'}
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Sonner Toaster for notifications */}
      <Toaster position="top-right" richColors />

      {/* PEXP Tab (fullscreen) */}
      {activeTab === 'pexp' && currentPexp && (
        <PEXPTab
          pexp={currentPexp}
          onClose={handleClosePexpTab}
          onConfirm={handleConfirmPackage}
          onExpClick={handleExpClick}
          totalDays={totalDays}
          filledBlocks={filledBlocks}
        />
      )}

      {/* DETEXP Tab (fullscreen) */}
      {activeTab === 'detexp' && currentExp && (
        <DETEXPTab
          exp={currentExp}
          onClose={handleCloseDetexpTab}
          totalDays={totalDays}
          filledBlocks={filledBlocks}
        />
      )}
    </div>
  );
}

export default TripEditor;