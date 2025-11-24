import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
  const { messages, isTyping, isProcessing, wizardData, tripData, currentStepId, showItineraryAnimation, setWizardData, setShowItineraryAnimation, reset, goToStep, clearAllTimeouts } = useTripEditorChatStore();
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

  // Handler completamento animazione itinerario
  const handleAnimationComplete = () => {
    // Nascondi animazione
    setShowItineraryAnimation(false);
    // Vai allo step summary (usa delay corto per transizione fluida)
    setTimeout(() => {
      goToStep('summary_before_hotels');
    }, 300); // Manteniamo 300ms qui per sincronizzazione con animazione
  };

  // Carica dati wizard da navigation state e inizializza conversazione
  useEffect(() => {
    const wizardData = location.state?.wizardData;

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

    // Reset completo (pulisce tutto)
    reset();

    // Setta wizard data
    setWizardData(wizardData);

    // IMPORTANTE: Forza riavvio del flow facendo un cambio di step
    // Vai temporaneamente a null e poi torna a welcome per far scattare l'useEffect
    setTimeout(() => {
      const store = useTripEditorChatStore.getState();
      store.goToStep('welcome');
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
