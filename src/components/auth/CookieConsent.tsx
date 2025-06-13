import React, { useState, useEffect } from 'react';
import { X, Cookie, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CookieConsentProps {
  onAccept: (preferences: CookiePreferences) => void;
}

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept }) => {
  const [showConsent, setShowConsent] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = { necessary: true, analytics: true, marketing: true };
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    onAccept(allAccepted);
    setShowConsent(false);
  };

  const handleAcceptSelected = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    onAccept(preferences);
    setShowConsent(false);
  };

  const handleReject = () => {
    const rejected = { necessary: true, analytics: false, marketing: false };
    localStorage.setItem('cookie-consent', JSON.stringify(rejected));
    onAccept(rejected);
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Cookie className="h-6 w-6 text-amber-600" />
                <h2 className="text-xl font-bold text-gray-900">Cookie Policy</h2>
              </div>
              <button
                onClick={handleReject}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                Utilizziamo i cookie per migliorare la tua esperienza sul nostro sito web, 
                analizzare il traffico e personalizzare i contenuti. Puoi scegliere quali 
                cookie accettare.
              </p>
            </div>

            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-6 space-y-4"
              >
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Cookie Necessari</h3>
                    <input
                      type="checkbox"
                      checked={preferences.necessary}
                      disabled
                      className="rounded border-gray-300"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Essenziali per il funzionamento del sito web. Non possono essere disabilitati.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Cookie Analitici</h3>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Ci aiutano a capire come i visitatori interagiscono con il sito web.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Cookie Marketing</h3>
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Utilizzati per tracciare i visitatori sui siti web per mostrare annunci pertinenti.
                  </p>
                </div>
              </motion.div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                <Settings className="h-4 w-4" />
                {showDetails ? 'Nascondi dettagli' : 'Personalizza impostazioni'}
              </button>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleAcceptAll}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Accetta tutti i cookie
                </button>
                
                {showDetails && (
                  <button
                    onClick={handleAcceptSelected}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Accetta selezionati
                  </button>
                )}
                
                <button
                  onClick={handleReject}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Rifiuta tutti
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Conforme al GDPR e alle normative italiane sui cookie
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieConsent;