import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import usePanelStore from '../store/usePanelStore';

/**
 * Hook to synchronize panel stack with URL parameters
 *
 * URL Format:
 * /trip-editor?panel=pexp&pexpId=PKG123
 * /trip-editor?panel=pexp&pexpId=PKG123&panel2=detexp&expId=EXP456
 *
 * Features:
 * - Syncs panel stack with URL on mount
 * - Updates URL when panel stack changes
 * - Handles browser back/forward buttons
 * - Prevents infinite loops
 *
 * Usage in TripEditor:
 * usePanelURLSync();
 */
const usePanelURLSync = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { panelStack, replaceStack, clearPanels } = usePanelStore();

  // Track if we're currently syncing to prevent loops
  const isSyncingRef = useRef(false);

  // Initial sync: URL -> Store (on mount)
  useEffect(() => {
    if (isSyncingRef.current) return;

    const panels = [];
    let index = 1;

    // Parse URL parameters to reconstruct panel stack
    while (true) {
      const panelParam = index === 1 ? 'panel' : `panel${index}`;
      const panelType = searchParams.get(panelParam);

      if (!panelType) break;

      // Build panel data from URL params
      const panelData = {};

      // Extract all params for this panel
      searchParams.forEach((value, key) => {
        // Skip the panel type params themselves
        if (key.startsWith('panel')) return;

        // Add other params as panel data
        panelData[key] = value;
      });

      panels.push({
        id: `${panelType}-${Date.now()}-${index}`,
        type: panelType,
        data: panelData,
        timestamp: Date.now() + index,
      });

      index++;
    }

    // Only update store if there are panels in URL
    if (panels.length > 0) {
      isSyncingRef.current = true;
      replaceStack(panels);
      // Reset syncing flag after a tick
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 0);
    }
  }, []); // Only run on mount

  // Sync: Store -> URL (when stack changes)
  useEffect(() => {
    if (isSyncingRef.current) return;

    isSyncingRef.current = true;

    const newParams = new URLSearchParams();

    if (panelStack.length === 0) {
      // No panels open - clear all panel params
      setSearchParams(newParams, { replace: true });
    } else {
      // Build URL params from panel stack
      panelStack.forEach((panel, index) => {
        const panelKey = index === 0 ? 'panel' : `panel${index + 1}`;
        newParams.set(panelKey, panel.type);

        // Add panel data to URL
        Object.entries(panel.data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // For nested panels, prefix data keys with panel number to avoid conflicts
            const dataKey = index === 0 ? key : `${key}${index + 1}`;
            newParams.set(dataKey, String(value));
          }
        });
      });

      setSearchParams(newParams, { replace: true });
    }

    // Reset syncing flag after a tick
    setTimeout(() => {
      isSyncingRef.current = false;
    }, 0);
  }, [panelStack, setSearchParams]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      // URL has changed via back/forward button
      // Re-read URL params and sync with store
      const params = new URLSearchParams(window.location.search);

      const panels = [];
      let index = 1;

      while (true) {
        const panelParam = index === 1 ? 'panel' : `panel${index}`;
        const panelType = params.get(panelParam);

        if (!panelType) break;

        const panelData = {};
        params.forEach((value, key) => {
          if (key.startsWith('panel')) return;
          panelData[key] = value;
        });

        panels.push({
          id: `${panelType}-${Date.now()}-${index}`,
          type: panelType,
          data: panelData,
          timestamp: Date.now() + index,
        });

        index++;
      }

      isSyncingRef.current = true;

      if (panels.length === 0) {
        clearPanels();
      } else {
        replaceStack(panels);
      }

      setTimeout(() => {
        isSyncingRef.current = false;
      }, 0);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [replaceStack, clearPanels]);

  // No return value needed - this hook just syncs state
};

export default usePanelURLSync;
