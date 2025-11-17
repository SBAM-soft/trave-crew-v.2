import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Zustand store for wizard state management
 *
 * Benefits:
 * - Eliminates props drilling (no more passing wizardData through components)
 * - Centralized state management
 * - Automatic localStorage persistence
 * - Better performance (no unnecessary re-renders)
 *
 * Usage:
 * const { destinazione, setDestinazione, resetWizard } = useWizardStore();
 */
const useWizardStore = create(
  persist(
    (set, get) => ({
      // Step 1: Destinazione
      destinazione: '',
      destinazioneNome: '',

      // Step 2: Numero Persone
      numeroPersone: 1,
      tipoViaggio: 'privato',
      etaRange: [],
      genere: 'misto',

      // Step 3: Budget
      budget: '',

      // Step 4: Interessi
      interessi: [],

      // Step 5: Data Partenza
      dataPartenza: '',
      numeroNotti: null, // Numero di notti desiderate per il viaggio

      // Current wizard step
      currentStep: 1,

      // Actions
      setDestinazione: (codice, nome) =>
        set({ destinazione: codice, destinazioneNome: nome }),

      setNumeroPersone: (numero) => set({ numeroPersone: numero }),

      setTipoViaggio: (tipo) => set({ tipoViaggio: tipo }),

      setEtaRange: (range) => set({ etaRange: range }),

      setGenere: (genere) => set({ genere: genere }),

      setBudget: (budget) => set({ budget }),

      setInteressi: (interessi) => set({ interessi }),

      setDataPartenza: (data) => set({ dataPartenza: data }),

      setNumeroNotti: (notti) => set({ numeroNotti: notti }),

      setCurrentStep: (step) => set({ currentStep: step }),

      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),

      previousStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),

      // Reset wizard to initial state
      resetWizard: () =>
        set({
          destinazione: '',
          destinazioneNome: '',
          numeroPersone: 1,
          tipoViaggio: 'privato',
          etaRange: [],
          genere: 'misto',
          budget: '',
          interessi: [],
          dataPartenza: '',
          numeroNotti: null,
          currentStep: 1,
        }),

      // Get all wizard data (useful for navigation)
      getWizardData: () => {
        const state = get();
        return {
          destinazione: state.destinazione,
          destinazioneNome: state.destinazioneNome,
          numeroPersone: state.numeroPersone,
          tipoViaggio: state.tipoViaggio,
          etaRange: state.etaRange,
          genere: state.genere,
          budget: state.budget,
          interessi: state.interessi,
          dataPartenza: state.dataPartenza,
          numeroNotti: state.numeroNotti,
        };
      },
    }),
    {
      name: 'wizard-storage', // localStorage key
      partialize: (state) => ({
        // Only persist these fields (not actions)
        destinazione: state.destinazione,
        destinazioneNome: state.destinazioneNome,
        numeroPersone: state.numeroPersone,
        tipoViaggio: state.tipoViaggio,
        etaRange: state.etaRange,
        genere: state.genere,
        budget: state.budget,
        interessi: state.interessi,
        dataPartenza: state.dataPartenza,
        numeroNotti: state.numeroNotti,
        currentStep: state.currentStep,
      }),
    }
  )
);

export default useWizardStore;
