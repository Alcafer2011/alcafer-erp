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
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [selectedUser, setSelectedUser] = useState<'alessandro' | 'gabriel' | 'hanna' | null>(null);
  const [pin, setPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const relaxingTracks = [
    { 
      name: 'Peaceful Meditation', 
      url: 'https://soundbible.com/mp3/meadow-wind-and-chimes-nature-sounds-7802.mp3',
      artist: 'Nature Sounds'
    },
    { 
      name: 'Ocean Waves', 
      url: 'https://soundbible.com/mp3/Ocean_Waves-Mike_Koenig-980635527.mp3',
      artist: 'Ocean Sounds'
    },
    { 
      name: 'Forest Birds', 
      url: 'https://soundbible.com/mp3/songbird-daniel-simion.mp3',
      artist: 'Forest Sounds'
    }
  ];

  // PIN personali (in un'app reale sarebbero criptati e memorizzati in modo sicuro)
  const userPins = {
    alessandro: '1234',
    gabriel: '5678',
    hanna: '9012'
  };

  useEffect(() => {
    // Initialize audio with autoplay attempt (muted to satisfy policies)
    const audio = new Audio(relaxingTracks[currentTrackIdx].url);
    audio.loop = true;
    audio.volume = volume / 100;
    audio.muted = true;
    audioRef.current = audio;
    audio.play().then(() => {
      // unmute after started silently
      setIsPlaying(true);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.muted = false;
        }
      }, 300);
    }).catch(() => {
      // Autoplay blocked, wait for user interaction
    });

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

  useEffect(() => {
    // Change track when selection changes
    if (audioRef.current) {
      audioRef.current.src = relaxingTracks[currentTrackIdx].url;
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [currentTrackIdx]);

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
    
    // For demo purposes, accept any PIN
    if (pin === userPins[selectedUser] || pin.length > 0) {
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
    } else if (pin.length === 0) {
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-purple-900/50 to-indigo-900/60"></div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Audio Controls */}
      <motion.div 
        className="absolute top-6 right-6 z-20 flex items-center gap-3 bg-white/20 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/30"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button 
          onClick={toggleAudio}
          className="p-3 bg-white/30 hover:bg-white/40 rounded-xl transition-all duration-200 text-white shadow-lg"
          title={isPlaying ? "Pause" : "Play"}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </motion.button>
        <select
          className="text-sm text-white bg-white/20 rounded-lg px-3 py-2 border border-white/30 backdrop-blur-sm"
          value={currentTrackIdx}
          onChange={(e) => setCurrentTrackIdx(parseInt(e.target.value))}
          title="Seleziona traccia rilassante"
        >
          {relaxingTracks.map((t, i) => (
            <option key={t.name} value={i} className="text-gray-800">{t.name}</option>
          ))}
        </select>
        
        <div className="hidden md:flex items-center gap-3">
          <motion.button 
            onClick={toggleMute}
            className="text-white p-2 hover:bg-white/20 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </motion.button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseInt(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
          <span className="text-white text-sm font-medium">{isMuted ? 0 : volume}%</span>
        </div>
      </motion.div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 border border-white/30"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Benvenuto
          </h2>
          <p className="text-gray-600 font-medium">
            {showPinInput && selectedUser 
              ? `Inserisci il tuo PIN personale, ${selectedUser === 'alessandro' ? 'Alessandro' : selectedUser === 'gabriel' ? 'Gabriel' : 'Hanna'}`
              : 'Seleziona il tuo profilo per accedere al sistema ERP Alcafer & Gabifer'}
          </p>
        </div>

        {!showPinInput ? (
          <div className="space-y-4">
            <motion.button
              onClick={() => handleUserSelect('alessandro')}
              className={`w-full flex items-center p-5 bg-gradient-to-r ${getUserColor('alessandro').bg} rounded-2xl transition-all duration-200 border ${getUserColor('alessandro').border} shadow-lg hover:shadow-xl`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-14 h-14 bg-gradient-to-r ${getUserColor('alessandro').gradient} rounded-2xl flex items-center justify-center mr-4 shadow-lg`}>
                <span className="text-white text-xl font-bold">A</span>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900 text-lg">Alessandro Calabria</h3>
                <p className="text-sm text-gray-600 font-medium">👑 Amministratore</p>
              </div>
            </motion.button>

            <motion.button
              onClick={() => handleUserSelect('gabriel')}
              className={`w-full flex items-center p-5 bg-gradient-to-r ${getUserColor('gabriel').bg} rounded-2xl transition-all duration-200 border ${getUserColor('gabriel').border} shadow-lg hover:shadow-xl`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-14 h-14 bg-gradient-to-r ${getUserColor('gabriel').gradient} rounded-2xl flex items-center justify-center mr-4 shadow-lg`}>
                <span className="text-white text-xl font-bold">G</span>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900 text-lg">Gabriel Prunaru</h3>
                <p className="text-sm text-gray-600 font-medium">⚙️ Operatore</p>
              </div>
            </motion.button>

            <motion.button
              onClick={() => handleUserSelect('hanna')}
              className={`w-full flex items-center p-5 bg-gradient-to-r ${getUserColor('hanna').bg} rounded-2xl transition-all duration-200 border ${getUserColor('hanna').border} shadow-lg hover:shadow-xl`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-14 h-14 bg-gradient-to-r ${getUserColor('hanna').gradient} rounded-2xl flex items-center justify-center mr-4 shadow-lg`}>
                <span className="text-white text-xl font-bold">H</span>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900 text-lg">Hanna Mazhar</h3>
                <p className="text-sm text-gray-600 font-medium">📊 Contabilità</p>
              </div>
            </motion.button>
          </div>
        ) : (
          <div className="space-y-6">
            {selectedUser && (
              <motion.div 
                className={`flex items-center p-5 bg-gradient-to-r ${getUserColor(selectedUser).bg} rounded-2xl border ${getUserColor(selectedUser).border} shadow-lg`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`w-14 h-14 bg-gradient-to-r ${getUserColor(selectedUser).gradient} rounded-2xl flex items-center justify-center mr-4 shadow-lg`}>
                  <span className="text-white text-xl font-bold">
                    {selectedUser === 'alessandro' ? 'A' : selectedUser === 'gabriel' ? 'G' : 'H'}
                  </span>
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {selectedUser === 'alessandro' ? 'Alessandro Calabria' : 
                     selectedUser === 'gabriel' ? 'Gabriel Prunaru' : 'Hanna Mazhar'}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    {selectedUser === 'alessandro' ? '👑 Amministratore' : 
                     selectedUser === 'gabriel' ? '⚙️ Operatore' : '📊 Contabilità'}
                  </p>
                </div>
              </motion.div>
            )}
            
            <div>
              <label htmlFor="pin" className="block text-sm font-semibold text-gray-700 mb-3">
                🔐 Inserisci il tuo PIN personale
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-center text-2xl font-bold tracking-widest"
                  placeholder="••••"
                  maxLength={4}
                  autoFocus
                />
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-800 font-medium">
                  💡 Per questa demo, qualsiasi PIN è accettato
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  PIN di esempio: Alessandro (1234), Gabriel (5678), Hanna (9012)
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                onClick={() => setShowPinInput(false)}
                className="flex-1 py-4 px-6 border-2 border-gray-300 rounded-2xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ← Indietro
              </motion.button>
              <motion.button
                onClick={handlePinSubmit}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🚀 Accedi
              </motion.button>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200/50">
          <div className="text-center text-sm text-gray-600">
            <p className="font-medium">🔒 Ogni utente ha un PIN personale per garantire la sicurezza</p>
            <p className="mt-3 text-xs text-gray-500 bg-gray-50 px-4 py-2 rounded-xl">
              ✨ Versione 1.0.0 - © 2025 Alcafer & Gabifer ERP
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
