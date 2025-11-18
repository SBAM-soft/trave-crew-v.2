import { useEffect, useCallback } from 'react';
import useTripEditorChatStore from '../store/useTripEditorChatStore';
import CHAT_FLOW_CONFIG from '../config/chatFlowConfig';

/**
 * Hook per gestire il flow conversazionale
 * Esegue onEnter quando cambia step, gestisce risposte utente
 */
function useChatFlow() {
  const store = useTripEditorChatStore();
  const {
    currentStepId,
    goToStep,
    addBotMessage,
    addUserMessage,
    tripData,
    wizardData,
    setTotalDays,
    addZone,
    removeZone,
    addPackage,
    selectHotel,
    calculateCosts,
    incrementCounter
  } = store;

  // Ottieni configurazione step corrente
  const currentStep = CHAT_FLOW_CONFIG[currentStepId];

  // Esegui onEnter quando cambia step
  useEffect(() => {
    if (!currentStep || !currentStep.onEnter) return;

    console.log(`📍 Step ${currentStepId} - Executing onEnter...`);

    // Prepara context per onEnter
    const context = {
      addBotMessage,
      addUserMessage,
      getMessage: currentStep.getMessage || (() => ''),
      tripData,
      wizardData,
      store,
      goToStep,
      setTotalDays,
      addZone,
      removeZone
    };

    // Esegui onEnter
    currentStep.onEnter(context);
  }, [currentStepId]); // Solo quando cambia step

  // Handler per risposta utente (selezione opzione/card)
  const handleUserResponse = useCallback((value) => {
    if (!currentStep || !currentStep.onResponse) {
      console.warn(`⚠️ No onResponse handler for step ${currentStepId}`);
      return;
    }

    console.log(`💬 User response in step ${currentStepId}:`, value);

    // Prepara context per onResponse
    const context = {
      value,
      addBotMessage,
      addUserMessage,
      goToStep,
      tripData,
      wizardData,
      store,
      setTotalDays,
      addZone,
      removeZone,
      addPackage,
      selectHotel,
      calculateCosts,
      incrementCounter
    };

    // Esegui onResponse
    currentStep.onResponse(context);
  }, [currentStepId, currentStep, store]);

  return {
    currentStepId,
    currentStep,
    handleUserResponse,
    goToStep
  };
}

export default useChatFlow;
