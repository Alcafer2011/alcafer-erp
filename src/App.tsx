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
    const consent = localStorage.getItem('cookie-consent');
    if (consent) {
      setCookieConsent(JSON.parse(consent));
    }
  }, []);

  const handleCookieConsent = (preferences: CookiePreferences) => {
    setCookieConsent(preferences);
    if (preferences.necessary) {
      setShowLogin(true);
    }
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Mostra il consenso cookie se non è stato dato
  if (!cookieConsent) {
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