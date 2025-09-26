import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import HomeFinanziaria from './pages/HomeFinanziaria';
import Clienti from './pages/Clienti';
import Preventivi from './pages/Preventivi';
import Lavori from './pages/Lavori';
import PosaInOpera from './pages/PosaInOpera';
import MaterialiMetallici from './pages/MaterialiMetallici';
import MaterialiVari from './pages/MaterialiVari';
import LeasingStrumentali from './pages/LeasingStrumentali';
import Manovalanza from './pages/Manovalanza';
import CostiUtenze from './pages/CostiUtenze';
import Fornitori from './pages/Fornitori';
import Utenti from './pages/Utenti';
import Marketing from './pages/Marketing';
import FinanziariInfo from './pages/finanziari/FinanziariInfo';
import Dividendi from './pages/finanziari/Dividendi';
import TasseAlcafer from './pages/finanziari/TasseAlcafer';
import TasseGabifer from './pages/finanziari/TasseGabifer';
import LoadingSpinner from './components/common/LoadingSpinner';
import { supabase, checkSupabaseConnection } from './lib/supabase';
import toast from 'react-hot-toast';
import AIDevAssistant from './components/admin/AIDevAssistant';

function App() {
  const { isAuthenticated, loading, userProfile, user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);

  useEffect(() => {
    console.log('🚀 App avviata - Controllo connessione database');
    
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      console.log('Connection status:', isConnected);
      setConnectionStatus(Boolean(isConnected));
      
      if (!isConnected) {
        toast.error('Errore di connessione al database. Controlla le variabili d\'ambiente.', {
          duration: 10000,
        });
      }
    };
    
    setTimeout(checkConnection, 1000); // Delay to ensure environment variables are loaded
    
    // Registra il service worker per PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
          console.log('ServiceWorker registrato con successo:', registration.scope);
        }).catch(error => {
          console.log('Registrazione ServiceWorker fallita:', error);
        });
      });
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Caricamento...</p>
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

  return (
    <>
      <Router>
        {!isAuthenticated ? (
          <Routes>
            <Route path="*" element={<LoginPage />} />
          </Routes>
        ) : (
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/home-finanziaria" element={<HomeFinanziaria />} />
              <Route path="/clienti" element={<Clienti />} />
              <Route path="/preventivi" element={<Preventivi />} />
              <Route path="/lavori" element={<Lavori />} />
              <Route path="/posa-in-opera" element={<PosaInOpera />} />
              <Route path="/materiali-metallici" element={<MaterialiMetallici />} />
              <Route path="/materiali-vari" element={<MaterialiVari />} />
              <Route path="/leasing" element={<LeasingStrumentali />} />
              <Route path="/manovalanza" element={<Manovalanza />} />
              <Route path="/costi-utenze" element={<CostiUtenze />} />
              <Route path="/fornitori" element={<Fornitori />} />
              <Route path="/utenti" element={<Utenti />} />
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/finanziari/info" element={<FinanziariInfo />} />
              <Route path="/finanziari/dividendi" element={<Dividendi />} />
              <Route path="/finanziari/tasse-alcafer" element={<TasseAlcafer />} />
              <Route path="/finanziari/tasse-gabifer" element={<TasseGabifer />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        )}
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
      {isAuthenticated && userProfile?.ruolo === 'alessandro' && <AIDevAssistant />}
    </>
  );
}

export default App;
