import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedUser, setSelectedUser] = useState<'alessandro' | 'gabriel' | 'hanna' | null>(null);
  const [pin, setPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  // PIN personali (in un'app reale sarebbero criptati e memorizzati in modo sicuro)
  const userPins = {
    alessandro: '1234',
    gabriel: '5678',
    hanna: '9012'
  };

  useEffect(() => {
    // Initialize audio
    const audio = new Audio('https://soundbible.com/mp3/meadow-wind-and-chimes-nature-sounds-7802.mp3');
    audio.loop = true;
    audio.volume = volume / 100;
    audioRef.current = audio;

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    // Update volume when it changes
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play().catch(err => {
        console.log('Playback error:', err);
        toast.error('Errore nella riproduzione. Clicca di nuovo per riprovare.');
      });
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume / 100;
    }
  };

  const handleUserSelect = (userType: 'alessandro' | 'gabriel' | 'hanna') => {
    setSelectedUser(userType);
    setShowPinInput(true);
    setPin('');
  };

  const handlePinSubmit = async () => {
    if (!selectedUser) return;
    
    // Verifica il PIN
    if (pin === userPins[selectedUser]) {
      try {
        const result = await login(selectedUser, '');
        
        if (result.success) {
          toast.success(`Benvenuto${selectedUser === 'alessandro' ? ', Alessandro!' : 
                        selectedUser === 'gabriel' ? ', Gabriel!' : 
                        selectedUser === 'hanna' ? ', Hanna!' : '!'}`);
          
          // Reindirizza alla dashboard dopo il login
          navigate('/');
        } else {
          toast.error('Errore durante l\'accesso. Riprova.');
        }
      } catch (error) {
        console.error('Errore durante l\'accesso:', error);
        toast.error('Errore durante l\'accesso. Riprova.');
      }
    } else {
      toast.error('PIN non valido. Riprova.');
      setPin('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePinSubmit();
    }
  };

  const getUserColor = (userType: 'alessandro' | 'gabriel' | 'hanna') => {
    switch (userType) {
      case 'alessandro': return {
        bg: 'from-red-50 to-red-100 hover:from-red-100 hover:to-red-200',
        border: 'border-red-200',
        gradient: 'from-red-600 to-red-700'
      };
      case 'gabriel': return {
        bg: 'from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200',
        border: 'border-blue-200',
        gradient: 'from-blue-600 to-blue-700'
      };
      case 'hanna': return {
        bg: 'from-green-50 to-green-100 hover:from-green-100 hover:to-green-200',
        border: 'border-green-200',
        gradient: 'from-green-600 to-green-700'
      };
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

      {/* Audio Controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3 bg-white/20 backdrop-blur-sm p-3 rounded-full">
        <button 
          onClick={toggleAudio}
          className="p-2 bg-white/30 hover:bg-white/40 rounded-full transition-colors text-white"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        
        <div className="hidden md:flex items-center gap-2">
          <button 
            onClick={toggleMute}
            className="text-white"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseInt(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
        </div>
      </div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Benvenuto</h2>
          <p className="text-gray-600">
            {showPinInput && selectedUser 
              ? `Inserisci il tuo PIN personale, ${selectedUser === 'alessandro' ? 'Alessandro' : selectedUser === 'gabriel' ? 'Gabriel' : 'Hanna'}`
              : 'Seleziona il tuo profilo per accedere al sistema ERP Alcafer & Gabifer'}
          </p>
        </div>

        {!showPinInput ? (
          <div className="space-y-4">
            <button
              onClick={() => handleUserSelect('alessandro')}
              className={`w-full flex items-center p-4 bg-gradient-to-r ${getUserColor('alessandro').bg} rounded-xl transition-colors border ${getUserColor('alessandro').border}`}
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${getUserColor('alessandro').gradient} rounded-full flex items-center justify-center mr-4`}>
                <span className="text-white text-lg font-bold">A</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Alessandro Calabria</h3>
                <p className="text-sm text-gray-600">Amministratore</p>
              </div>
            </button>

            <button
              onClick={() => handleUserSelect('gabriel')}
              className={`w-full flex items-center p-4 bg-gradient-to-r ${getUserColor('gabriel').bg} rounded-xl transition-colors border ${getUserColor('gabriel').border}`}
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${getUserColor('gabriel').gradient} rounded-full flex items-center justify-center mr-4`}>
                <span className="text-white text-lg font-bold">G</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Gabriel Prunaru</h3>
                <p className="text-sm text-gray-600">Operatore</p>
              </div>
            </button>

            <button
              onClick={() => handleUserSelect('hanna')}
              className={`w-full flex items-center p-4 bg-gradient-to-r ${getUserColor('hanna').bg} rounded-xl transition-colors border ${getUserColor('hanna').border}`}
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${getUserColor('hanna').gradient} rounded-full flex items-center justify-center mr-4`}>
                <span className="text-white text-lg font-bold">H</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Hanna Mazhar</h3>
                <p className="text-sm text-gray-600">Contabilità</p>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {selectedUser && (
              <div className={`flex items-center p-4 bg-gradient-to-r ${getUserColor(selectedUser).bg} rounded-xl border ${getUserColor(selectedUser).border}`}>
                <div className={`w-12 h-12 bg-gradient-to-r ${getUserColor(selectedUser).gradient} rounded-full flex items-center justify-center mr-4`}>
                  <span className="text-white text-lg font-bold">
                    {selectedUser === 'alessandro' ? 'A' : selectedUser === 'gabriel' ? 'G' : 'H'}
                  </span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">
                    {selectedUser === 'alessandro' ? 'Alessandro Calabria' : 
                     selectedUser === 'gabriel' ? 'Gabriel Prunaru' : 'Hanna Mazhar'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedUser === 'alessandro' ? 'Amministratore' : 
                     selectedUser === 'gabriel' ? 'Operatore' : 'Contabilità'}
                  </p>
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
                Inserisci il tuo PIN personale
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Inserisci il tuo PIN"
                  maxLength={4}
                  autoFocus
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Per questa demo, il PIN di Alessandro è 1234, Gabriel è 5678, Hanna è 9012
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPinInput(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Indietro
              </button>
              <button
                onClick={handlePinSubmit}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Accedi
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <p>Ogni utente ha un PIN personale per garantire la sicurezza</p>
            <p className="mt-2 text-xs text-gray-500">
              Versione 1.0.0 - © 2025 Alcafer & Gabifer
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;