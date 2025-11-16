import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useBlocker } from 'react-router-dom';

/**
 * Hook per proteggere la navigazione in sezioni critiche
 * Mostra un alert di conferma prima di lasciare la pagina
 *
 * @param {boolean} isActive - Attiva/disattiva la protezione
 * @param {string} message - Messaggio da mostrare (opzionale)
 */
function useNavigationGuard(isActive = false, message = 'Sei sicuro di voler uscire? Le modifiche non salvate andranno perse.') {
  // Blocca la navigazione react-router
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) =>
        isActive && currentLocation.pathname !== nextLocation.pathname,
      [isActive]
    )
  );

  // Gestisce la conferma dell'utente
  useEffect(() => {
    if (blocker.state === 'blocked') {
      // Usa setTimeout per evitare problemi di rendering
      setTimeout(() => {
        const shouldProceed = window.confirm(message);

        if (shouldProceed) {
          blocker.proceed?.();
        } else {
          blocker.reset?.();
        }
      }, 0);
    }
  }, [blocker.state, message]);

  // Blocca la chiusura della finestra/refresh del browser
  useEffect(() => {
    if (!isActive) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isActive, message]);

  return blocker;
}

export default useNavigationGuard;
