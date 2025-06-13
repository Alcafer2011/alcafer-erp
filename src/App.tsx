import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import CookieConsent from './components/auth/CookieConsent';
import LoginForm from './components/auth/LoginForm';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import HomeFinanziaria from './pages/HomeFinanziaria';
import Clienti from './pages/Clienti';
import Preventivi from './pages/Preventivi';
import Lavori from './pages/Lavori';
import MaterialiMetallici from './pages/MaterialiMetallici';
import MaterialiVari from './pages/MaterialiVari';
import LeasingStrumentali from './pages/LeasingStrumentali';
import Manovalanza from './pages/Manovalanza';
import FinanziariInfo from './pages/finanziari/FinanziariInfo';
import Dividendi from './pages/finanziari/Dividendi';
import TasseAlcafer from './pages/finanziari/TasseAlcafer';
import TasseGabifer from './pages/finanziari/TasseGabifer';
import LoadingSpinner from './components/common/LoadingSpinner';
import { supabase } from './lib/supabase';
import { emailService } from './services/emailService';
import toast from 'react-hot-toast';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

function App() {
  const { isAuthenticated, loading } = useAuth();
  const [cookieConsent, setCookieConsent] = useState<CookiePreferences | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    console.log('🚀 App avviata - Controllo cookie consent');
    
    // Controlla sempre il consenso cookie all'avvio
    const consent = localStorage.getItem('cookie-consent');
    if (consent) {
      try {
        const parsedConsent = JSON.parse(consent);
        console.log('✅ Cookie consent trovato:', parsedConsent);
        setCookieConsent(parsedConsent);
      } catch (error) {
        console.warn('⚠️ Cookie consent corrotto, richiedo nuovamente');
        localStorage.removeItem('cookie-consent');
        setCookieConsent(null);
      }
    } else {
      console.log('❌ Nessun cookie consent trovato');
      setCookieConsent(null);
    }

    // Gestisci conferma email personalizzata
    const handleEmailConfirmation = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const email = urlParams.get('email');

      if (token && email) {
        console.log('🔗 Link di conferma rilevato:', { token, email });
        
        try {
          // Recupera i dati temporanei
          const tempUserData = localStorage.getItem(`temp_user_${token}`);
          
          if (!tempUserData) {
            toast.error('Link di conferma scaduto o non valido');
            return;
          }

          const userData = JSON.parse(tempUserData);
          
          // Controlla se il token è scaduto
          if (Date.now() > userData.expires) {
            localStorage.removeItem(`temp_user_${token}`);
            toast.error('Link di conferma scaduto. Registrati nuovamente.');
            return;
          }

          console.log('✅ Dati utente validi, procedo con registrazione Supabase');

          // Registra l'utente su Supabase
          const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
              emailRedirectTo: window.location.origin,
              data: {
                nome: userData.nome,
                cognome: userData.cognome,
                data_nascita: userData.data_nascita,
                ruolo: userData.ruolo,
              }
            }
          });

          if (error) throw error;

          if (data.user) {
            // Crea il profilo utente
            const { error: profileError } = await supabase
              .from('users')
              .insert([{
                id: data.user.id,
                email: userData.email,
                nome: userData.nome,
                cognome: userData.cognome,
                data_nascita: userData.data_nascita,
                ruolo: userData.ruolo,
              }]);

            if (profileError) {
              console.error('Errore nella creazione del profilo:', profileError);
            } else {
              console.log('✅ Profilo utente creato con successo');
            }

            // Invia email di benvenuto
            try {
              await emailService.sendWelcomeEmail(userData.email, userData.nome);
              console.log('✅ Email di benvenuto inviata');
            } catch (emailError) {
              console.warn('⚠️ Errore invio email benvenuto:', emailError);
            }

            // Rimuovi i dati temporanei
            localStorage.removeItem(`temp_user_${token}`);

            toast.success('🎉 Account confermato con successo! Benvenuto in Alcafer ERP!');
            
            // Pulisci l'URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (error: any) {
          console.error('Errore nella conferma:', error);
          toast.error('Errore nella conferma dell\'account: ' + error.message);
        }
      }
    };

    // Gestisci il callback di conferma email standard di Supabase
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Errore nel recupero della sessione:', error);
        return;
      }

      if (data.session && data.session.user && data.session.user.email_confirmed_at) {
        const { data: existingProfile } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.session.user.id)
          .single();

        if (!existingProfile && data.session.user.user_metadata) {
          const metadata = data.session.user.user_metadata;
          
          try {
            const { error: profileError } = await supabase
              .from('users')
              .insert([{
                id: data.session.user.id,
                email: data.session.user.email,
                nome: metadata.nome,
                cognome: metadata.cognome,
                data_nascita: metadata.data_nascita,
                ruolo: metadata.ruolo,
              }]);

            if (profileError) {
              console.error('Errore nella creazione del profilo:', profileError);
            } else {
              toast.success('Account confermato e profilo creato con successo!');
            }
          } catch (error) {
            console.error('Errore nella creazione del profilo:', error);
          }
        }
      }
    };

    // Controlla se siamo in una pagina di conferma
    if (window.location.search.includes('token=')) {
      handleEmailConfirmation();
    } else if (window.location.pathname === '/auth/callback' || window.location.hash.includes('access_token')) {
      handleAuthCallback();
    }
  }, []);

  const handleCookieConsent = (preferences: CookiePreferences) => {
    console.log('🍪 Cookie consent ricevuto:', preferences);
    setCookieConsent(preferences);
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    
    if (preferences.necessary) {
      setShowLogin(true);
      console.log('✅ Cookie necessari accettati, mostro login');
    }
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    console.log('✅ Login completato con successo');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // SEMPRE mostra il consenso cookie se non è stato dato
  if (!cookieConsent) {
    console.log('🍪 Mostro consenso cookie');
    return <CookieConsent onAccept={handleCookieConsent} />;
  }

  // Se i cookie necessari sono stati rifiutati, mostra messaggio
  if (!cookieConsent.necessary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Accesso Negato</h2>
          <p className="text-gray-600 mb-6">
            I cookie necessari sono richiesti per utilizzare questa applicazione.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('cookie-consent');
              setCookieConsent(null);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Rivedi Impostazioni Cookie
          </button>
        </div>
      </div>
    );
  }

  // Mostra il form di login se non autenticato
  if (!isAuthenticated || showLogin) {
    return (
      <>
        <LoginForm onSuccess={handleLoginSuccess} />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </>
    );
  }

  return (
    <>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/home-finanziaria" element={<HomeFinanziaria />} />
            <Route path="/clienti" element={<Clienti />} />
            <Route path="/preventivi" element={<Preventivi />} />
            <Route path="/lavori" element={<Lavori />} />
            <Route path="/materiali-metallici" element={<MaterialiMetallici />} />
            <Route path="/materiali-vari" element={<MaterialiVari />} />
            <Route path="/leasing" element={<LeasingStrumentali />} />
            <Route path="/manovalanza" element={<Manovalanza />} />
            <Route path="/finanziari/info" element={<FinanziariInfo />} />
            <Route path="/finanziari/dividendi" element={<Dividendi />} />
            <Route path="/finanziari/tasse-alcafer" element={<TasseAlcafer />} />
            <Route path="/finanziari/tasse-gabifer" element={<TasseGabifer />} />
            <Route path="/auth/callback" element={<Navigate to="/" replace />} />
            <Route path="/auth/confirm" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  );
}

export default App;