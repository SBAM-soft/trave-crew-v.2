import { useEffect } from 'react';

/**
 * Hook per proteggere la navigazione in sezioni critiche
 * Mostra un alert di conferma prima di lasciare la pagina
 *
 * Nota: Usa solo beforeunload per compatibilità cross-browser.
 * useBlocker di React Router è instabile e causa problemi in alcune versioni.
 *
 * @param {boolean} isActive - Attiva/disattiva la protezione
 * @param {string} message - Messaggio da mostrare (opzionale)
 */
function useNavigationGuard(isActive = false, message = 'Sei sicuro di voler uscire? Le modifiche non salvate andranno perse.') {
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

  // Nota: useBlocker è stato rimosso temporaneamente per instabilità
  // La protezione avviene solo su chiusura finestra/refresh
  return null;
}

export default useNavigationGuard;
