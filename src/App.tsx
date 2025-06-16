import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import CookieConsent from './components/auth/CookieConsent';
import EnhancedLoginForm from './components/auth/EnhancedLoginForm';
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
import { supabase, checkSupabaseConnection } from './lib/supabase';
import toast from 'react-hot-toast';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

function App() {
  const { isAuthenticated, loading, userProfile, user } = useAuth();
  const [cookieConsent, setCookieConsent] = useState<CookiePreferences | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [processingConfirmation, setProcessingConfirmation] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);

  useEffect(() => {
    console.log('🚀 App avviata - Controllo cookie consent');
    
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

    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      setConnectionStatus(isConnected);
      
      if (!isConnected) {
        toast.error('Errore di connessione al database. Controlla le variabili d\'ambiente.', {
          duration: 10000,
        });
      }
    };
    
    checkConnection();
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

  if (loading || processingConfirmation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            {processingConfirmation ? 'Confermando il tuo account...' : 'Caricamento...'}
          </p>
        </div>
      </div>
    );
  }

  if (connectionStatus === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Errore di Connessione</h2>
          <p className="text-gray-600 mb-6">
            Non è possibile connettersi al database. Verifica che le variabili d'ambiente siano configurate correttamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (!cookieConsent) {
    console.log('🍪 Mostro consenso cookie');
    return <CookieConsent onAccept={handleCookieConsent} />;
  }

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

  if (isAuthenticated && user && !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Profilo Incompleto</h2>
          <p className="text-gray-600 mb-6">
            Il tuo account è stato creato ma il profilo non è completo. 
            Effettua il logout e registrati nuovamente.
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.reload();
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Logout e Riprova
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || showLogin) {
    return (
      <>
        <EnhancedLoginForm onSuccess={handleLoginSuccess} />
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