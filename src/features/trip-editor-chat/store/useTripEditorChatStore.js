import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { getLastDay, prepareExperienceBlocks, isZoneChange, getPreviousZoneName } from '../../../core/services/tripBuilderService';
import { ANIMATION, HOTEL_TIER_PRICES, BLOCK_TYPE } from '../../../core/constants';

/**
 * CONSTANTS
 */
const MAX_MESSAGES = 50; // Limite messaggi per prevenire memory leak
const CACHE_VALIDITY_HOURS = 24; // Cache CSV valida per 24 ore

// Delay constants per setTimeout (evita magic numbers)
export const DELAY_INSTANT = 100;   // 100ms - Transizioni immediate
export const DELAY_SHORT = 300;     // 300ms - Animazioni veloci
export const DELAY_MEDIUM = 500;    // 500ms - Delay standard
export const DELAY_NORMAL = 600;    // 600ms - Pausa naturale
export const DELAY_LONG = 800;      // 800ms - Pausa con suspense
export const DELAY_EXTENDED = 1000; // 1000ms - Pausa lunga

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
        cacheTimestamp: null, // Timestamp ultimo caricamento cache

        setCachedData: (key, data) => {
          const now = Date.now();
          set((state) => ({
            cachedData: { ...state.cachedData, [key]: data },
            cacheTimestamp: now // Aggiorna timestamp
          }));
          console.log(`📦 Cache aggiornata: ${key} (${data.length} items) - timestamp: ${new Date(now).toISOString()}`);
        },

        // Verifica se la cache è ancora valida
        isCacheValid: () => {
          const state = get();
          if (!state.cacheTimestamp) return false;

          const ageHours = (Date.now() - state.cacheTimestamp) / (1000 * 60 * 60);
          const isValid = ageHours < CACHE_VALIDITY_HOURS;

          if (!isValid) {
            console.log(`⚠️ Cache scaduta (${ageHours.toFixed(1)} ore > ${CACHE_VALIDITY_HOURS} ore)`);
          }

          return isValid;
        },

        // Invalida manualmente la cache
        invalidateCache: () => {
          console.log('🗑️ Invalidazione cache CSV');
          set({
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
            cacheTimestamp: null
          });
        },

        // ===== CONTATORE ZONE (logica progressiva) =====
        availableCounter: 1, // Inizia da 1 (zone priorità 1)

        incrementCounter: () => set((state) => ({
          availableCounter: state.availableCounter + 1
        })),

        resetCounter: () => set({ availableCounter: 1 }),

        // ===== ANIMAZIONE ITINERARIO =====
        showItineraryAnimation: false,

        setShowItineraryAnimation: (show) => set({ showItineraryAnimation: show }),

        // Flag per navigare alla landing page dopo completamento (es. selezione hotel)
        navigateToLandingPage: false,

        setNavigateToLandingPage: (shouldNavigate) => set({ navigateToLandingPage: shouldNavigate }),

        // ===== ACTIONS DATI VIAGGIO =====
        setWizardData: (data) => set({ wizardData: data }),

        setTotalDays: (days) => set((state) => ({
          tripData: { ...state.tripData, totalDays: days }
        })),

        addZone: (zone) => set((state) => {
          // Verifica se zona già presente
          const exists = state.tripData.selectedZones.some(z => z.code === zone.code);
          if (exists) return state;

          // LOGICA DEFINITIVA:
          // - Prima zona: crea blocco ARRIVAL (giorno 1)
          // - Zone successive: crea blocco LOGISTICS (trasferimento)
          const isFirstZone = state.tripData.selectedZones.length === 0;

          if (isFirstZone) {
            // PRIMA ZONA: crea blocco ARRIVAL (giorno 1)
            const arrivalBlock = {
              day: 1,
              type: BLOCK_TYPE.ARRIVAL,
              zoneCode: zone.code,
              zoneName: zone.name,
              experience: {
                nome: `Arrivo a ${zone.name}`,
                descrizione: `Arrivo e sistemazione a ${zone.name}`,
                type: BLOCK_TYPE.ARRIVAL
              }
            };

            console.log(`✈️ Prima zona selezionata: ${zone.name} - Creato blocco ARRIVAL (Day 1)`);

            return {
              tripData: {
                ...state.tripData,
                selectedZones: [...state.tripData.selectedZones, {
                  ...zone,
                  order: 1
                }],
                filledBlocks: [arrivalBlock]
              }
            };
          } else {
            // ZONE SUCCESSIVE: crea blocco LOGISTICS
            // Calcola lastDay per il nuovo blocco logistics
            const lastDay = getLastDay(state.tripData.filledBlocks);

            // Prendi nome zona precedente dai blocchi o dall'ultima selectedZone
            let previousZone = getPreviousZoneName(state.tripData.filledBlocks);
            if (!previousZone && state.tripData.selectedZones.length > 0) {
              previousZone = state.tripData.selectedZones[state.tripData.selectedZones.length - 1].name;
            }

            // Crea blocco logistics per trasferimento
            const logisticsBlock = {
              day: lastDay + 1,
              type: BLOCK_TYPE.LOGISTICS,
              zoneCode: zone.code,
              zoneName: zone.name,
              experience: {
                nome: `Trasferimento e sistemazione a ${zone.name}`,
                descrizione: previousZone
                  ? `Giorno dedicato al trasferimento da ${previousZone} e sistemazione a ${zone.name}`
                  : `Giorno dedicato al trasferimento e sistemazione a ${zone.name}`,
                type: BLOCK_TYPE.LOGISTICS
              }
            };

            console.log(`🚗 Cambio zona: ${previousZone || 'zona precedente'} → ${zone.name} - Creato blocco logistics (Day ${lastDay + 1})`);

            return {
              tripData: {
                ...state.tripData,
                selectedZones: [...state.tripData.selectedZones, {
                  ...zone,
                  order: state.tripData.selectedZones.length + 1
                }],
                filledBlocks: [...state.tripData.filledBlocks, logisticsBlock]
              }
            };
          }
        }),

        removeZone: (zoneCode) => set((state) => {
          // Rimuovi zona da selectedZones
          const newSelectedZones = state.tripData.selectedZones
            .filter(z => z.code !== zoneCode)
            .map((z, idx) => ({ ...z, order: idx + 1 }));

          // Rimuovi tutti i blocchi associati a quella zona
          const newFilledBlocks = state.tripData.filledBlocks.filter(
            block => block.zoneCode !== zoneCode
          );

          console.log(`🗑️ Zona rimossa: ${zoneCode} - Rimossi ${state.tripData.filledBlocks.length - newFilledBlocks.length} blocchi`);

          return {
            tripData: {
              ...state.tripData,
              selectedZones: newSelectedZones,
              filledBlocks: newFilledBlocks
            }
          };
        }),

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
        // LOGICA BLOCCHI SEMPLIFICATA:
        // - Il blocco logistics viene creato quando si seleziona una zona (funzione addZone)
        // - Questa funzione aggiunge solo il blocco esperienza/free day
        addExperience: (zoneCode, experience) => set((state) => {
          console.log(`📌 addExperience chiamato:`, { zoneCode, experienceName: experience.nome, currentBlocks: state.tripData.filledBlocks.length });

          const zone = state.tripData.selectedZones.find(z => z.code === zoneCode);
          const zoneName = zone?.name || experience.ZONA || 'Zona';

          // Calcola lastDay per il nuovo blocco
          const lastDay = getLastDay(state.tripData.filledBlocks);

          // Crea il blocco per l'esperienza o giorno libero
          const blockType = experience.isFreeDay ? BLOCK_TYPE.FREE : BLOCK_TYPE.EXPERIENCE;
          const emoji = blockType === BLOCK_TYPE.FREE ? '🏖️' : '🎯';
          console.log(`${emoji} Creazione blocco ${blockType.toUpperCase()}: ${experience.nome} (Day ${lastDay + 1})`);

          const experienceBlock = {
            day: lastDay + 1,
            type: blockType,
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
              rating: experience.rating,
              isFreeDay: experience.isFreeDay
            }
          };

          return {
            tripData: {
              ...state.tripData,
              filledBlocks: [...state.tripData.filledBlocks, experienceBlock]
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
          // LOGICA CORRETTA:
          // - filledBlocks contiene tutti i giorni programmati (esperienze + trasferimenti zone)
          // - Prima zona NON crea blocco logistics, le esperienze partono da Day 1
          // - Zone successive creano blocco logistics per trasferimento
          // - Ultimo giorno (partenza) NON è in filledBlocks
          // Esempio 10 giorni: Day 1-9 disponibili per blocchi, Day 10 partenza
          return totalDays - 1 - filledBlocks.length;
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
