import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { storageService } from '../core/services/storageService';

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

  // Carica lo stato di autenticazione da storage all'avvio
  useEffect(() => {
    const storedUser = storageService.getUser();
    if (storedUser) {
      setUser(storedUser);
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
      storageService.setUser(userData);

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
      storageService.setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Errore registrazione:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    storageService.clearUser();
  };

  // Aggiorna profilo utente
  const updateProfile = async (updates) => {
    try {
      // TODO: Sostituire con chiamata API reale al backend
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      storageService.setUser(updatedUser);

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
