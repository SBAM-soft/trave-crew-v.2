import { useEffect, useCallback, useRef } from 'react';
import useTripEditorChatStore from '../store/useTripEditorChatStore';
import CHAT_FLOW_CONFIG from '../config/chatFlowConfig';

/**
 * Hook per gestire il flow conversazionale
 * Esegue onEnter quando cambia step, gestisce risposte utente
 */
function useChatFlow() {
  // Usa selettori per ottenere solo ciò che serve ed evitare re-render inutili
  const currentStepId = useTripEditorChatStore(state => state.currentStepId);
  const goToStep = useTripEditorChatStore(state => state.goToStep);

  // Ottieni lo store completo solo per passarlo al context
  const store = useTripEditorChatStore();

  // Estrai le funzioni dallo store - sono stabili in Zustand
  const {
    addBotMessage,
    addUserMessage,
    setTotalDays,
    addZone,
    removeZone,
    addPackage,
    selectHotel,
    calculateCosts,
    incrementCounter
  } = store;

  // Ref per tracciare l'ultimo step eseguito e prevenire esecuzioni multiple
  const lastExecutedStepRef = useRef(null);

  // Ottieni configurazione step corrente
  const currentStep = CHAT_FLOW_CONFIG[currentStepId];

  // Esegui onEnter quando cambia step
  useEffect(() => {
    if (!currentStep || !currentStep.onEnter || !currentStepId) return;

    // Previeni esecuzioni multiple dello stesso step
    if (lastExecutedStepRef.current === currentStepId) {
      console.log(`⏭️ Step ${currentStepId} - Already executed, skipping...`);
      return;
    }

    console.log(`📍 Step ${currentStepId} - Executing onEnter...`);
    lastExecutedStepRef.current = currentStepId;

    // Prepara context per onEnter - usa lo store per funzioni stabili
    const context = {
      addBotMessage: store.addBotMessage,
      addUserMessage: store.addUserMessage,
      getMessage: currentStep.getMessage || (() => ''),
      tripData: store.tripData,  // Leggi dal store invece della closure per evitare stale data
      wizardData: store.wizardData,  // Leggi dal store invece della closure per evitare stale data
      store,
      goToStep: store.goToStep,
      setTotalDays: store.setTotalDays,
      addZone: store.addZone,
      removeZone: store.removeZone,
      addPackage: store.addPackage,
      selectHotel: store.selectHotel,
      calculateCosts: store.calculateCosts,
      incrementCounter: store.incrementCounter
    };

    // Esegui onEnter
    if (typeof currentStep.onEnter === 'function') {
      currentStep.onEnter(context);
    }
  }, [currentStepId]); // Solo currentStepId come dipendenza - tutte le funzioni vengono prese dallo store

  // Handler per risposta utente (selezione opzione/card)
  const handleUserResponse = useCallback((value) => {
    const step = CHAT_FLOW_CONFIG[currentStepId];

    if (!step || !step.onResponse) {
      console.warn(`⚠️ No onResponse handler for step ${currentStepId}`);
      return;
    }

    console.log(`💬 User response in step ${currentStepId}:`, value);

    // Ottieni riferimento fresco allo store
    const storeState = useTripEditorChatStore.getState();

    // Prepara context per onResponse - usa lo store per funzioni stabili
    const context = {
      value,
      addBotMessage: storeState.addBotMessage,
      addUserMessage: storeState.addUserMessage,
      goToStep: storeState.goToStep,
      tripData: storeState.tripData,
      wizardData: storeState.wizardData,
      store: storeState,
      setTotalDays: storeState.setTotalDays,
      addZone: storeState.addZone,
      removeZone: storeState.removeZone,
      addPackage: storeState.addPackage,
      selectHotel: storeState.selectHotel,
      calculateCosts: storeState.calculateCosts,
      incrementCounter: storeState.incrementCounter
    };

    // Esegui onResponse
    if (typeof step.onResponse === 'function') {
      step.onResponse(context);
    }
  }, [currentStepId]); // Solo currentStepId come dipendenza

  return {
    currentStepId,
    currentStep,
    handleUserResponse,
    goToStep
  };
}

export default useChatFlow;
