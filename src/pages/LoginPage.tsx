import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Volume2, VolumeX, Play, Pause, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import MeditationPlayer from '../components/common/MeditationPlayer';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const { switchUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Determine which user to log in based on email
      if (email === 'assistenza.alcafer@gmail.com' || email.toLowerCase().includes('alessandro')) {
        switchUser('alessandro');
        toast.success('Benvenuto, Alessandro!');
      } else if (email === 'gabifervoghera@gmail.com' || email.toLowerCase().includes('gabriel')) {
        switchUser('gabriel');
        toast.success('Benvenuto, Gabriel!');
      } else if (email === 'nuta1985@icloud.com' || email.toLowerCase().includes('hanna')) {
        switchUser('hanna');
        toast.success('Benvenuto, Hanna!');
      } else {
        // Default to Alessandro if email doesn't match
        switchUser('alessandro');
        toast.success('Benvenuto!');
      }
    } catch (error) {
      console.error('Errore durante il login:', error);
      toast.error('Errore durante il login. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg?auto=compress&cs=tinysrgb&w=1920" 
          alt="Mountain Landscape" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Audio Player */}
      <div className="absolute top-6 right-6 z-20">
        <MeditationPlayer autoplay={true} />
      </div>

      {/* Info Button */}
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="absolute top-6 left-6 z-20 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
      >
        <Info className="h-5 w-5" />
      </button>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-20 left-6 z-20 bg-white/20 backdrop-blur-md p-4 rounded-xl max-w-xs text-white"
          >
            <h3 className="font-medium mb-2">Informazioni Accesso</h3>
            <p className="text-sm mb-3">
              Questo è un sistema di gestione aziendale per Alcafer & Gabifer. Puoi accedere con uno dei seguenti account:
            </p>
            <ul className="text-sm space-y-1">
              <li><strong>Alessandro:</strong> assistenza.alcafer@gmail.com</li>
              <li><strong>Gabriel:</strong> gabifervoghera@gmail.com</li>
              <li><strong>Hanna:</strong> nuta1985@icloud.com</li>
            </ul>
            <p className="text-xs mt-3 text-white/80">
              La password può essere qualsiasi valore in questa demo
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Benvenuto</h2>
          <p className="text-gray-600">Accedi al sistema ERP Alcafer & Gabifer</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Inserisci la tua email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Inserisci la tua password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Ricordami
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Password dimenticata?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Accesso in corso...
                </div>
              ) : (
                'Accedi'
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <p>Per accedere, utilizza una delle seguenti email:</p>
            <div className="mt-2 space-y-1 font-medium">
              <p>Alessandro: assistenza.alcafer@gmail.com</p>
              <p>Gabriel: gabifervoghera@gmail.com</p>
              <p>Hanna: nuta1985@icloud.com</p>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              La password può essere qualsiasi valore in questa demo
            </p>
          </div>
        </div>
      </motion.div>

      {/* Mountain Cabin */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-5 w-full max-w-md">
        <img 
          src="https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg?auto=compress&cs=tinysrgb&w=1920" 
          alt="Mountain Cabin" 
          className="w-full h-auto"
          style={{ opacity: 0 }} // Hidden image, just for reference
        />
      </div>
    </div>
  );
};

export default LoginPage;