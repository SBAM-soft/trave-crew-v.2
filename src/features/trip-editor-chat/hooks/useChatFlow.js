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

    // Prepara context per onEnter - leggi tripData e wizardData freschi dallo store
    const context = {
      addBotMessage,
      addUserMessage,
      getMessage: currentStep.getMessage || (() => ''),
      tripData: store.tripData,  // Leggi dal store invece della closure per evitare stale data
      wizardData: store.wizardData,  // Leggi dal store invece della closure per evitare stale data
      store,
      goToStep,
      setTotalDays,
      addZone,
      removeZone
    };

    // Esegui onEnter
    if (typeof currentStep.onEnter === 'function') {
      currentStep.onEnter(context);
    }
  }, [currentStepId, currentStep, addBotMessage, addUserMessage, store, goToStep, setTotalDays, addZone, removeZone]); // Stable dependencies only (tripData and wizardData excluded to avoid loops)

  // Handler per risposta utente (selezione opzione/card)
  const handleUserResponse = useCallback((value) => {
    if (!currentStep || !currentStep.onResponse) {
      console.warn(`⚠️ No onResponse handler for step ${currentStepId}`);
      return;
    }

    console.log(`💬 User response in step ${currentStepId}:`, value);

    // Prepara context per onResponse - leggi tripData e wizardData freschi dallo store
    const context = {
      value,
      addBotMessage,
      addUserMessage,
      goToStep,
      tripData: store.tripData,  // Leggi dal store invece della closure per evitare stale data
      wizardData: store.wizardData,  // Leggi dal store invece della closure per evitare stale data
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
    if (typeof currentStep.onResponse === 'function') {
      currentStep.onResponse(context);
    }
  }, [currentStepId, currentStep, addBotMessage, addUserMessage, goToStep, store, setTotalDays, addZone, removeZone, addPackage, selectHotel, calculateCosts, incrementCounter]); // Stable dependencies only (tripData and wizardData excluded to avoid loops)

  return {
    currentStepId,
    currentStep,
    handleUserResponse,
    goToStep
  };
}

export default useChatFlow;
