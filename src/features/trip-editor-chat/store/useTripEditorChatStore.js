import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { getLastDay, prepareExperienceBlocks, isZoneChange, getPreviousZoneName } from '../../../core/services/tripBuilderService';
import { ANIMATION, HOTEL_TIER_PRICES } from '../../../core/constants';

/**
 * CONSTANTS
 */
const MAX_MESSAGES = 50; // Limite messaggi per prevenire memory leak

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
        isProcessing: false, // Flag per prevenire azioni multiple durante operazioni async
        timeoutIds: [], // Array per tracciare setTimeout e permettere cleanup

        addMessage: (message) => set((state) => {
          const newMessage = {
            ...message,
            id: `msg-${Date.now()}-${Math.random()}`,
            timestamp: new Date()
          };

          // Mantieni solo gli ultimi MAX_MESSAGES messaggi per prevenire memory leak
          const updatedMessages = [...state.messages, newMessage];
          if (updatedMessages.length > MAX_MESSAGES) {
            console.log(`⚠️ Limite messaggi raggiunto (${MAX_MESSAGES}), rimuovo i più vecchi`);
            return { messages: updatedMessages.slice(-MAX_MESSAGES) };
          }

          return { messages: updatedMessages };
        }),

        addBotMessage: (content, type = 'bot', data = null) => {
          set({ isTyping: true });
          const timeoutId = setTimeout(() => {
            get().addMessage({ type, content, data, sender: 'bot' });
            set({ isTyping: false });
            // Rimuovi timeout dall'array dopo l'esecuzione
            set((state) => ({
              timeoutIds: state.timeoutIds.filter(id => id !== timeoutId)
            }));
          }, ANIMATION.TYPING_DELAY_MIN + Math.random() * (ANIMATION.TYPING_DELAY_MAX - ANIMATION.TYPING_DELAY_MIN));
          // Aggiungi timeout all'array per cleanup
          set((state) => ({
            timeoutIds: [...state.timeoutIds, timeoutId]
          }));
        },

        addUserMessage: (content, selectedData) => {
          get().addMessage({
            type: 'user',
            content,
            data: selectedData,
            sender: 'user'
          });
        },

        clearMessages: () => {
          console.log('🧹 Pulizia messaggi chat');
          set({ messages: [] });
        },

        setProcessing: (isProcessing) => set({ isProcessing }),

        // Cleanup tutti i timeout pendenti
        clearAllTimeouts: () => {
          const state = get();
          console.log(`🧹 Cancellazione ${state.timeoutIds.length} timeout pendenti`);
          state.timeoutIds.forEach(timeoutId => clearTimeout(timeoutId));
          set({ timeoutIds: [] });
        },

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

        // ===== ANIMAZIONE ITINERARIO =====
        showItineraryAnimation: false,

        setShowItineraryAnimation: (show) => set({ showItineraryAnimation: show }),

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

          // Usa tripBuilderService per calcolare lastDay e verificare cambio zona
          const lastDay = getLastDay(state.tripData.filledBlocks);
          const hasZoneChange = isZoneChange(state.tripData.filledBlocks, zoneCode);
          const previousZone = hasZoneChange ? getPreviousZoneName(state.tripData.filledBlocks) : null;

          // Prepara blocchi usando service
          const newBlocks = prepareExperienceBlocks(
            experiences,
            packageData,
            zoneCode,
            zoneName,
            lastDay + 1,
            hasZoneChange,
            previousZone
          );

          return {
            tripData: {
              ...state.tripData,
              filledBlocks: [...state.tripData.filledBlocks, ...newBlocks]
            }
          };
        }),

        // Aggiunge una singola esperienza (per il nuovo flow swipe)
        addExperience: (zoneCode, experience) => set((state) => {
          const zone = state.tripData.selectedZones.find(z => z.code === zoneCode);
          const zoneName = zone?.name || experience.ZONA || 'Zona';

          // Usa tripBuilderService per calcolare lastDay e verificare cambio zona
          const lastDay = getLastDay(state.tripData.filledBlocks);
          const hasZoneChange = isZoneChange(state.tripData.filledBlocks, zoneCode);
          const previousZone = hasZoneChange ? getPreviousZoneName(state.tripData.filledBlocks) : null;

          // Crea il blocco per l'esperienza singola
          const newBlock = {
            day: lastDay + 1,
            zoneCode,
            zoneName,
            experience: {
              codice: experience.code || experience.id,
              nome: experience.nome,
              descrizione: experience.descrizione,
              descrizioneEstesa: experience.descrizioneEstesa,
              prezzo: experience.prezzo,
              durata: experience.durata,
              tipo: experience.tipo,
              difficolta: experience.difficolta,
              emoji: experience.emoji,
              immagini: experience.immagini,
              highlights: experience.highlights,
              incluso: experience.incluso,
              nonIncluso: experience.nonIncluso,
              note: experience.note,
              slot: experience.slot,
              rating: experience.rating
            },
            hasZoneChange,
            previousZone
          };

          return {
            tripData: {
              ...state.tripData,
              filledBlocks: [...state.tripData.filledBlocks, newBlock]
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
            const expCost = parseFloat(block.experience?.PRX_PAX || block.experience?.prezzo || 0);
            const extrasCost = (block.extras || []).reduce((s, e) =>
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
            return sum + (hotel.extras || []).reduce((s, e) =>
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

        reset: () => {
          // Cancella tutti i timeout prima del reset
          get().clearAllTimeouts();
          set({
            messages: [],
            isTyping: false,
            isProcessing: false,
            timeoutIds: [],
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
          });
        }
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
  return HOTEL_TIER_PRICES[tier?.toUpperCase()] || HOTEL_TIER_PRICES.MEDIUM;
}

export default useTripEditorChatStore;
