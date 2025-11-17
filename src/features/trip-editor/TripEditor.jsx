import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import useNavigationGuard from '../../hooks/useNavigationGuard';
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
  getZoneItinerario,
  getZoneVisitate
} from '../../core/utils/itinerarioHelpers';
import styles from './TripEditor.module.css';

function TripEditor() {
  const navigate = useNavigate();
  const location = useLocation();

  // Recupera dati wizard e dati viaggio (passati dalla route)
  const wizardData = location.state?.wizardData || {
    destinazione: 'Thailandia',
    stato_id: 1,
    numeroPersone: 2,
    tipoViaggio: 'privato',
    budget: 'medium',
    interessi: ['Natura', 'Avventura'],
    dataPartenza: null
  };

  // Recupera dati per edit mode (quando si modifica un viaggio salvato)
  const editMode = location.state?.editMode || false;
  const tripId = location.state?.tripId || null;
  const initialFilledBlocks = location.state?.filledBlocks || [];
  const initialTotalDays = location.state?.totalDays || 7;

  console.log('🔧 TripEditor caricato:', {
    editMode,
    tripId,
    hasFilledBlocks: initialFilledBlocks.length > 0,
    totalDays: initialTotalDays
  });

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [destinazioneData, setDestinazioneData] = useState(null);
  const [zone, setZone] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [pacchetti, setPacchetti] = useState([]);
  const [selectedPacchetto, setSelectedPacchetto] = useState(null);
  const [filledBlocks, setFilledBlocks] = useState(initialFilledBlocks);
  const [totalDays, setTotalDays] = useState(initialTotalDays);

  // State per Hotel selection
  const [selectedHotel, setSelectedHotel] = useState(null);

  // State per tab management fullscreen (sostituisce accordion/panelStack)
  const [activeTab, setActiveTab] = useState(null); // 'pexp' | 'detexp' | null
  const [currentPexp, setCurrentPexp] = useState(null);
  const [currentExp, setCurrentExp] = useState(null);

  // State per editing blocchi riempiti
  const [editingBlock, setEditingBlock] = useState(null);

  // State per database itinerari (🆕)
  const [itinerari, setItinerari] = useState([]);
  const [costiAccessori, setCostiAccessori] = useState([]);
  const [plus, setPlus] = useState([]);
  const [esperienze, setEsperienze] = useState([]);

  // State per animazione creazione itinerario
  const [creatingItinerary, setCreatingItinerary] = useState(false);

  // State per sticky day blocks
  const [isDayBlocksSticky, setIsDayBlocksSticky] = useState(false);

  // Ref per la sezione pacchetti (per scroll automatico)
  const packagesRef = useRef(null);

  // Ref per la sezione "i tuoi giorni"
  const dayBlocksRef = useRef(null);

  // Protezione navigazione - Previene perdita dati non salvati
  const hasUnsavedChanges = filledBlocks.length > 0 && filledBlocks.length < totalDays - 1;
  useNavigationGuard(
    hasUnsavedChanges,
    'Sei sicuro di voler uscire dal Trip Editor? Il viaggio non è stato completato e le modifiche andranno perse.'
  );

  // Carica dati iniziali
  useEffect(() => {
    loadData();
  }, []);

  // Mostra toast quando viene caricato un viaggio in edit mode
  useEffect(() => {
    if (!loading && editMode && filledBlocks.length > 0) {
      toast.success('✏️ Viaggio caricato per la modifica', {
        description: `${filledBlocks.length} esperienze caricate su ${totalDays} giorni`
      });
    }
  }, [loading, editMode, filledBlocks.length, totalDays]);

  // Scroll listener per sticky day blocks
  useEffect(() => {
    const handleScroll = () => {
      if (dayBlocksRef.current) {
        const rect = dayBlocksRef.current.getBoundingClientRect();
        // Se il blocco giorni è scrollato oltre la top (sopra il viewport), rendilo sticky
        setIsDayBlocksSticky(rect.top <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      console.log('📥 Caricamento CSV in corso...');

      // Carica tutti i CSV necessari (🆕 aggiunti itinerario, plus, costi_accessori, esperienze)
      const [
        destinazioniData,
        zoneData,
        pacchettiData,
        itinerariData,
        plusData,
        costiAccessoriData,
        esperienzeData
      ] = await Promise.all([
        loadCSV('destinazioni.csv').catch(e => { console.error('❌ Errore destinazioni.csv:', e); return []; }),
        loadCSV('zone.csv').catch(e => { console.error('❌ Errore zone.csv:', e); return []; }),
        loadCSV('pacchetti.csv').catch(e => { console.error('❌ Errore pacchetti.csv:', e); return []; }),
        loadCSV('itinerario.csv').catch(e => { console.error('❌ Errore itinerario.csv:', e); return []; }),
        loadCSV('plus.csv').catch(e => { console.error('❌ Errore plus.csv:', e); return []; }),
        loadCSV('costi_accessori.csv').catch(e => { console.error('❌ Errore costi_accessori.csv:', e); return []; }),
        loadCSV('esperienze.csv').catch(e => { console.error('❌ Errore esperienze.csv:', e); return []; })
      ]);

      console.log('✅ CSV caricati:', {
        destinazioni: destinazioniData.length,
        zone: zoneData.length,
        pacchetti: pacchettiData.length,
        itinerari: itinerariData.length,
        plus: plusData.length,
        costiAccessori: costiAccessoriData.length,
        esperienze: esperienzeData.length
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

      // Salva database itinerari, plus, costi accessori e esperienze (🆕)
      setItinerari(itinerariData);
      setPlus(plusData);
      setCostiAccessori(costiAccessoriData);
      setEsperienze(esperienzeData);

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

  // Funzione per scrollare alla sezione esperienze
  const scrollToExperiences = () => {
    if (packagesRef.current) {
      packagesRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Funzione per scrollare alla sezione "i tuoi giorni"
  const scrollToDayBlocks = () => {
    if (dayBlocksRef.current) {
      dayBlocksRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
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
    setEditingBlock(null); // Reset editing mode
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

    // MODALITÀ EDITING - Sostituisci blocco esistente
    if (editingBlock) {
      // Rimuovi il blocco vecchio
      const updatedBlocks = filledBlocks.filter(b => b.day !== editingBlock.day);

      // Se c'è una sola esperienza, sostituisci nello stesso giorno
      if (validExperiences.length === 1) {
        const newBlock = {
          day: editingBlock.day,
          experience: validExperiences[0],
          packageName: pexp.NOME_PACCHETTO || pexp.NOME || pexp.nome,
          zona: pexp.ZONA,
          codiceZona: codiceZona
        };

        setFilledBlocks([...updatedBlocks, newBlock]);

        toast.success(`Giorno ${editingBlock.day} modificato!`, {
          description: `Nuova esperienza: ${validExperiences[0].nome}`,
        });
      } else {
        // Se ci sono più esperienze, avvisa l'utente
        toast.warning('Attenzione', {
          description: `Il pacchetto selezionato contiene ${validExperiences.length} esperienze. Puoi sostituire solo un giorno alla volta.`,
        });
      }

      // Esci dalla modalità editing
      setEditingBlock(null);
      setActiveTab(null);
      setCurrentPexp(null);
      setCurrentExp(null);

      return;
    }

    // MODALITÀ NORMALE - Aggiungi nuovi blocchi
    // Calcola giorni necessari (1 esperienza = 1 giorno)
    const experienceDays = validExperiences.length;
    const availableDays = totalDays - 1 - filledBlocks.length; // -1 per il giorno di arrivo

    // Validazione: controlla se ci sono abbastanza giorni disponibili
    if (experienceDays > availableDays) {
      const giornoOGiorni = experienceDays === 1 ? 'giorno' : 'giorni';
      const giornoOGiorni2 = availableDays === 1 ? 'giorno' : 'giorni';

      // Mostra alert chiedendo se vuole aggiungere giorni
      const shouldAddDays = window.confirm(
        `⚠️ Il pacchetto richiede ${experienceDays} ${giornoOGiorni}, ma hai solo ${availableDays} ${giornoOGiorni2} disponibili.\n\n` +
        `Vuoi aggiungere ${experienceDays - availableDays} ${giornoOGiorni} al viaggio?`
      );

      if (shouldAddDays) {
        // Aggiungi giorni necessari
        const newTotalDays = totalDays + (experienceDays - availableDays);
        setTotalDays(newTotalDays);

        toast.success('Giorni aggiunti al viaggio!', {
          description: `Il viaggio ora dura ${newTotalDays} giorni`,
        });
      } else {
        // L'utente ha rifiutato, non aggiungere il pacchetto
        toast.info('Pacchetto non aggiunto', {
          description: 'Seleziona un pacchetto più piccolo o aggiungi giorni al viaggio',
        });
        return;
      }
    }

    // Validazione: controlla esperienze duplicate
    const existingExperienceIds = filledBlocks.map(block => block.experience?.id).filter(Boolean);
    const duplicateExperiences = validExperiences.filter(exp =>
      existingExperienceIds.includes(exp.id)
    );

    if (duplicateExperiences.length > 0) {
      const duplicateNames = duplicateExperiences.map(exp => exp.nome).join(', ');
      toast.error('Esperienza già presente nel viaggio!', {
        description: `Le seguenti esperienze sono già state aggiunte: ${duplicateNames}`,
      });
      return;
    }

    // Riempi blocchi giorni con le esperienze
    const newBlocks = [];
    const startDay = filledBlocks.length > 0 ? Math.max(...filledBlocks.map(b => b.day || b)) + 1 : 2; // Inizia dal giorno 2 (1 è arrivo)

    for (let i = 0; i < experienceDays; i++) {
      const dayNum = startDay + i;
      if (dayNum <= totalDays) {
        newBlocks.push({
          day: dayNum,
          experience: validExperiences[i],
          packageName: pexp.NOME_PACCHETTO || pexp.NOME || pexp.nome,
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

    // Scroll alla sezione "i tuoi giorni" dopo un breve delay per l'animazione
    setTimeout(() => {
      scrollToDayBlocks();
    }, 500);
  };

  // Handler rimozione blocco
  const handleRemoveBlock = (day) => {
    const block = filledBlocks.find(b => b.day === day);

    if (!block) {
      toast.error('Blocco non trovato');
      return;
    }

    // Rimuovi il blocco
    const updatedBlocks = filledBlocks.filter(b => b.day !== day);
    setFilledBlocks(updatedBlocks);

    // Chiudi la tab e esci dalla modalità editing
    setActiveTab(null);
    setEditingBlock(null);
    setCurrentPexp(null);
    setCurrentExp(null);

    toast.success(`Giorno ${day} rimosso`, {
      description: `Esperienza "${block.experience?.nome || 'Sconosciuta'}" eliminata`,
    });
  };

  // Handler dislike esperienza - Rimuove e compatta i giorni successivi
  const handleDislikeExperience = (exp) => {
    // Trova il blocco che contiene questa esperienza
    const blockToRemove = filledBlocks.find(b =>
      b.experience?.nome === exp.nome ||
      b.experience?.NOME === exp.NOME ||
      b.experience?.codice === exp.codice
    );

    if (!blockToRemove) {
      toast.error('Esperienza non trovata nel viaggio');
      handleCloseDetexpTab();
      return;
    }

    const dayNumber = blockToRemove.day;
    const zonaNome = blockToRemove.zona || '';

    // Rimuovi il blocco e compatta i giorni successivi
    const updatedBlocks = filledBlocks
      .filter(b => b.day !== dayNumber)
      .map(b => {
        // Sposta indietro i giorni successivi per riempire il vuoto
        if (b.day > dayNumber) {
          return { ...b, day: b.day - 1 };
        }
        return b;
      })
      .sort((a, b) => a.day - b.day);

    setFilledBlocks(updatedBlocks);

    // Chiudi la tab e resetta stati
    setActiveTab(null);
    setCurrentExp(null);
    setCurrentPexp(null);
    setEditingBlock(null);

    // Feedback utente
    toast.success('Esperienza rimossa', {
      description: `Giorno ${dayNumber} eliminato. I giorni successivi sono stati riorganizzati.`,
      duration: 4000,
    });
  };

  // Handler click blocco giorno - Permette modifica o rimozione
  const handleBlockClick = (day) => {
    // Trova il blocco corrispondente
    const block = filledBlocks.find(b => b.day === day);

    if (!block) {
      toast.info('Questo giorno non è ancora pianificato');
      return;
    }

    // Trova il pacchetto originale dal nome
    const originalPexp = pacchetti.find(p =>
      (p.NOME_PACCHETTO || p.NOME || p.nome) === block.packageName
    );

    if (!originalPexp) {
      toast.error('Pacchetto originale non trovato. Impossibile modificare.');
      return;
    }

    // Imposta modalità editing
    setEditingBlock(block);
    setCurrentPexp(originalPexp);
    setActiveTab('pexp');

    toast.info(`Modifica giorno ${day}`, {
      description: `Pacchetto: ${block.packageName}`,
    });
  };

  // Handler click card hotel → Apre Hotel Panel (still uses modal for now)
  const handleHotelCardClick = () => {
    // Hotel panel remains modal for now - can be converted later
    toast.info('Hotel selection coming soon!');
  };

  // Handler crea automatico - Riempie tutti i blocchi con pacchetti random e dati reali
  const handleAutoFill = () => {
    if (pacchetti.length === 0) {
      toast.error('Nessun pacchetto disponibile per questa destinazione!');
      return;
    }

    if (esperienze.length === 0) {
      toast.error('Errore: database esperienze non caricato!');
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

      // Estrai codici esperienze dal pacchetto
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

      // Aggiungi blocchi per questo pacchetto con dati reali delle esperienze
      const daysForThisPackage = Math.min(experienceIds.length, remainingDays);

      for (let i = 0; i < daysForThisPackage; i++) {
        const expCodice = experienceIds[i];

        // Trova l'esperienza reale dal database
        const expData = esperienze.find(exp => exp.CODICE === expCodice);

        if (expData) {
          newBlocks.push({
            day: currentDay,
            experience: {
              id: expData.CODICE,
              nome: expData.ESPERIENZE || `Esperienza ${expData.CODICE}`,
              descrizione: expData.DESCRIZIONE || '',
              durata: `${expData.SLOT || 1} ${expData.SLOT === 1 ? 'giorno' : 'giorni'}`,
              prezzo: parseFloat(expData.PRX_PAX) || 0,
              difficolta: expData.DIFFICOLTA || 1,
              slot: expData.SLOT || 1,
              // Dati completi esperienza
              ...expData
            },
            packageName: randomPexp.NOME_PACCHETTO || randomPexp.nome,
            zona: randomPexp.ZONA,
            codiceZona: codiceZona
          });
        } else {
          // Fallback se l'esperienza non viene trovata
          console.warn(`⚠️ Esperienza ${expCodice} non trovata nel database`);
          newBlocks.push({
            day: currentDay,
            experience: {
              id: expCodice,
              nome: `Esperienza ${expCodice}`,
              descrizione: 'Dati non disponibili',
              durata: '1 giorno',
              prezzo: 0
            },
            packageName: randomPexp.NOME_PACCHETTO || randomPexp.nome,
            zona: randomPexp.ZONA,
            codiceZona: codiceZona
          });
        }

        currentDay++;
        remainingDays--;
      }
    }

    setFilledBlocks([...filledBlocks, ...newBlocks]);

    toast.success('Itinerario creato automaticamente!', {
      description: `${newBlocks.length} giorni pianificati con esperienze reali`,
    });
  };

  // Handler aggiungi giorno
  const handleAddDay = () => {
    const newTotalDays = totalDays + 1;
    setTotalDays(newTotalDays);

    toast.success('Giorno aggiunto!', {
      description: `Il viaggio ora dura ${newTotalDays} giorni`,
    });
  };

  // Handler rimuovi giorno
  const handleRemoveDay = (day) => {
    if (day === 1) {
      toast.error('Non puoi rimuovere il giorno di arrivo');
      return;
    }

    // Controlla se il giorno ha un'esperienza associata
    const hasExperience = filledBlocks.some(b => b.day === day);

    if (hasExperience) {
      const shouldRemove = window.confirm(
        `⚠️ Il giorno ${day} ha un'esperienza associata.\n\nSei sicuro di voler rimuovere questo giorno? L'esperienza verrà eliminata.`
      );

      if (!shouldRemove) {
        return;
      }
    }

    // Controlla se è l'ultimo giorno
    const isLastDay = day === totalDays;

    if (isLastDay) {
      // Rimuovi l'ultimo giorno
      const updatedBlocks = filledBlocks.filter(b => b.day !== day);
      setFilledBlocks(updatedBlocks);
      setTotalDays(totalDays - 1);

      toast.success('Giorno rimosso!', {
        description: `Il viaggio ora dura ${totalDays - 1} giorni`,
      });
    } else {
      toast.error('Puoi rimuovere solo l\'ultimo giorno');
    }
  };

  // Handler crea itinerario (🆕 con logica zone visitate e selezione hotel + animazione)
  const handleCreateItinerary = async () => {
    if (filledBlocks.length < totalDays - 1) {
      toast.warning('Completa tutti i giorni prima di continuare!');
      return;
    }

    // Attiva animazione
    setCreatingItinerary(true);

    // Simula elaborazione (minimo 3 secondi)
    const startTime = Date.now();

    // 🆕 Estrai zone visitate usando la nuova utility
    const zoneVisitate = getZoneVisitate(filledBlocks);

    console.log('🗺️ Zone visitate:', zoneVisitate);

    if (zoneVisitate.length === 0) {
      setCreatingItinerary(false);
      toast.error('Errore: nessuna zona trovata nei pacchetti confermati');
      return;
    }

    // 🆕 Estrai codici zone per cercare itinerario pre-compilato
    const codiciZone = zoneVisitate.map(z => z.codice);

    // 🆕 Cerca itinerario pre-compilato che matcha le zone
    let itinerarioMatch = null;
    let costiAccessoriItinerario = [];
    let extraSuggeriti = [];

    if (codiciZone.length > 0 && itinerari.length > 0) {
      itinerarioMatch = findItinerarioByZone(codiciZone, itinerari);

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

    // Assicura che siano passati almeno 3 secondi
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, 3000 - elapsedTime);

    await new Promise(resolve => setTimeout(resolve, remainingTime));

    // 🆕 Naviga alla selezione hotel passando le zone visitate
    navigate('/hotel-selection', {
      state: {
        wizardData,
        filledBlocks,
        totalDays,
        zoneVisitate,
        // Dati itinerario pre-compilato (se trovato)
        itinerario: itinerarioMatch,
        costiAccessori: costiAccessoriItinerario,
        extraSuggeriti: extraSuggeriti,
        plus: plus // Passa il database plus per gli extra hotel
      }
    });

    toast.success('Itinerario completato!', {
      description: 'Ora seleziona gli hotel per le zone visitate'
    });

    setCreatingItinerary(false);
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
        {/* Blocchi giorni - Diventa sticky allo scroll */}
        <section ref={dayBlocksRef} className={styles.section}>
          <DayBlocksGrid
            totalDays={totalDays}
            filledBlocks={filledBlocks}
            onBlockClick={handleBlockClick}
            onAddDay={handleAddDay}
            onRemoveDay={handleRemoveDay}
            sticky={isDayBlocksSticky}
          />
        </section>

        {/* Azioni principali - SEMPRE IN ALTO */}
        <section className={styles.actionsSection}>
          <div className={styles.actionsCard}>
            <div className={styles.actionsInfo}>
              <h3>
                {allBlocksFilled
                  ? '✅ Tutti i giorni completati!'
                  : `⏳ ${totalDays - 1 - filledBlocks.length} giorni da pianificare`}
              </h3>
              <p>
                {allBlocksFilled
                  ? 'Crea ora il tuo itinerario ottimizzato'
                  : 'Seleziona i pacchetti esperienza dalla mappa qui sotto'}
              </p>
            </div>
            <div className={styles.actionsButtons}>
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

        {/* Mappa interattiva */}
        <section className={styles.section}>
          <MapInteractive
            destinazione={destinazioneData}
            zone={zone}
            selectedZone={selectedZone}
            onZoneClick={handleZoneClick}
            filledBlocks={filledBlocks}
            scrollToExperiences={scrollToExperiences}
          />
        </section>

        {/* Pacchetti disponibili */}
        <section ref={packagesRef} className={styles.section}>
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
      </div>

      {/* Sonner Toaster for notifications */}
      <Toaster
        position="top-right"
        richColors
        duration={3000}
        closeButton
      />

      {/* PEXP Tab (fullscreen) */}
      {activeTab === 'pexp' && currentPexp && (
        <PEXPTab
          pexp={currentPexp}
          onClose={handleClosePexpTab}
          onConfirm={handleConfirmPackage}
          onExpClick={handleExpClick}
          totalDays={totalDays}
          filledBlocks={filledBlocks}
          isEditing={!!editingBlock}
          editingBlock={editingBlock}
          onRemove={handleRemoveBlock}
        />
      )}

      {/* DETEXP Tab (fullscreen) */}
      {activeTab === 'detexp' && currentExp && (
        <DETEXPTab
          exp={currentExp}
          onClose={handleCloseDetexpTab}
          onDislike={handleDislikeExperience}
          totalDays={totalDays}
          filledBlocks={filledBlocks}
          destinazione={wizardData.destinazione}
          zona={selectedZone?.nome || ''}
        />
      )}

      {/* Animazione creazione itinerario */}
      {creatingItinerary && (
        <div className={styles.creatingOverlay}>
          <div className={styles.creatingContent}>
            <div className={styles.creatingSpinner}>
              <div className={styles.spinnerRing}></div>
              <div className={styles.spinnerRing}></div>
              <div className={styles.spinnerRing}></div>
            </div>
            <h2 className={styles.creatingTitle}>✨ Creazione itinerario in corso...</h2>
            <p className={styles.creatingText}>
              Stiamo ottimizzando il tuo viaggio perfetto
            </p>
            <div className={styles.creatingSteps}>
              <div className={styles.step}>📍 Analisi zone visitate</div>
              <div className={styles.step}>🏨 Ricerca hotel disponibili</div>
              <div className={styles.step}>💰 Calcolo costi ottimali</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TripEditor;