import React, { useState, useEffect } from 'react';
import { Smartphone, X, ArrowDown, Share, Menu, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddToHomeScreenProps {
  onClose?: () => void;
}

const AddToHomeScreen: React.FC<AddToHomeScreenProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already shown or added to home screen
    const hasShown = localStorage.getItem('addToHomeScreenShown');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (hasShown || isStandalone) {
      return;
    }
    
    // Detect operating system
    const userAgent = navigator.userAgent || navigator.vendor;
    
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      setPlatform('ios');
      setIsVisible(true);
    } else if (/android/i.test(userAgent)) {
      setPlatform('android');
      setIsVisible(true);
    }
    
    // Handle PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setPlatform('android');
      setIsVisible(true);
    });
    
    // Mark as shown
    localStorage.setItem('addToHomeScreenShown', 'true');
    
    return () => {
      window.removeEventListener('beforeinstallprompt', (e) => {
        setDeferredPrompt(null);
      });
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    
    // Hide the banner
    handleClose();
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
                  <li className="flex items-center gap-2">
                    <span>Tocca l'icona di condivisione</span>
                    <Share className="h-4 w-4 text-gray-600" />
                  </li>
                  <li className="flex items-center gap-2">
                    <span>Scorri e tocca</span>
                    <span className="font-medium">"Aggiungi a Home"</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>Conferma toccando</span>
                    <span className="font-medium">"Aggiungi"</span>
                  </li>
                </ol>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-center">
                    <div className="flex flex-col items-center">
                      <Share className="h-8 w-8 text-gray-600 mb-2" />
                      <ArrowDown className="h-5 w-5 text-gray-600 animate-bounce" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {platform === 'android' && deferredPrompt && (
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  Aggiungi questa app alla tua schermata Home per un accesso più rapido:
                </p>
                <button
                  onClick={handleInstallClick}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Installa App
                </button>
              </div>
            )}

            {platform === 'android' && !deferredPrompt && (
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  Per aggiungere questa app alla tua schermata Home:
                </p>
                <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                  <li className="flex items-center gap-2">
                    <span>Tocca i tre puntini</span>
                    <Menu className="h-4 w-4 text-gray-600" />
                  </li>
                  <li className="flex items-center gap-2">
                    <span>Seleziona</span>
                    <span className="font-medium">"Aggiungi a schermata Home"</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>Conferma toccando</span>
                    <span className="font-medium">"Aggiungi"</span>
                  </li>
                </ol>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-center">
                    <div className="flex flex-col items-center">
                      <Menu className="h-8 w-8 text-gray-600 mb-2" />
                      <ArrowDown className="h-5 w-5 text-gray-600 animate-bounce" />
                    </div>
                  </div>
                </div>
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
