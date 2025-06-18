import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getUserProfile, supabaseAdmin } from '../lib/supabase';
import { User as UserProfile } from '../types/database';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Controlla se c'è già una sessione attiva in localStorage
        const savedProfile = localStorage.getItem('auth_profile');
        
        if (savedProfile) {
          // Utente già autenticato tramite localStorage
          const profile = JSON.parse(savedProfile);
          setUserProfile(profile);
          
          // Crea un oggetto User minimo per compatibilità
          const savedUser = localStorage.getItem('auth_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          } else {
            // Crea un user minimo se non esiste
            setUser({
              id: profile.id,
              email: profile.email,
              created_at: profile.created_at,
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              confirmation_sent_at: new Date().toISOString()
            });
          }
        } else {
          // Nessuna sessione attiva, mostra la pagina di login
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('❌ Errore inizializzazione auth:', error);
        // In caso di errore, pulisci lo stato
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_profile');
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const switchUser = (newUserRole: 'alessandro' | 'gabriel' | 'hanna') => {
    const userEmails = {
      'alessandro': 'assistenza.alcafer@gmail.com',
      'gabriel': 'gabifervoghera@gmail.com',
      'hanna': 'nuta1985@icloud.com'
    };
    
    const userProfiles = {
      alessandro: {
        id: 'alessandro-id',
        email: userEmails.alessandro,
        nome: 'Alessandro',
        cognome: 'Calabria',
        data_nascita: '1990-01-01',
        ruolo: 'alessandro' as const,
        created_at: new Date().toISOString()
      },
      gabriel: {
        id: 'gabriel-id',
        email: userEmails.gabriel,
        nome: 'Gabriel',
        cognome: 'Prunaru',
        data_nascita: '1992-05-15',
        ruolo: 'gabriel' as const,
        created_at: new Date().toISOString()
      },
      hanna: {
        id: 'hanna-id',
        email: userEmails.hanna,
        nome: 'Hanna',
        cognome: 'Mazhar',
        data_nascita: '1988-12-03',
        ruolo: 'hanna' as const,
        created_at: new Date().toISOString()
      }
    };

    const newProfile = userProfiles[newUserRole];
    const newUser: User = {
      id: newProfile.id,
      email: newProfile.email,
      created_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      confirmation_sent_at: new Date().toISOString()
    };

    setUser(newUser);
    setUserProfile(newProfile);
    
    // Salva lo stato di autenticazione in localStorage per persistenza
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    localStorage.setItem('auth_profile', JSON.stringify(newProfile));
    
    toast.success(`Utente cambiato: ${newProfile.nome} ${newProfile.cognome}`);
  };

  // Funzione per il login
  const login = async (email: string, password: string) => {
    try {
      // Determina quale utente autenticare in base all'email o nome
      const emailLower = email.toLowerCase();
      
      if (emailLower.includes('aless') || emailLower === 'assistenza.alcafer@gmail.com' || emailLower === 'alessandro') {
        switchUser('alessandro');
        
        // Salva lo stato di autenticazione in localStorage
        const userProfile = {
          id: 'alessandro-id',
          email: 'assistenza.alcafer@gmail.com',
          nome: 'Alessandro',
          cognome: 'Calabria',
          data_nascita: '1990-01-01',
          ruolo: 'alessandro' as const,
          created_at: new Date().toISOString()
        };
        localStorage.setItem('auth_profile', JSON.stringify(userProfile));
        
        return { success: true, user: 'alessandro' };
      } else if (emailLower.includes('gabr') || emailLower.includes('gabi') || emailLower === 'gabifervoghera@gmail.com' || emailLower === 'gabriel') {
        switchUser('gabriel');
        
        // Salva lo stato di autenticazione in localStorage
        const userProfile = {
          id: 'gabriel-id',
          email: 'gabifervoghera@gmail.com',
          nome: 'Gabriel',
          cognome: 'Prunaru',
          data_nascita: '1992-05-15',
          ruolo: 'gabriel' as const,
          created_at: new Date().toISOString()
        };
        localStorage.setItem('auth_profile', JSON.stringify(userProfile));
        
        return { success: true, user: 'gabriel' };
      } else if (emailLower.includes('hann') || emailLower.includes('nuta') || emailLower === 'nuta1985@icloud.com' || emailLower === 'hanna') {
        switchUser('hanna');
        
        // Salva lo stato di autenticazione in localStorage
        const userProfile = {
          id: 'hanna-id',
          email: 'nuta1985@icloud.com',
          nome: 'Hanna',
          cognome: 'Mazhar',
          data_nascita: '1988-12-03',
          ruolo: 'hanna' as const,
          created_at: new Date().toISOString()
        };
        localStorage.setItem('auth_profile', JSON.stringify(userProfile));
        
        return { success: true, user: 'hanna' };
      } else {
        // Default a Alessandro se l'email non corrisponde
        switchUser('alessandro');
        
        // Salva lo stato di autenticazione in localStorage
        const userProfile = {
          id: 'alessandro-id',
          email: 'assistenza.alcafer@gmail.com',
          nome: 'Alessandro',
          cognome: 'Calabria',
          data_nascita: '1990-01-01',
          ruolo: 'alessandro' as const,
          created_at: new Date().toISOString()
        };
        localStorage.setItem('auth_profile', JSON.stringify(userProfile));
        
        return { success: true, user: 'alessandro' };
      }
    } catch (error) {
      console.error('Errore durante il login:', error);
      return { success: false, error };
    }
  };

  // Funzione per il logout
  const signOut = async () => {
    try {
      // Rimuovi lo stato di autenticazione da localStorage
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_profile');
      
      setUser(null);
      setUserProfile(null);
      return { success: true };
    } catch (error) {
      console.error('Errore durante il logout:', error);
      return { success: false, error };
    }
  };

  return {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
    isAlessandro: userProfile?.ruolo === 'alessandro',
    isGabriel: userProfile?.ruolo === 'gabriel',
    isHanna: userProfile?.ruolo === 'hanna',
    switchUser,
    login,
    signOut
  };
};