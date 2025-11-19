import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Zustand Store per Trip Editor Chat
 * Gestisce tutto lo state del flow conversazionale
 */
const useTripEditorChatStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ===== CONVERSAZIONE =====
        messages: [],
        isTyping: false,

        addMessage: (message) => set((state) => ({
          messages: [...state.messages, {
            ...message,
            id: `msg-${Date.now()}-${Math.random()}`,
            timestamp: new Date()
          }]
        })),

        addBotMessage: (content, type = 'bot', data = null) => {
          set({ isTyping: true });
          setTimeout(() => {
            get().addMessage({ type, content, data, sender: 'bot' });
            set({ isTyping: false });
          }, 300 + Math.random() * 200); // Delay più veloce 300-500ms
        },

        addUserMessage: (content, selectedData) => {
          get().addMessage({
            type: 'user',
            content,
            data: selectedData,
            sender: 'user'
          });
        },

        clearMessages: () => set({ messages: [] }),

        // ===== FLOW CONTROL =====
        currentStepId: null, // Inizia null, viene settato dopo il caricamento wizardData
        stepHistory: [],

        goToStep: (stepId) => set((state) => ({
          currentStepId: stepId,
          stepHistory: [...state.stepHistory, state.currentStepId]
        })),

        goBack: () => set((state) => {
          if (state.stepHistory.length === 0) return state;
          const previousStep = state.stepHistory[state.stepHistory.length - 1];
          return {
            currentStepId: previousStep,
            stepHistory: state.stepHistory.slice(0, -1)
          };
        }),

        // ===== DATI VIAGGIO =====
        wizardData: {}, // Popolato da navigation state

        tripData: {
          totalDays: null,
          selectedZones: [], // [{ code, name, days, order }]
          filledBlocks: [], // [{ day, zone, package, experience, extras }]
          hotels: [], // [{ zona, tier, notti, extras, note }]
          costs: {
            experiences: 0,
            hotels: 0,
            hotelExtras: 0,
            accessories: 0,
            total: 0
          }
        },

        // ===== DATABASE CACHE =====
        // Cache per dati caricati da CSV (evita reload ripetuti)
        cachedData: {
          destinazioni: [],
          zone: [],
          pacchetti: [],
          esperienze: [],
          hotel: [],
          itinerario: [],
          extra: [],
          costi_accessori: []
        },

        setCachedData: (key, data) => set((state) => ({
          cachedData: { ...state.cachedData, [key]: data }
        })),

        // ===== CONTATORE ZONE (logica progressiva) =====
        availableCounter: 1, // Inizia da 1 (zone priorità 1)

        incrementCounter: () => set((state) => ({
          availableCounter: state.availableCounter + 1
        })),

        resetCounter: () => set({ availableCounter: 1 }),

        // ===== ACTIONS DATI VIAGGIO =====
        setWizardData: (data) => set({ wizardData: data }),

        setTotalDays: (days) => set((state) => ({
          tripData: { ...state.tripData, totalDays: days }
        })),

        addZone: (zone) => set((state) => {
          // Verifica se zona già presente
          const exists = state.tripData.selectedZones.some(z => z.code === zone.code);
          if (exists) return state;

          return {
            tripData: {
              ...state.tripData,
              selectedZones: [...state.tripData.selectedZones, {
                ...zone,
                order: state.tripData.selectedZones.length + 1
              }]
            }
          };
        }),

        removeZone: (zoneCode) => set((state) => ({
          tripData: {
            ...state.tripData,
            selectedZones: state.tripData.selectedZones
              .filter(z => z.code !== zoneCode)
              // Ricalcola order
              .map((z, idx) => ({ ...z, order: idx + 1 }))
          }
        })),

        addPackage: (zoneCode, packageData, experiences) => set((state) => {
          const zone = state.tripData.selectedZones.find(z => z.code === zoneCode);
          const zoneName = zone?.name || packageData.ZONA;

          // Calcola giorno iniziale
          const lastDay = state.tripData.filledBlocks.length > 0
            ? Math.max(...state.tripData.filledBlocks.map(b => b.day))
            : 1; // Giorno 1 è arrivo

          let currentDay = lastDay + 1;

          // Aggiungi blocchi esperienze
          const newBlocks = experiences.map((exp) => {
            const block = {
              day: currentDay,
              zone: zoneName,
              zoneCode: zoneCode,
              package: packageData,
              experience: exp,
              extras: []
            };
            currentDay++;
            return block;
          });

          return {
            tripData: {
              ...state.tripData,
              filledBlocks: [...state.tripData.filledBlocks, ...newBlocks]
            }
          };
        }),

        removeBlock: (dayNumber) => set((state) => ({
          tripData: {
            ...state.tripData,
            filledBlocks: state.tripData.filledBlocks.filter(b => b.day !== dayNumber)
          }
        })),

        selectHotel: (zona, tier, notti, extras = [], note = '') => set((state) => {
          const hotelIndex = state.tripData.hotels.findIndex(h => h.zona === zona);
          const newHotel = { zona, tier, notti, extras, note };

          const updatedHotels = hotelIndex >= 0
            ? state.tripData.hotels.map((h, i) => i === hotelIndex ? newHotel : h)
            : [...state.tripData.hotels, newHotel];

          return {
            tripData: {
              ...state.tripData,
              hotels: updatedHotels
            }
          };
        }),

        calculateCosts: () => set((state) => {
          const { filledBlocks, hotels } = state.tripData;
          const { numeroPersone = 2 } = state.wizardData;

          // Costi esperienze
          const experiencesCost = filledBlocks.reduce((sum, block) => {
            const expCost = parseFloat(block.experience.PRX_PAX || block.experience.prezzo || 0);
            const extrasCost = block.extras.reduce((s, e) =>
              s + (parseFloat(e.PREZZO_PP || e.prezzo || 0)), 0
            );
            return sum + expCost + extrasCost;
          }, 0) * numeroPersone;

          // Costi hotel base
          const hotelsCost = hotels.reduce((sum, hotel) => {
            const tierPrice = getTierPriceFromBudget(hotel.tier);
            return sum + (tierPrice * hotel.notti * numeroPersone);
          }, 0);

          // Extra hotel
          const hotelExtrasCost = hotels.reduce((sum, hotel) => {
            return sum + hotel.extras.reduce((s, e) =>
              s + (parseFloat(e.PREZZO_PP || e.prezzo || 0) * hotel.notti * numeroPersone), 0
            );
          }, 0);

          // Accessori (stimato - TODO: calcolare da CSV costi_accessori)
          const accessoriesCost = 180 * numeroPersone;

          const total = experiencesCost + hotelsCost + hotelExtrasCost + accessoriesCost;

          return {
            tripData: {
              ...state.tripData,
              costs: {
                experiences: experiencesCost,
                hotels: hotelsCost,
                hotelExtras: hotelExtrasCost,
                accessories: accessoriesCost,
                total
              }
            }
          };
        }),

        // ===== UTILITÀ =====
        getProgress: () => {
          const state = get();
          const steps = ['welcome', 'duration', 'zones', 'packages', 'summary_before_hotels', 'hotels', 'final_summary'];
          const currentIndex = steps.indexOf(state.currentStepId);
          return {
            current: currentIndex >= 0 ? currentIndex + 1 : 1,
            total: steps.length
          };
        },

        getDaysRemaining: () => {
          const state = get();
          const { totalDays, filledBlocks } = state.tripData;
          if (!totalDays) return 0;
          // -1 per giorno arrivo, -1 per giorno partenza
          return totalDays - 2 - filledBlocks.length;
        },

        reset: () => set({
          messages: [],
          isTyping: false,
          currentStepId: null, // Inizia da null per permettere riattivazione
          stepHistory: [],
          wizardData: {},
          availableCounter: 1,
          tripData: {
            totalDays: null,
            selectedZones: [],
            filledBlocks: [],
            hotels: [],
            costs: { experiences: 0, hotels: 0, hotelExtras: 0, accessories: 0, total: 0 }
          }
        })
      }),
      {
        name: 'trip-editor-chat-storage',
        partialize: (state) => ({
          // Salva solo dati essenziali, non messaggi né step corrente
          // currentStepId non viene salvato perché vogliamo sempre ripartire dall'inizio
          wizardData: state.wizardData,
          tripData: state.tripData,
          availableCounter: state.availableCounter
        })
      }
    ),
    { name: 'TripEditorChat' }
  )
);

// Helper functions
function getTierPriceFromBudget(tier) {
  const prices = {
    low: 40,
    medium: 75,
    high: 150,
    luxury: 150
  };
  return prices[tier?.toLowerCase()] || 75;
}

export default useTripEditorChatStore;
