import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carica lo stato di autenticazione da localStorage all'avvio
  useEffect(() => {
    const storedUser = localStorage.getItem('travel_crew_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Errore nel parsing dei dati utente:', error);
        localStorage.removeItem('travel_crew_user');
      }
    }
    setLoading(false);
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      // TODO: Sostituire con chiamata API reale al backend
      // Per ora simuliamo un login con delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Validazione base
      if (!email || !password) {
        throw new Error('Email e password sono obbligatori');
      }

      // Simula risposta backend
      const userData = {
        id: Date.now(),
        email: email,
        nome: email.split('@')[0], // Usa prima parte email come nome
        createdAt: new Date().toISOString()
      };

      setUser(userData);
      localStorage.setItem('travel_crew_user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      console.error('Errore login:', error);
      return { success: false, error: error.message };
    }
  };

  // Registrazione
  const register = async (email, password, nome) => {
    try {
      // TODO: Sostituire con chiamata API reale al backend
      await new Promise(resolve => setTimeout(resolve, 800));

      // Validazione base
      if (!email || !password || !nome) {
        throw new Error('Tutti i campi sono obbligatori');
      }

      if (password.length < 6) {
        throw new Error('La password deve essere di almeno 6 caratteri');
      }

      // Simula risposta backend
      const userData = {
        id: Date.now(),
        email: email,
        nome: nome,
        createdAt: new Date().toISOString()
      };

      setUser(userData);
      localStorage.setItem('travel_crew_user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      console.error('Errore registrazione:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('travel_crew_user');
  };

  // Aggiorna profilo utente
  const updateProfile = async (updates) => {
    try {
      // TODO: Sostituire con chiamata API reale al backend
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('travel_crew_user', JSON.stringify(updatedUser));

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Errore aggiornamento profilo:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthContext;
