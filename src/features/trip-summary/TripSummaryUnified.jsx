import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';
import { saveTripComplete } from '../../core/utils/tripStorage';
import { downloadAsText, downloadAsJSON, downloadAsPDF, copyToClipboard } from '../../core/utils/exportHelpers';
import { toPrice, toInt } from '../../core/utils/typeHelpers';
import { generateMediaForExperience } from '../../core/utils/mediaHelpers';
import { useCostiAccessori, calcolaCostiApplicabili } from '../../hooks/useCostiAccessori';
import { loadEntityData } from '../../core/utils/dataLoader';
import { groupHotelsByZoneAndBudget, getHotelExtras, calcolaNottiPerZona } from '../../core/utils/itinerarioHelpers';
import Button from '../../shared/Button';
import Breadcrumb from '../../shared/Breadcrumb';
import Checkout from '../wallet/Checkout';
import HotelCard from '../hotel-selection/components/HotelCard';
import styles from './TripSummaryUnified.module.css';

/**
 * TripSummary Unificato - "Il matrimonio perfetto"
 *
 * Flusso:
 * 1. Timeline animata spettacolare (giorni uno alla volta)
 * 2. Auto-espansione a riepilogo completo
 * 3. Selezione hotel inline ed espandibile
 * 4. Export, salva, pubblica, procedi pagamento
 */
