import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Zustand Store per Trip Editor
 * Gestisce state del viaggio in costruzione
 */
const useTripEditorStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ===== DATI VIAGGIO =====
        filledBlocks: [],
        totalDays: 7,
        availableCounter: 1, // Logica progressiva zone

        setFilledBlocks: (blocks) => set({ filledBlocks: blocks }),
        setTotalDays: (days) => set({ totalDays: days }),
        setAvailableCounter: (counter) => set({ availableCounter: counter }),

        addBlock: (block) => set((state) => ({
          filledBlocks: [...state.filledBlocks, block]
        })),

        addBlocks: (blocks) => set((state) => ({
          filledBlocks: [...state.filledBlocks, ...blocks]
        })),

        removeBlock: (day) => set((state) => ({
          filledBlocks: state.filledBlocks.filter(b => b.day !== day)
        })),

        incrementCounter: () => set((state) => ({
          availableCounter: state.availableCounter + 1
        })),

        // ===== UI STATE =====
        selectedZone: null,
        selectedPacchetto: null,
        selectedHotel: null,
        activeTab: null, // 'pexp' | 'detexp' | null
        currentPexp: null,
        currentExp: null,
        editingBlock: null,

        setSelectedZone: (zone) => set({ selectedZone: zone }),
        setSelectedPacchetto: (pacchetto) => set({ selectedPacchetto: pacchetto }),
        setSelectedHotel: (hotel) => set({ selectedHotel: hotel }),
        setActiveTab: (tab) => set({ activeTab: tab }),
        setCurrentPexp: (pexp) => set({ currentPexp: pexp }),
        setCurrentExp: (exp) => set({ currentExp: exp }),
        setEditingBlock: (block) => set({ editingBlock: block }),

        // ===== DATABASE CACHE =====
        zone: [],
        pacchetti: [],
        itinerari: [],
        costiAccessori: [],
        plus: [],
        esperienze: [],
        destinazioneData: null,
        availableZones: [], // Zone filtrate per contatore

        setZone: (data) => set({ zone: data }),
        setPacchetti: (data) => set({ pacchetti: data }),
        setItinerari: (data) => set({ itinerari: data }),
        setCostiAccessori: (data) => set({ costiAccessori: data }),
        setPlus: (data) => set({ plus: data }),
        setEsperienze: (data) => set({ esperienze: data }),
        setDestinazioneData: (data) => set({ destinazioneData: data }),
        setAvailableZones: (zones) => set({ availableZones: zones }),

        // ===== ANIMAZIONI E FLAGS =====
        creatingItinerary: false,
        showTimeline: false,

        setCreatingItinerary: (flag) => set({ creatingItinerary: flag }),
        setShowTimeline: (flag) => set({ showTimeline: flag }),

        // ===== UTILITÀ =====
        getDaysRemaining: () => {
          const state = get();
          return state.totalDays - 1 - state.filledBlocks.length;
        },

        getProgress: () => {
          const state = get();
          const totalBlocks = state.totalDays - 1; // -1 per giorno arrivo
          const filledCount = state.filledBlocks.length;
          return {
            filled: filledCount,
            total: totalBlocks,
            percentage: totalBlocks > 0 ? Math.round((filledCount / totalBlocks) * 100) : 0
          };
        },

        // ===== RESET =====
        reset: () => set({
          filledBlocks: [],
          totalDays: 7,
          availableCounter: 1,
          selectedZone: null,
          selectedPacchetto: null,
          selectedHotel: null,
          activeTab: null,
          currentPexp: null,
          currentExp: null,
          editingBlock: null,
          creatingItinerary: false,
          showTimeline: false
        }),

        // Reset parziale (mantiene dati caricati)
        resetTrip: () => set({
          filledBlocks: [],
          totalDays: 7,
          availableCounter: 1,
          selectedZone: null,
          selectedPacchetto: null,
          selectedHotel: null,
          activeTab: null,
          currentPexp: null,
          currentExp: null,
          editingBlock: null
        })
      }),
      {
        name: 'trip-editor-storage',
        partialize: (state) => ({
          // Salva solo dati essenziali del viaggio
          filledBlocks: state.filledBlocks,
          totalDays: state.totalDays,
          availableCounter: state.availableCounter
        })
      }
    ),
    { name: 'TripEditor' }
  )
);

export default useTripEditorStore;
