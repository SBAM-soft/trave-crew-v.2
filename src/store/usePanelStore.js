import { create } from 'zustand';
import { Z_INDEX } from '../core/constants';

/**
 * Zustand store for panel/modal stack management
 *
 * Features:
 * - Stack-based panel system (LIFO - Last In First Out)
 * - Dynamic z-index calculation based on stack position
 * - URL synchronization support
 * - Data persistence per panel instance
 * - Browser back button integration
 *
 * Panel Types:
 * - 'pexp': Package Experience selection panel
 * - 'detexp': Detailed Experience information modal
 * - 'hotel': Hotel selection panel
 *
 * Usage:
 * const { pushPanel, popPanel, panelStack } = usePanelStore();
 *
 * // Open PEXP panel
 * pushPanel('pexp', { pexpId: 'PKG123', pexp: {...} });
 *
 * // Open nested DETEXP
 * pushPanel('detexp', { expId: 'EXP456', exp: {...} });
 *
 * // Close last panel
 * popPanel();
 */
const usePanelStore = create((set, get) => ({
  // Panel stack - array of panel objects
  // Each panel: { id: string, type: string, data: object, timestamp: number }
  panelStack: [],

  // Base z-index for first panel
  baseZIndex: Z_INDEX.BASE,

  /**
   * Push a new panel onto the stack
   * @param {string} type - Panel type ('pexp', 'detexp', 'hotel')
   * @param {object} data - Data to pass to the panel
   * @returns {string} Panel ID
   */
  pushPanel: (type, data = {}) => {
    const panelId = `${type}-${Date.now()}`;
    const newPanel = {
      id: panelId,
      type,
      data,
      timestamp: Date.now(),
    };

    set((state) => ({
      panelStack: [...state.panelStack, newPanel],
    }));

    return panelId;
  },

  /**
   * Remove the last panel from the stack
   * @returns {object|null} Removed panel or null if stack was empty
   */
  popPanel: () => {
    const state = get();
    if (state.panelStack.length === 0) return null;

    const removedPanel = state.panelStack[state.panelStack.length - 1];

    set((state) => ({
      panelStack: state.panelStack.slice(0, -1),
    }));

    return removedPanel;
  },

  /**
   * Remove a specific panel by ID and all panels above it in the stack
   * @param {string} panelId - Panel ID to remove
   */
  removePanelById: (panelId) => {
    set((state) => {
      const index = state.panelStack.findIndex((p) => p.id === panelId);
      if (index === -1) return state;

      // Remove this panel and all panels above it
      return {
        panelStack: state.panelStack.slice(0, index),
      };
    });
  },

  /**
   * Clear all panels from the stack
   */
  clearPanels: () => {
    set({ panelStack: [] });
  },

  /**
   * Update data for a specific panel
   * @param {string} panelId - Panel ID
   * @param {object} newData - New data to merge
   */
  updatePanelData: (panelId, newData) => {
    set((state) => ({
      panelStack: state.panelStack.map((panel) =>
        panel.id === panelId
          ? { ...panel, data: { ...panel.data, ...newData } }
          : panel
      ),
    }));
  },

  /**
   * Get data for a specific panel
   * @param {string} panelId - Panel ID
   * @returns {object|null} Panel data or null if not found
   */
  getPanelData: (panelId) => {
    const panel = get().panelStack.find((p) => p.id === panelId);
    return panel ? panel.data : null;
  },

  /**
   * Get panel by ID
   * @param {string} panelId - Panel ID
   * @returns {object|null} Panel object or null if not found
   */
  getPanelById: (panelId) => {
    return get().panelStack.find((p) => p.id === panelId) || null;
  },

  /**
   * Get panels by type
   * @param {string} type - Panel type
   * @returns {array} Array of panels matching the type
   */
  getPanelsByType: (type) => {
    return get().panelStack.filter((p) => p.type === type);
  },

  /**
   * Get the currently active (top) panel
   * @returns {object|null} Top panel or null if stack is empty
   */
  getActivePanel: () => {
    const stack = get().panelStack;
    return stack.length > 0 ? stack[stack.length - 1] : null;
  },

  /**
   * Calculate z-index for a panel based on its position in stack
   * @param {string} panelId - Panel ID
   * @returns {number} Calculated z-index
   */
  getZIndex: (panelId) => {
    const state = get();
    const index = state.panelStack.findIndex((p) => p.id === panelId);

    if (index === -1) return state.baseZIndex;

    // Each panel gets baseZIndex + (position * 100)
    // Example: PEXP=900, DETEXP=1000, etc.
    return state.baseZIndex + (index * 100);
  },

  /**
   * Check if a specific panel is currently open
   * @param {string} type - Panel type
   * @returns {boolean}
   */
  isPanelOpen: (type) => {
    return get().panelStack.some((p) => p.type === type);
  },

  /**
   * Check if any panels are open
   * @returns {boolean}
   */
  hasOpenPanels: () => {
    return get().panelStack.length > 0;
  },

  /**
   * Get the depth of a specific panel in the stack (0-based)
   * @param {string} panelId - Panel ID
   * @returns {number} Stack depth or -1 if not found
   */
  getPanelDepth: (panelId) => {
    return get().panelStack.findIndex((p) => p.id === panelId);
  },

  /**
   * Replace the entire stack (useful for URL sync)
   * @param {array} newStack - New panel stack
   */
  replaceStack: (newStack) => {
    set({ panelStack: newStack });
  },
}));

export default usePanelStore;
