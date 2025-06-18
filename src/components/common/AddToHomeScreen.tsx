import React, { useState, useEffect } from 'react';
import { Smartphone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddToHomeScreenProps {
  onClose?: () => void;
}

const AddToHomeScreen: React.FC<AddToHomeScreenProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    // Controlla se è già stato mostrato
    const hasShown = localStorage.getItem('addToHomeScreenShown');
    
    if (!hasShown) {
      // Rileva il sistema operativo
      const userAgent = navigator.userAgent || navigator.vendor;
      
      if (/iPad|iPhone|iPod/.test(userAgent)) {
        setPlatform('ios');
        setIsVisible(true);
      } else if (/android/i.test(userAgent)) {
        setPlatform('android');
        setIsVisible(true);
      }
      
      // Segna come mostrato
      localStorage.setItem('addToHomeScreenShown', 'true');
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 z-50"
      >
        <div className="bg-white rounded-xl shadow-xl p-4 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Smartphone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Aggiungi alla Home
                </h3>
                <p className="text-sm text-gray-600">
                  Accedi più velocemente all'app
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4">
            {platform === 'ios' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  Per aggiungere questa app alla tua schermata Home:
                </p>
                <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                  <li>Tocca l'icona di condivisione <span className="inline-block px-2 py-1 bg-gray-100 rounded">📤</span> nella barra degli strumenti del browser</li>
                  <li>Scorri e tocca <span className="font-medium">"Aggiungi a Home"</span></li>
                  <li>Conferma toccando <span className="font-medium">"Aggiungi"</span></li>
                </ol>
              </div>
            )}

            {platform === 'android' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  Per aggiungere questa app alla tua schermata Home:
                </p>
                <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                  <li>Tocca i tre puntini <span className="inline-block px-2 py-1 bg-gray-100 rounded">⋮</span> in alto a destra</li>
                  <li>Seleziona <span className="font-medium">"Aggiungi a schermata Home"</span></li>
                  <li>Conferma toccando <span className="font-medium">"Aggiungi"</span></li>
                </ol>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Ho capito
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddToHomeScreen;