import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getUserProfile } from '../lib/supabase';
import { User as UserProfile } from '../types/database';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula autenticazione automatica per demo
    // In produzione, qui ci sarebbe la vera logica di autenticazione
    const initializeAuth = async () => {
      try {
        // Simula un utente autenticato (Alessandro per default)
        const mockUser: User = {
          id: 'alessandro-id',
          email: 'alessandro@alcafer.com',
          created_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          confirmation_sent_at: new Date().toISOString()
        };

        const mockProfile: UserProfile = {
          id: 'alessandro-id',
          email: 'alessandro@alcafer.com',
          nome: 'Alessandro',
          cognome: 'Calabria',
          data_nascita: '1990-01-01',
          ruolo: 'alessandro',
          created_at: new Date().toISOString()
        };

        setUser(mockUser);
        setUserProfile(mockProfile);
      } catch (error) {
        console.error('❌ Errore inizializzazione auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const switchUser = (newUserRole: 'alessandro' | 'gabriel' | 'hanna') => {
    const userProfiles = {
      alessandro: {
        id: 'alessandro-id',
        email: 'alessandro@alcafer.com',
        nome: 'Alessandro',
        cognome: 'Calabria',
        data_nascita: '1990-01-01',
        ruolo: 'alessandro' as const,
        created_at: new Date().toISOString()
      },
      gabriel: {
        id: 'gabriel-id',
        email: 'gabriel@alcafer.com',
        nome: 'Gabriel',
        cognome: 'Prunaru',
        data_nascita: '1992-05-15',
        ruolo: 'gabriel' as const,
        created_at: new Date().toISOString()
      },
      hanna: {
        id: 'hanna-id',
        email: 'hanna@alcafer.com',
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
  };

  return {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
    isAlessandro: userProfile?.ruolo === 'alessandro',
    isGabriel: userProfile?.ruolo === 'gabriel',
    isHanna: userProfile?.ruolo === 'hanna',
    switchUser
  };
};