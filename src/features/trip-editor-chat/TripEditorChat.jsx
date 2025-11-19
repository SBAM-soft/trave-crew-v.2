import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import useTripEditorChatStore from './store/useTripEditorChatStore';
import useChatFlow from './hooks/useChatFlow';
import ChatContainer from './components/ChatContainer';
import ChatHeader from './components/ChatHeader';
import styles from './TripEditorChat.module.css';

/**
 * Trip Editor Chat - Interfaccia conversazionale per creare viaggi
 * Sostituisce il vecchio trip editor con mappa + blocchi
 */
function TripEditorChat() {
  const location = useLocation();
  const { messages, isTyping, wizardData, tripData, currentStepId, setWizardData, reset } = useTripEditorChatStore();
  const { handleUserResponse } = useChatFlow();

  // Carica dati wizard da navigation state e inizializza conversazione
  useEffect(() => {
    const wizardData = location.state?.wizardData;

    if (!wizardData) {
      console.error('❌ Nessun dato wizard trovato in navigation state');
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
        onOptionSelect={handleOptionSelect}
        onCardSelect={handleCardSelect}
      />

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
