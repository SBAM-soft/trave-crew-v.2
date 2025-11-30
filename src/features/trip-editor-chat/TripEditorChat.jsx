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
      // Naviga alla landing page con dati aggiornati
      navigate('/trip-summary', {
        state: {
          ...tripData,
          wizardData
        }
      });
    }
  }, [navigateToLandingPage, tripData, wizardData, navigate, setNavigateToLandingPage]);

  // Handler completamento animazione itinerario
  const handleAnimationComplete = () => {
    // Nascondi animazione
    setShowItineraryAnimation(false);
    // Naviga direttamente alla landing page di riepilogo (FUORI DALLA CHAT)
    // Principio: DECISIONI = CHAT, RIEPILOGHI = LANDING PAGE
    setTimeout(() => {
      navigate('/trip-summary', {
        state: {
          ...tripData,      // Spread di tutti i dati del trip (filledBlocks, totalDays, etc.)
          wizardData        // Aggiungi wizardData separatamente
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

    // Reset completo (pulisce tutto)
    reset();

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
    // Se c'è un initialStep, vai lì; altrimenti vai a 'welcome'
    setTimeout(() => {
      const store = useTripEditorChatStore.getState();
      store.goToStep(initialStep || 'welcome');
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
