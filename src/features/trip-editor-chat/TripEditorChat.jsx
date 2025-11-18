import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import useTripEditorChatStore from './store/useTripEditorChatStore';
import useChatFlow from './hooks/useChatFlow';
import ChatContainer from './components/ChatContainer';
import styles from './TripEditorChat.module.css';

/**
 * Trip Editor Chat - Interfaccia conversazionale per creare viaggi
 * Sostituisce il vecchio trip editor con mappa + blocchi
 */
function TripEditorChat() {
  const location = useLocation();
  const { messages, isTyping, setWizardData, reset } = useTripEditorChatStore();
  const { handleUserResponse } = useChatFlow();

  // Carica dati wizard da navigation state
  useEffect(() => {
    const wizardData = location.state?.wizardData;

    if (!wizardData) {
      console.error('❌ Nessun dato wizard trovato in navigation state');
      return;
    }

    console.log('📥 Wizard data ricevuto:', wizardData);

    // Salva wizard data nello store
    setWizardData(wizardData);

    // Reset conversazione (rimuove messaggi vecchi)
    // Ma mantiene wizardData appena settato
    const currentWizardData = wizardData;
    reset();
    setWizardData(currentWizardData);
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
      {/* TODO: ChatSummary sidebar */}
      {/* <ChatSummary /> */}

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
