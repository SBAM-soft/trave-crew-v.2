import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import useTripEditorChatStore from './store/useTripEditorChatStore';
import useChatFlow from './hooks/useChatFlow';
import ChatContainer from './components/ChatContainer';
import ChatHeader from './components/ChatHeader';
import ExperienceDetailFullscreen from './components/ExperienceDetailFullscreen';
import ItineraryBuildingAnimation from './components/ItineraryBuildingAnimation';
import ErrorFallback from '../../shared/ErrorFallback';
import { loadEntityData } from '../../core/utils/dataLoader';
import { getZoneVisitate, findItinerarioByZone, getCostiAccessoriItinerario, getExtraSuggeriti, riordinaZoneSecondoItinerario } from '../../core/utils/itinerarioHelpers';
import styles from './TripEditorChat.module.css';

/**
 * Trip Editor Chat - Interfaccia conversazionale per creare viaggi
 * Sostituisce il vecchio trip editor con mappa + blocchi
 */
function TripEditorChat() {
  const location = useLocation();
  const navigate = useNavigate();
  const { messages, isTyping, isProcessing, wizardData, tripData, currentStepId, showItineraryAnimation, navigateToLandingPage, setWizardData, setShowItineraryAnimation, setNavigateToLandingPage, reset, goToStep, clearAllTimeouts } = useTripEditorChatStore();
  const { handleUserResponse } = useChatFlow();
  const [error, setError] = useState(null);
  const [fullscreenExperience, setFullscreenExperience] = useState(null);

  // Cleanup timeout quando il componente smonta
  useEffect(() => {
    return () => {
      console.log('🧹 TripEditorChat unmounting - cleaning up timeouts');
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  // Monitora flag per navigare alla landing page (es. dopo selezione hotel)
  useEffect(() => {
    if (navigateToLandingPage) {
      console.log('🚀 Navigating to landing page with updated trip data');
      // Reset flag
      setNavigateToLandingPage(false);

      // Determina se serve ancora selezione hotel
      const needsHotels = tripData.selectedZones && tripData.selectedZones.length > 0 &&
                         (!tripData.hotels || tripData.hotels.length === 0);

      // NUOVO: Calcola itinerario pre-compilato dal CSV basandosi sulle zone selezionate
      let itinerario = null;
      let costiAccessoriItinerario = [];
      let extraSuggeriti = [];

      const store = useTripEditorChatStore.getState();
      const cachedData = store.cachedData || {};

      // Dati che verranno eventualmente riordinati
      let selectedZones = tripData.selectedZones;
      let filledBlocks = tripData.filledBlocks;

      if (tripData.filledBlocks && tripData.filledBlocks.length > 0) {
        // Estrai zone visitate dai blocchi
        const zoneVisitateFromBlocks = getZoneVisitate(tripData.filledBlocks);
        const codiciZone = zoneVisitateFromBlocks.map(z => z.codice);

        console.log('🔍 Cerca itinerario per zone:', codiciZone);

        // Cerca itinerario matching nel CSV
        itinerario = findItinerarioByZone(codiciZone, cachedData.itinerario || []);

        if (itinerario) {
          console.log('✅ Itinerario trovato:', itinerario.CODICE);

          // RIORDINA zone e blocchi secondo l'ordine ottimale del CSV
          const datiRiordinati = riordinaZoneSecondoItinerario(
            tripData.selectedZones,
            tripData.filledBlocks,
            itinerario,
            cachedData
          );

          selectedZones = datiRiordinati.selectedZones;
          filledBlocks = datiRiordinati.filledBlocks;

          // Carica costi accessori e extra dell'itinerario
          costiAccessoriItinerario = getCostiAccessoriItinerario(
            itinerario,
            cachedData.costi_accessori || []
          );

          extraSuggeriti = getExtraSuggeriti(
            itinerario,
            cachedData.extra || []
          );

          console.log('💰 Costi accessori:', costiAccessoriItinerario.length);
          console.log('✨ Extra suggeriti:', extraSuggeriti.length);
        } else {
          console.log('⚠️ Nessun itinerario pre-compilato per questa combinazione di zone');
        }
      }

      // Costruisci zoneVisitate DOPO il riordino (così usa selectedZones riordinate)
      const zoneVisitate = (selectedZones || []).map(zone => ({
        nome: zone.name,
        code: zone.code,
        giorni: zone.days || zone.daysRecommended || 1
      }));

      // Naviga alla landing page con dati aggiornati (zone e blocchi riordinati)
      navigate('/trip-summary', {
        state: {
          ...tripData,
          selectedZones,    // Zone riordinate secondo CSV
          filledBlocks,     // Blocchi riordinati secondo CSV
          wizardData,
          needsHotelSelection: needsHotels,
          zoneVisitate,     // Zone visitate riordinate
          itinerario,       // Itinerario pre-compilato dal CSV
          costiAccessori: costiAccessoriItinerario,  // Costi accessori dall'itinerario
          extraSuggeriti,   // Extra suggeriti dall'itinerario
          plus: cachedData.extra || []  // Database extra per gli hotel
        }
      });
    }
  }, [navigateToLandingPage, tripData, wizardData, navigate, setNavigateToLandingPage]);

  // Handler completamento animazione itinerario
  const handleAnimationComplete = async () => {
    // Nascondi animazione
    setShowItineraryAnimation(false);
    // Naviga direttamente alla landing page di riepilogo (FUORI DALLA CHAT)
    // Principio: DECISIONI = CHAT, RIEPILOGHI = LANDING PAGE
    setTimeout(async () => {
      // Determina se serve selezione hotel
      const needsHotels = tripData.selectedZones && tripData.selectedZones.length > 0 &&
                         (!tripData.hotels || tripData.hotels.length === 0);

      // NUOVO: Calcola itinerario pre-compilato dal CSV basandosi sulle zone selezionate
      let itinerario = null;
      let costiAccessoriItinerario = [];
      let extraSuggeriti = [];

      const store = useTripEditorChatStore.getState();
      const cachedData = store.cachedData || {};

      // Dati che verranno eventualmente riordinati
      let selectedZones = tripData.selectedZones;
      let filledBlocks = tripData.filledBlocks;

      if (tripData.filledBlocks && tripData.filledBlocks.length > 0) {
        // Estrai zone visitate dai blocchi
        const zoneVisitateFromBlocks = getZoneVisitate(tripData.filledBlocks);
        const codiciZone = zoneVisitateFromBlocks.map(z => z.codice);

        console.log('🔍 Cerca itinerario per zone:', codiciZone);

        // Cerca itinerario matching nel CSV
        itinerario = findItinerarioByZone(codiciZone, cachedData.itinerario || []);

        if (itinerario) {
          console.log('✅ Itinerario trovato:', itinerario.CODICE);

          // RIORDINA zone e blocchi secondo l'ordine ottimale del CSV
          const datiRiordinati = riordinaZoneSecondoItinerario(
            tripData.selectedZones,
            tripData.filledBlocks,
            itinerario,
            cachedData
          );

          selectedZones = datiRiordinati.selectedZones;
          filledBlocks = datiRiordinati.filledBlocks;

          // Carica costi accessori e extra dell'itinerario
          costiAccessoriItinerario = getCostiAccessoriItinerario(
            itinerario,
            cachedData.costi_accessori || []
          );

          extraSuggeriti = getExtraSuggeriti(
            itinerario,
            cachedData.extra || []
          );

          console.log('💰 Costi accessori:', costiAccessoriItinerario.length);
          console.log('✨ Extra suggeriti:', extraSuggeriti.length);
        } else {
          console.log('⚠️ Nessun itinerario pre-compilato per questa combinazione di zone');
        }
      }

      // Costruisci zoneVisitate DOPO il riordino (così usa selectedZones riordinate)
      const zoneVisitate = (selectedZones || []).map(zone => ({
        nome: zone.name,
        code: zone.code,
        giorni: zone.days || zone.daysRecommended || 1
      }));

      navigate('/trip-summary', {
        state: {
          ...tripData,      // Spread di tutti i dati del trip
          selectedZones,    // Zone riordinate secondo CSV
          filledBlocks,     // Blocchi riordinati secondo CSV
          wizardData,       // Aggiungi wizardData separatamente
          needsHotelSelection: needsHotels,  // Flag per mostrare bottone selezione hotel
          zoneVisitate,     // Zone visitate riordinate
          itinerario,       // Itinerario pre-compilato dal CSV
          costiAccessori: costiAccessoriItinerario,  // Costi accessori dall'itinerario
          extraSuggeriti,   // Extra suggeriti dall'itinerario
          plus: cachedData.extra || []  // Database extra per gli hotel
        }
      });
    }, 300); // Manteniamo 300ms qui per transizione fluida
  };

  // Carica dati wizard da navigation state e inizializza conversazione
  useEffect(() => {
    const wizardData = location.state?.wizardData;
    const initialStep = location.state?.initialStep; // Step iniziale da cui partire (es. 'hotels')
    const existingTripData = location.state?.tripData; // Dati trip esistenti se ritorniamo dalla landing

    if (!wizardData) {
      console.error('❌ Nessun dato wizard trovato in navigation state');
      setError({
        icon: '🧭',
        title: 'Dati wizard mancanti',
        message: 'Non sono stati trovati i dati del wizard',
        description: 'Torna al wizard per iniziare un nuovo viaggio',
        actionPath: '/create',
        actionLabel: 'Vai al Wizard'
      });
      return;
    }

    console.log('📥 Wizard data ricevuto:', wizardData);
    console.log('📥 Initial step:', initialStep);
    console.log('📥 Existing trip data:', existingTripData);

    // Se torniamo dalla landing page con existingTripData, NON fare reset completo
    // Il reset cancellerebbe il cachedData necessario per lo step hotels
    if (!initialStep || !existingTripData) {
      // Reset completo solo per nuove chat
      reset();
    }

    // Setta wizard data
    setWizardData(wizardData);

    // Se ci sono dati trip esistenti, ripristinali (utile quando si torna dalla landing per selezionare hotel)
    if (existingTripData) {
      const store = useTripEditorChatStore.getState();
      // Ripristina selectedZones, filledBlocks, etc.
      if (existingTripData.selectedZones) {
        existingTripData.selectedZones.forEach(zone => store.addZone(zone));
      }
      if (existingTripData.filledBlocks) {
        existingTripData.filledBlocks.forEach(block => {
          if (block.experience) {
            store.addExperience(block.zona, block.experience);
          }
        });
      }
      if (existingTripData.totalDays) {
        store.tripData.totalDays = existingTripData.totalDays;
      }
    }

    // IMPORTANTE: Forza riavvio del flow facendo un cambio di step
    // Se c'è un initialStep, verifica prima che cachedData sia caricato
    setTimeout(async () => {
      const store = useTripEditorChatStore.getState();

      // Se viene richiesto uno step specifico ma cachedData è vuoto, carica i dati prima
      const needsDataLoading = initialStep &&
                              (!store.cachedData || !store.cachedData.hotel || !store.cachedData.esperienze);

      if (needsDataLoading) {
        console.log('⚠️ CachedData vuoto, carico dati prima di andare a', initialStep);
        // Carica i dati necessari
        try {
          const [zone, esperienze, hotel, itinerario, extra, costi] = await Promise.all([
            loadEntityData('zone', true),
            loadEntityData('esperienze', true),
            loadEntityData('hotel', true),
            loadEntityData('itinerario', false),
            loadEntityData('extra', false),
            loadEntityData('costi_accessori', false)
          ]);

          // Salva nel cachedData
          store.setCachedData('zone', zone);
          store.setCachedData('esperienze', esperienze);
          store.setCachedData('hotel', hotel);
          store.setCachedData('itinerario', itinerario);
          store.setCachedData('extra', extra);
          store.setCachedData('costi_accessori', costi);

          console.log('✅ Dati caricati, procedo a step:', initialStep);
          store.goToStep(initialStep);
        } catch (error) {
          console.error('❌ Errore nel caricamento dati:', error);
          // Fallback: vai a welcome che gestirà il caricamento
          store.goToStep('welcome');
        }
      } else {
        // CachedData esiste o non è richiesto initialStep, procedi normalmente
        store.goToStep(initialStep || 'welcome');
      }
    }, 100);
  }, [location.state, setWizardData, reset]);

  // Handler selezione opzione
  const handleOptionSelect = (value) => {
    console.log('🔘 Option selected:', value);
    handleUserResponse(value);
  };

  // Handler selezione card
  const handleCardSelect = (cardData) => {
    console.log('🎴 Card selected:', cardData);
    handleUserResponse(cardData);
  };

  // Handler apertura dettagli esperienza (fullscreen)
  const handleCardDetails = (cardData) => {
    console.log('👀 Card details requested:', cardData);
    // cardData dovrebbe contenere l'esperienza completa
    // Per ora apriamo il fullscreen con i dati della card
    setFullscreenExperience(cardData);
  };

  // Handler like esperienza dal fullscreen
  const handleExperienceLike = (experience) => {
    console.log('❤️ Experience liked:', experience);
    // Chiudi fullscreen
    setFullscreenExperience(null);
    // Passa al flow come selezione
    handleUserResponse({ action: 'select', experienceId: experience.id, ...experience });
  };

  // Handler dislike esperienza dal fullscreen
  const handleExperienceDislike = (experience) => {
    console.log('👎 Experience disliked:', experience);
    // Chiudi fullscreen
    setFullscreenExperience(null);
    // Passa al flow come dislike
    handleUserResponse({ action: 'dislike', experienceId: experience.id, ...experience });
  };

  // Error fallback
  if (error) {
    return <ErrorFallback error={error} />;
  }

  return (
    <div className={styles.tripEditorChat}>
      <ChatHeader
        wizardData={wizardData}
        currentStep={currentStepId}
        tripData={tripData}
      />

      <ChatContainer
        messages={messages}
        isTyping={isTyping}
        isProcessing={isProcessing}
        onOptionSelect={handleOptionSelect}
        onCardSelect={handleCardSelect}
        onCardDetails={handleCardDetails}
      />

      {/* Fullscreen Experience Detail */}
      {fullscreenExperience && (
        <ExperienceDetailFullscreen
          experience={fullscreenExperience}
          onLike={handleExperienceLike}
          onDislike={handleExperienceDislike}
          onClose={() => setFullscreenExperience(null)}
        />
      )}

      {/* Animazione creazione itinerario */}
      {showItineraryAnimation && (
        <ItineraryBuildingAnimation
          tripData={tripData}
          onComplete={handleAnimationComplete}
        />
      )}

      <Toaster
        position="top-right"
        richColors
        duration={3000}
        closeButton
      />
    </div>
  );
}

export default TripEditorChat;
