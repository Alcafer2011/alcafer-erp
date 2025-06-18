import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getUserProfile } from '../lib/supabase';
import { User as UserProfile } from '../types/database';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Controlla se c'è già una sessione attiva
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Utente già autenticato
          setUser(session.user);
          const profile = await getUserProfile(session.user.id);
          setUserProfile(profile);
        } else {
          // Prova ad autenticare automaticamente in base all'email
          await autoLogin();
        }
      } catch (error) {
        console.error('❌ Errore inizializzazione auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
    
    // Ascolta i cambiamenti di autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const profile = await getUserProfile(session.user.id);
          setUserProfile(profile);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Funzione per autenticare automaticamente in base all'email
  const autoLogin = async () => {
    // Mappa delle email degli utenti
    const userEmails = {
      'alessandro': 'assistenza.alcafer@gmail.com',
      'gabriel': 'gabifervoghera@gmail.com',
      'hanna': 'nuta1985@icloud.com'
    };

    // Crea un utente simulato per la demo
    const mockUser = (role: 'alessandro' | 'gabriel' | 'hanna'): User => ({
      id: `${role}-id`,
      email: userEmails[role],
      created_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      confirmation_sent_at: new Date().toISOString()
    });

    // Crea un profilo utente simulato
    const createMockProfile = (role: 'alessandro' | 'gabriel' | 'hanna'): UserProfile => {
      const profiles = {
        'alessandro': {
          id: 'alessandro-id',
          email: userEmails.alessandro,
          nome: 'Alessandro',
          cognome: 'Calabria',
          data_nascita: '1990-01-01',
          ruolo: 'alessandro' as const,
          created_at: new Date().toISOString()
        },
        'gabriel': {
          id: 'gabriel-id',
          email: userEmails.gabriel,
          nome: 'Gabriel',
          cognome: 'Prunaru',
          data_nascita: '1992-05-15',
          ruolo: 'gabriel' as const,
          created_at: new Date().toISOString()
        },
        'hanna': {
          id: 'hanna-id',
          email: userEmails.hanna,
          nome: 'Hanna',
          cognome: 'Mazhar',
          data_nascita: '1988-12-03',
          ruolo: 'hanna' as const,
          created_at: new Date().toISOString()
        }
      };
      
      return profiles[role];
    };

    // Determina quale utente autenticare in base all'URL o altre informazioni
    // Per questa demo, autentichiamo Alessandro per default
    const defaultRole: 'alessandro' | 'gabriel' | 'hanna' = 'alessandro';
    
    // Simula l'autenticazione
    const simulatedUser = mockUser(defaultRole);
    const simulatedProfile = createMockProfile(defaultRole);
    
    setUser(simulatedUser);
    setUserProfile(simulatedProfile);
    
    toast.success(`Benvenuto, ${simulatedProfile.nome}!`);
  };

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
    
    toast.success(`Utente cambiato: ${newProfile.nome} ${newProfile.cognome}`);
  };

  // Funzione per il logout
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      toast.success('Logout effettuato con successo');
    } catch (error) {
      console.error('Errore durante il logout:', error);
      toast.error('Errore durante il logout');
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
    signOut
  };
};