function TripSummaryUnified() {
  const navigate = useNavigate();
  const location = useLocation();
  const { incrementTripStats, addDestination } = useUser();

  const tripData = location.state || {};
  const {
    wizardData = {},
    filledBlocks = [],
    totalDays = 7,
    selectedHotels: initialSelectedHotels = [],
    zoneVisitate = [],
    timeline = [],
    needsHotelSelection = false,
    itinerario = null,
    costiAccessori: costiAccessoriItinerario = [],
    extraSuggeriti = [],
    plus: initialPlus = []
  } = tripData;

  // ============ STATES ============
  // Timeline animation states
  const [showTimeline, setShowTimeline] = useState(true);
  const [visibleDays, setVisibleDays] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timelineComplete, setTimelineComplete] = useState(false);

  // Hotel selection states
  const [showHotelSelection, setShowHotelSelection] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [groupedHotels, setGroupedHotels] = useState({});
  const [plusDB, setPlusDB] = useState(initialPlus);
  const [hotelSelections, setHotelSelections] = useState({});
  const [selectedHotels, setSelectedHotels] = useState(initialSelectedHotels);

  // UI states
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // ============ TIMELINE ANIMATION ============
  useEffect(() => {
    // Mostra tutto subito senza animazione timeline separata
    setShowTimeline(false);
    setTimelineComplete(true);
  }, []);

  // Costruisce i dati della timeline
  const timelineData = useMemo(() => {
    return Array.from({ length: totalDays }, (_, i) => {
      const day = i + 1;

      // Giorno di partenza (ultimo giorno)
      if (day === totalDays) {
        return {
          day: totalDays,
          type: 'departure',
          title: 'Partenza',
          subtitle: `Check-out e viaggio di ritorno da ${wizardData.destinazioneNome || wizardData.destinazione || 'Destinazione'}`,
          description: 'Mattinata per ultimi acquisti o relax, poi trasferimento in aeroporto per il volo di ritorno',
          icon: '🛫',
          color: '#667eea'
        };
      }

      const block = filledBlocks.find(b => b.day === day);

      if (block && block.experience) {
        // Gestisci diversi tipi di blocchi
        if (block.type === 'transfer') {
          return {
            day,
            type: 'transfer',
            title: block.experience.nome || 'Spostamento',
            subtitle: `Trasferimento verso ${block.zona || ''}`,
            description: block.experience.descrizione || `Giornata dedicata al trasferimento. Check-out dalla struttura precedente, viaggio verso ${block.zona || 'la prossima destinazione'} e check-in nel nuovo alloggio.`,
            icon: '🚗',
            color: '#f59e0b'
          };
        }

        if (block.type === 'logistics') {
          return {
            day,
            type: 'logistics',
            title: block.experience.nome || 'Trasferimento e Sistemazione',
            subtitle: `${block.zona || ''} - Giorno di arrivo`,
            description: block.experience.descrizione || `Giornata dedicata al trasferimento e alla sistemazione. Tempo per ambientarsi nella nuova zona, esplorare i dintorni e rilassarsi dopo il viaggio.`,
            icon: '🏨',
            color: '#8b5cf6'
          };
        }

        // Esperienza normale o free day
        if (block.type === 'free') {
          const zona = block.zona || block.experience.zona || '';
          return {
            day,
            type: 'free',
            title: `Giorno libero${zona ? ' a ' + zona : ''}`,
            subtitle: 'Tempo libero per esplorare in autonomia',
            description: `Giornata senza attività programmate. Ideale per esplorare a proprio ritmo, scoprire luoghi nascosti, fare shopping o semplicemente rilassarsi${zona ? ' nella zona di ' + zona : ''}.`,
            icon: '🏖️',
            color: '#f59e0b'
          };
        }

        // Esperienza normale
        return {
          day,
          type: 'experience',
          title: block.experience.nome || block.experience.ESPERIENZE,
          subtitle: `${block.zona || block.experience.zona || ''}${block.experience.durata ? ' • ' + block.experience.durata : ''}`,
          description: block.experience.descrizione || block.experience.DESCRIZIONE || `Esperienza programmata${block.zona ? ' nella zona di ' + block.zona : ''}. Un'attività selezionata appositamente per rendere il tuo viaggio indimenticabile.`,
          duration: block.experience.durata || `${block.experience.SLOT || 1} slot`,
          price: block.experience.prezzo || block.experience.PRX_PAX,
          difficulty: block.experience.difficolta || block.experience.DIFFICOLTA,
          icon: '🎯',
          color: '#10b981',
          image: block.experience.immagine
        };
      }

      // Giorno senza blocco (default: giorno libero)
      // Cerca la zona corrente basandosi sui blocchi precedenti
      let currentZone = '';
      for (let prevDay = day - 1; prevDay >= 1; prevDay--) {
        const prevBlock = filledBlocks.find(b => b.day === prevDay);
        if (prevBlock && prevBlock.zona) {
          currentZone = prevBlock.zona;
          break;
        }
      }

      return {
        day,
        type: 'free',
        title: `Giorno libero${currentZone ? ' a ' + currentZone : ''}`,
        subtitle: 'Tempo libero per esplorare in autonomia',
        description: `Giornata senza attività programmate. Ideale per esplorare a proprio ritmo, scoprire luoghi nascosti, fare shopping o semplicemente rilassarsi${currentZone ? ' nella zona di ' + currentZone : ''}.`,
        icon: '🏖️',
        color: '#f59e0b'
      };
    });
  }, [totalDays, filledBlocks, wizardData]);

  // ============ DATI E MEDIA ============
  const { costiAccessori } = useCostiAccessori(wizardData.destinazione || wizardData.destinazioneNome);

  const heroImage = useMemo(() => {
    const destinationName = wizardData.destinazioneNome || wizardData.destinazione || 'travel';
    return `https://source.unsplash.com/featured/1200x400/?${encodeURIComponent(destinationName)},landscape&sig=hero`;
  }, [wizardData]);

  const experienceImages = useMemo(() => {
    // Filtra solo blocchi di tipo 'experience' per le immagini
    const realExperiences = filledBlocks.filter(b => b.type === 'experience');
    return realExperiences.slice(0, 6).map((block, index) => {
      const exp = block.experience;
      if (!exp) return null;
      const media = generateMediaForExperience(exp, {
        count: 1,
        includeVideo: false,
        destinazione: wizardData.destinazione
      });
      return media[0]?.url;
    }).filter(Boolean);
  }, [filledBlocks, wizardData.destinazione]);

  // ============ CALCOLO COSTI ============
  const calculateCosts = () => {
    let experiencesCost = 0;
    let hotelsCost = 0;
    let extrasCost = 0;

    // Costo esperienze (solo blocchi tipo 'experience', non transfer/logistics)
    filledBlocks.forEach(block => {
      if (block.type === 'experience' && block.experience && block.experience.prezzo) {
        const price = toPrice(block.experience.prezzo, 0);
        const numPersone = toInt(wizardData.numeroPersone, 1);
        experiencesCost += price * numPersone;
      }
    });

    // Costo hotel
    selectedHotels.forEach(item => {
      if (item.hotel && item.hotel.PREZZO) {
        const price = toPrice(item.hotel.PREZZO, 0);
        const notti = item.notti || 0;
        hotelsCost += price * notti;
      }
      // Extra hotel
      if (item.extras) {
        item.extras.forEach(extra => {
          const price = toPrice(extra.PRZ_PAX_GEN || extra.PRZ_PAX_FEB, 0);
          const numPersone = toInt(wizardData.numeroPersone, 1);
          extrasCost += price * numPersone;
        });
      }
    });

    // Costi accessori
    const numeroPersone = toInt(wizardData.numeroPersone, 1);
    const costiAccessoriApplicabili = calcolaCostiApplicabili(
      costiAccessori,
      numeroPersone,
      zoneVisitate
    );
    const accessoriesCost = costiAccessoriApplicabili.totale;

    const total = experiencesCost + hotelsCost + extrasCost + accessoriesCost;

    return {
      experiences: experiencesCost,
      hotels: hotelsCost,
      extras: extrasCost,
      accessories: accessoriesCost,
      accessoriesItems: costiAccessoriApplicabili.items,
      total: total,
      perPerson: total
    };
  };

  const costs = calculateCosts();

  // ============ HOTEL SELECTION LOGIC ============
  const loadHotelData = async () => {
    if (!needsHotelSelection || selectedHotels.length > 0) return;

    try {
      setLoadingHotels(true);

      const [hotelsData, plusData] = await Promise.all([
        loadEntityData('hotel', true),
        plusDB.length > 0 ? Promise.resolve(plusDB) : loadEntityData('extra', false)
      ]);

      const destInput = (wizardData.destinazioneNome || wizardData.destinazione || '').toLowerCase().trim();
      const destHotels = hotelsData.filter(h =>
        h.DESTINAZIONE?.toLowerCase().trim() === destInput
      );

      setHotels(destHotels);
      setPlusDB(plusData);

      const grouped = groupHotelsByZoneAndBudget(destHotels, zoneVisitate);
      setGroupedHotels(grouped);

      const nottiPerZona = calcolaNottiPerZona(filledBlocks, zoneVisitate);

      const initialSelections = {};
      zoneVisitate.forEach(zona => {
        const zonaKey = zona.nome.toUpperCase().trim();
        initialSelections[zonaKey] = {
          hotel: null,
          extras: [],
          notti: nottiPerZona[zonaKey] || 0
        };
      });
      setHotelSelections(initialSelections);

      setLoadingHotels(false);
    } catch (err) {
      console.error('❌ Errore caricamento hotel:', err);
      toast.error('Errore nel caricamento degli hotel');
      setLoadingHotels(false);
    }
  };

  const handleSelectHotel = (zonaNome, hotel) => {
    setHotelSelections(prev => ({
      ...prev,
      [zonaNome]: {
        ...prev[zonaNome],
        hotel: hotel
      }
    }));

    toast.success(`Hotel selezionato per ${zonaNome}`, {
      description: hotel.ZONA
    });
  };

  const handleToggleExtra = (zonaNome, extraCodice) => {
    setHotelSelections(prev => {
      const currentExtras = prev[zonaNome].extras || [];
      const newExtras = currentExtras.includes(extraCodice)
        ? currentExtras.filter(e => e !== extraCodice)
        : [...currentExtras, extraCodice];

      return {
        ...prev,
        [zonaNome]: {
          ...prev[zonaNome],
          extras: newExtras
        }
      };
    });
  };

  const handleConfirmHotels = () => {
    const allSelected = Object.keys(hotelSelections).every(
      zonaKey => hotelSelections[zonaKey].hotel !== null
    );

    if (!allSelected) {
      toast.warning('Seleziona un hotel per ogni zona prima di continuare');
      return;
    }

    const confirmedHotels = Object.entries(hotelSelections).map(([zonaKey, data]) => ({
      zona: zonaKey,
      hotel: data.hotel,
      extras: data.extras.map(extraCode => {
        return plusDB.find(p => p.CODICE === extraCode);
      }).filter(e => e !== undefined),
      notti: data.notti || 0
    }));

    setSelectedHotels(confirmedHotels);
    setShowHotelSelection(false);

    toast.success('🎉 Hotel confermati!', {
      description: 'Il riepilogo è stato aggiornato con i costi hotel'
    });
  };

  // ============ HANDLERS ============
  const handleExport = async (type) => {
    const exportData = {
      wizardData,
      timeline,
      totalDays,
      totalCost: costs.total,
      selectedHotels
    };

    if (type === 'text') {
      const result = downloadAsText(exportData);
      if (result.success) toast.success('Itinerario scaricato!');
    } else if (type === 'json') {
      const result = downloadAsJSON({ ...tripData, costs });
      if (result.success) toast.success('JSON esportato!');
    } else if (type === 'pdf') {
      const result = await downloadAsPDF(exportData);
      if (result.success) {
        toast.success('PDF generato con successo!');
      } else {
        toast.error(result.error || 'Errore generazione PDF');
      }
    } else if (type === 'clipboard') {
      copyToClipboard(exportData).then(result => {
        if (result.success) toast.success('Copiato negli appunti!');
      });
    }

    setShowExportMenu(false);
  };

  const handleEdit = (section) => {
    if (section === 'experiences') {
      navigate('/trip-editor-chat', { state: { wizardData, filledBlocks, totalDays, editMode: true } });
    }
  };

  const handleSaveTrip = async () => {
    setSaving(true);

    try {
      const saved = saveTripComplete({ ...tripData, selectedHotels }, 'upcoming');

      if (saved) {
        incrementTripStats('completed');
        addDestination(wizardData.destinazioneNome || wizardData.destinazione);

        toast.success('🎉 Viaggio salvato con successo!', {
          description: 'Puoi trovarlo in "I miei viaggi"'
        });

        setTimeout(() => {
          navigate('/my-trips');
        }, 1500);
      } else {
        toast.error('Errore nel salvataggio del viaggio');
      }
    } catch (error) {
      toast.error('Si è verificato un errore');
      console.error('Errore salvataggio:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublishTrip = async () => {
    setPublishing(true);

    try {
      const EXPLORE_TRIPS_KEY = 'trave_crew_explore_trips';
      const existingTrips = JSON.parse(localStorage.getItem(EXPLORE_TRIPS_KEY) || '[]');

      const publishedTrip = {
        id: crypto.randomUUID(),
        TITOLO: `${wizardData.destinazioneNome || wizardData.destinazione} - Viaggio ${totalDays} giorni`,
        DESCRIZIONE: `Esperienza unica con ${filledBlocks.length} attività selezionate`,
        DESTINAZIONE: wizardData.destinazioneNome || wizardData.destinazione,
        DURATA_GIORNI: totalDays,
        BUDGET_CATEGORIA: wizardData.budget || 'medium',
        COSTO_TOTALE_PP: costs.perPerson,
        GENERE: wizardData.tipoViaggio || 'privato',
        STATO: 'aperto',
        NUM_PERSONE: wizardData.numeroPersone,
        DATA_PARTENZA: wizardData.dataPartenza,
        IMMAGINE: heroImage,
        ESPERIENZE: filledBlocks.map(b => b.experience?.nome).filter(Boolean),
        HOTEL: selectedHotels.map(h => h.hotel?.ZONA).filter(Boolean),
        createdAt: new Date().toISOString(),
        publishedBy: 'user'
      };

      existingTrips.push(publishedTrip);
      localStorage.setItem(EXPLORE_TRIPS_KEY, JSON.stringify(existingTrips));

      setIsPublished(true);

      toast.success('🎉 Viaggio pubblicato con successo!', {
        description: 'Il tuo viaggio è ora visibile nella sezione Esplora',
        duration: 5000
      });

      setTimeout(() => {
        navigate('/explore');
      }, 2000);
    } catch (error) {
      console.error('Errore pubblicazione viaggio:', error);
      toast.error('Errore nella pubblicazione del viaggio');
    } finally {
      setPublishing(false);
    }
  };

  const handleProceedToPayment = () => {
    if (needsHotelSelection && selectedHotels.length === 0) {
      toast.warning('Seleziona gli hotel prima di procedere al pagamento');
      setShowHotelSelection(true);
      return;
    }
    setShowCheckout(true);
  };

  // ============ RENDER ============
  if (!wizardData.destinazione) {
    return (
      <div className={styles.tripSummary}>
        <div className={styles.error}>
          <h2>⚠️ Nessun viaggio trovato</h2>
          <p>Torna alla home e crea un nuovo viaggio</p>
          <Button onClick={() => navigate('/')}>← Torna alla Home</Button>
        </div>
      </div>
    );
  }

  // ============ UNIFIED SUMMARY VIEW ============
  return (
    <div className={`${styles.tripSummary} ${styles.darkTheme}`}>
      <Toaster position="top-right" richColors />

      {/* Hero Section con Statistiche Animate */}
      <motion.div
        className={styles.heroSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src={heroImage}
          alt={wizardData.destinazioneNome || wizardData.destinazione}
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay}>
          <div className={styles.heroContent}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className={styles.title}>
                ✨ Il Tuo Viaggio Perfetto
              </h1>
              <p className={styles.subtitle}>
                {wizardData.destinazioneNome || wizardData.destinazione} • {totalDays} Giorni Indimenticabili
              </p>
            </motion.div>

            <motion.div
              className={styles.stats}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className={styles.statItem}>
                <span className={styles.statIcon}>🗓️</span>
                <span className={styles.statValue}>{totalDays}</span>
                <span className={styles.statLabel}>Giorni</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statIcon}>🎯</span>
                <span className={styles.statValue}>{filledBlocks.filter(b => b.type === 'experience').length}</span>
                <span className={styles.statLabel}>Esperienze</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statIcon}>👥</span>
                <span className={styles.statValue}>{wizardData.numeroPersone}</span>
                <span className={styles.statLabel}>Persone</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statIcon}>💰</span>
                <span className={styles.statValue}>€{costs.total.toFixed(0)}</span>
                <span className={styles.statLabel}>Totale</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Timeline Giornaliera Integrata */}
      <div className={styles.content}>
        <motion.div
          className={styles.timelineSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h2 className={styles.sectionTitle}>🗓️ Il Tuo Itinerario Giorno per Giorno</h2>
          <div className={styles.timeline}>
            {timelineData.map((item, index) => (
              <motion.div
                key={item.day}
                className={`${styles.timelineItem} ${styles[item.type]}`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.5 + index * 0.1,
                  duration: 0.4
                }}
              >
                <div className={styles.timelineDot} style={{ backgroundColor: item.color }}>
                  <span className={styles.dayIcon}>{item.icon}</span>
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineDay}>Giorno {item.day}</div>
                  <h3 className={styles.timelineTitle}>{item.title}</h3>
                  <p className={styles.timelineSubtitle}>📍 {item.subtitle}</p>
                  {item.description && (
                    <p className={styles.timelineDescription}>{item.description}</p>
                  )}
                  {item.type === 'experience' && (
                    <div className={styles.timelineMeta}>
                      {item.duration && <span>⏱️ {item.duration}</span>}
                      {item.difficulty && <span>🚶 Difficoltà {item.difficulty}/3</span>}
                      {item.price && <span>💰 €{item.price}</span>}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        {/* Card Informazioni Viaggio */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>📋 Informazioni Viaggio</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Destinazione</span>
                <span className={styles.infoValue}>{wizardData.destinazioneNome || wizardData.destinazione}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Durata</span>
                <span className={styles.infoValue}>{totalDays} giorni</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Partecipanti</span>
                <span className={styles.infoValue}>{wizardData.numeroPersone} {wizardData.numeroPersone === 1 ? 'persona' : 'persone'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Budget</span>
                <span className={styles.infoValue}>
                  {wizardData.budget === 'low' && '€ Economico'}
                  {wizardData.budget === 'medium' && '€€ Medio'}
                  {wizardData.budget === 'high' && '€€€ Lusso'}
                </span>
              </div>
              {wizardData.dataPartenza && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Partenza</span>
                  <span className={styles.infoValue}>
                    {new Date(wizardData.dataPartenza).toLocaleDateString('it-IT')}
                  </span>
                </div>
              )}
              {wizardData.interessi && wizardData.interessi.length > 0 && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Interessi</span>
                  <span className={styles.infoValue}>{wizardData.interessi.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Card Riepilogo Costi */}
        <motion.div
          className={`${styles.card} ${styles.costCard}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>💰 Riepilogo Costi</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.costBreakdown}>
              <div className={styles.costRow}>
                <span>Esperienze</span>
                <span className={styles.costValue}>€{costs.experiences.toFixed(2)}</span>
              </div>
              <div className={styles.costRow}>
                <span>Hotel</span>
                <span className={styles.costValue}>
                  {selectedHotels.length === 0 ? 'Da selezionare' : `€${costs.hotels.toFixed(2)}`}
                </span>
              </div>
              {costs.extras > 0 && (
                <div className={styles.costRow}>
                  <span>Extra</span>
                  <span className={styles.costValue}>€{costs.extras.toFixed(2)}</span>
                </div>
              )}
              {costs.accessories > 0 && (
                <div className={styles.costRow}>
                  <span>Costi Accessori</span>
                  <span className={styles.costValue}>€{costs.accessories.toFixed(2)}</span>
                </div>
              )}
              {costs.accessoriesItems && costs.accessoriesItems.length > 0 && (
                <div className={styles.accessoriesDetail}>
                  {costs.accessoriesItems.map((item, idx) => (
                    <div key={idx} className={styles.accessoryItem}>
                      <span className={styles.accessoryLabel}>
                        • {item.tipo}: {item.descrizione}
                      </span>
                      <span className={styles.accessoryValue}>
                        €{item.costo.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className={styles.costDivider}></div>
              <div className={`${styles.costRow} ${styles.costTotal}`}>
                <span>{selectedHotels.length === 0 ? 'Totale Parziale' : 'Totale'}</span>
                <span className={styles.costValue}>€{costs.total.toFixed(2)}</span>
              </div>
              <div className={styles.costRow}>
                <span>Per persona</span>
                <span className={styles.costValue}>€{costs.perPerson.toFixed(2)}</span>
              </div>
            </div>
            <p className={styles.costNote}>
              ℹ️ {selectedHotels.length === 0
                ? 'Il costo hotel verrà aggiunto dopo la selezione. I prezzi sono indicativi e non includono voli internazionali'
                : 'I prezzi sono indicativi e non includono voli internazionali'}
            </p>
          </div>
        </motion.div>

        {/* Pulsante Scegli Hotel - Naviga alla CHAT per selezione */}
        {needsHotelSelection && selectedHotels.length === 0 && (
          <motion.div
            className={styles.hotelCTA}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                // Naviga alla CHAT per la selezione hotel (DECISIONI = CHAT, RIEPILOGHI = LANDING)
                console.log('🏨 Navigating to chat for hotel selection');
                navigate('/trip-editor-chat', {
                  state: {
                    wizardData,
                    initialStep: 'hotels',
                    tripData: {
                      selectedZones: tripData.selectedZones || [],
                      filledBlocks: tripData.filledBlocks || filledBlocks,
                      totalDays: tripData.totalDays || totalDays,
                      hotels: tripData.hotels || [],
                      costs: tripData.costs || {}
                    }
                  }
                });
              }}
            >
              🏨 Scegli Hotel nella Chat
            </Button>
          </motion.div>
        )}

        {/* Sezione Hotel Espandibile */}
        <AnimatePresence>
          {showHotelSelection && (
            <motion.div
              className={styles.hotelSection}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>🏨 Seleziona i Tuoi Hotel</h2>
                </div>
                <div className={styles.cardBody}>
                  {loadingHotels ? (
                    <div className={styles.loading}>
                      <div className={styles.spinner}></div>
                      <p>Caricamento hotel disponibili...</p>
                    </div>
                  ) : (
                    <div className={styles.hotelZones}>
                      {zoneVisitate.map((zona, idx) => {
                        const zonaKey = zona.nome.toUpperCase().trim();
                        const hotelsByBudget = groupedHotels[zonaKey] || {};
                        const userBudget = wizardData.budget || 'medium';
                        const budgetMap = { low: 'LOW', medium: 'MEDIUM', high: 'HIGH' };
                        const availableHotels = hotelsByBudget[budgetMap[userBudget]] || [];
                        const selectedHotel = hotelSelections[zonaKey]?.hotel;
                        const notti = hotelSelections[zonaKey]?.notti || 0;

                        return (
                          <div key={idx} className={styles.zoneSection}>
                            <h3 className={styles.zoneName}>
                              📍 {zona.nome} ({notti} {notti === 1 ? 'notte' : 'notti'})
                            </h3>
                            <div className={styles.hotelsGrid}>
                              {availableHotels.length > 0 ? (
                                availableHotels.map((hotel, hotelIdx) => (
                                  <HotelCard
                                    key={hotelIdx}
                                    hotel={hotel}
                                    isSelected={selectedHotel?.CODICE === hotel.CODICE}
                                    onClick={() => handleSelectHotel(zonaKey, hotel)}
                                  />
                                ))
                              ) : (
                                <p className={styles.noHotels}>Nessun hotel disponibile per questa zona e budget</p>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      <div className={styles.confirmSection}>
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={handleConfirmHotels}
                        >
                          ✅ Conferma Hotel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hotel Selezionati */}
        {selectedHotels.length > 0 && (
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>🏨 I Tuoi Hotel</h2>
              <Button
                variant="outline"
                onClick={() => {
                  setShowHotelSelection(true);
                  loadHotelData();
                }}
              >
                ✏️ Modifica
              </Button>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.hotelsList}>
                {selectedHotels.map((item, index) => {
                  if (!item.hotel) return null;
                  const hotel = item.hotel;
                  return (
                    <div key={index} className={styles.hotelItem}>
                      <div className={styles.hotelIcon}>🏨</div>
                      <div className={styles.hotelInfo}>
                        <h3 className={styles.hotelName}>{hotel.ZONA}</h3>
                        <p className={styles.hotelZone}>{item.zona}</p>
                        <p className={styles.hotelType}>
                          {hotel.TIPO === 'LOW' && '€ Budget'}
                          {hotel.TIPO === 'MEDIUM' && '€€ Medio'}
                          {hotel.TIPO === 'HIGH' && '€€€ Lusso'}
                        </p>
                        {item.extras && item.extras.length > 0 && (
                          <p className={styles.hotelExtras}>
                            + {item.extras.length} extra
                          </p>
                        )}
                      </div>
                      <div className={styles.hotelPrice}>
                        €{(parseFloat(hotel.PREZZO) || 0).toFixed(2)} / notte
                        <br />
                        <span className={styles.hotelNights}>× {item.notti} notti</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer Actions */}
      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerActions}>
            <Button variant="outline" onClick={() => navigate(-1)}>
              ← Indietro
            </Button>

            <div className={styles.exportButtonWrapper}>
              <Button variant="outline" onClick={() => setShowExportMenu(!showExportMenu)}>
                📤 Esporta
              </Button>
              {showExportMenu && (
                <div className={styles.exportMenu}>
                  <button className={styles.exportOption} onClick={() => handleExport('text')}>
                    📄 Scarica Testo
                  </button>
                  <button className={styles.exportOption} onClick={() => handleExport('json')}>
                    📋 Esporta JSON
                  </button>
                  <button className={styles.exportOption} onClick={() => handleExport('clipboard')}>
                    📋 Copia Clipboard
                  </button>
                  <button className={styles.exportOption} onClick={() => handleExport('pdf')}>
                    📕 Scarica PDF
                  </button>
                </div>
              )}
            </div>

            <Button variant="outline" onClick={handleSaveTrip} disabled={saving}>
              {saving ? 'Salvataggio...' : '💾 Salva Viaggio'}
            </Button>

            <Button
              variant="outline"
              onClick={handlePublishTrip}
              disabled={publishing || isPublished}
              style={{
                background: isPublished ? '#10b981' : 'transparent',
                color: isPublished ? 'white' : '#667eea',
                borderColor: isPublished ? '#10b981' : '#667eea'
              }}
            >
              {publishing ? '⏳ Pubblicazione...' : isPublished ? '✓ Pubblicato' : '🌍 Pubblica'}
            </Button>

            <Button variant="primary" onClick={handleProceedToPayment} size="lg">
              💳 Procedi al Pagamento
            </Button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <Checkout
          tripData={{
            id: Date.now().toString(),
            name: `${wizardData.destinazioneNome || wizardData.destinazione}`,
            destination: wizardData.destinazioneNome || wizardData.destinazione,
            dates: wizardData.dataPartenza ? `Dal ${new Date(wizardData.dataPartenza).toLocaleDateString('it-IT')}` : undefined,
            participants: wizardData.numeroPersone,
            costs
          }}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}

export default TripSummaryUnified;
