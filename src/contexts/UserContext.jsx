import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import { storageService } from '../core/services/storageService';

const UserContext = createContext(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export function UserProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Carica profilo esteso quando l'utente cambia
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserProfile(user.id);
    } else {
      setUserProfile(null);
    }
  }, [user, isAuthenticated]);

  // Carica profilo esteso da storage (in futuro da backend)
  const loadUserProfile = async (userId) => {
    try {
      setLoading(true);

      // Prova a caricare da storage
      const storedProfile = storageService.getProfile(userId);

      if (storedProfile) {
        setUserProfile(storedProfile);
      } else {
        // Crea profilo di default
        const defaultProfile = {
          userId: userId,
          telefono: '',
          citta: '',
          paese: 'Italia',
          bio: '',
          avatar: null,
          preferenze: {
            newsletter: true,
            notifiche: true,
            lingua: 'it'
          },
          statistiche: {
            viaggiCreati: 0,
            viaggiCompletati: 0,
            destinazioniVisitate: [],
            kmPercorsi: 0
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        setUserProfile(defaultProfile);
        storageService.setProfile(userId, defaultProfile);
      }
    } catch (error) {
      console.error('Errore caricamento profilo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Aggiorna profilo esteso
  const updateUserProfile = async (updates) => {
    try {
      if (!user) {
        throw new Error('Utente non autenticato');
      }

      // TODO: Sostituire con chiamata API reale al backend
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedProfile = {
        ...userProfile,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      setUserProfile(updatedProfile);
      storageService.setProfile(user.id, updatedProfile);

      return { success: true, profile: updatedProfile };
    } catch (error) {
      console.error('Errore aggiornamento profilo:', error);
      return { success: false, error: error.message };
    }
  };

  // Incrementa statistiche viaggio
  const incrementTripStats = (type = 'created') => {
    if (!userProfile) return;

    const updatedStats = { ...userProfile.statistiche };

    if (type === 'created') {
      updatedStats.viaggiCreati = (updatedStats.viaggiCreati || 0) + 1;
    } else if (type === 'completed') {
      updatedStats.viaggiCompletati = (updatedStats.viaggiCompletati || 0) + 1;
    }

    updateUserProfile({ statistiche: updatedStats });
  };

  // Aggiungi destinazione visitata
  const addDestination = (destinazione) => {
    if (!userProfile) return;

    const destinations = userProfile.statistiche.destinazioniVisitate || [];
    if (!destinations.includes(destinazione)) {
      const updatedStats = {
        ...userProfile.statistiche,
        destinazioniVisitate: [...destinations, destinazione]
      };
      updateUserProfile({ statistiche: updatedStats });
    }
  };

  const value = {
    userProfile,
    loading,
    updateUserProfile,
    incrementTripStats,
    addDestination
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default UserContext;
