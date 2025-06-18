import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

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

  const handleUserSelect = async (userType: 'alessandro' | 'gabriel' | 'hanna') => {
    try {
      const result = await login(userType, '');
      
      if (result.success) {
        toast.success(`Benvenuto${userType === 'alessandro' ? ', Alessandro!' : 
                      userType === 'gabriel' ? ', Gabriel!' : 
                      userType === 'hanna' ? ', Hanna!' : '!'}`);
        
        // Reindirizza alla dashboard dopo il login
        navigate('/');
      } else {
        toast.error('Errore durante l\'accesso. Riprova.');
      }
    } catch (error) {
      console.error('Errore durante l\'accesso:', error);
      toast.error('Errore durante l\'accesso. Riprova.');
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
          <p className="text-gray-600">Seleziona il tuo profilo per accedere al sistema ERP Alcafer & Gabifer</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleUserSelect('alessandro')}
            className="w-full flex items-center p-4 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-xl transition-colors border border-red-200"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center mr-4">
              <span className="text-white text-lg font-bold">A</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Alessandro Calabria</h3>
              <p className="text-sm text-gray-600">Amministratore</p>
            </div>
          </button>

          <button
            onClick={() => handleUserSelect('gabriel')}
            className="w-full flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-colors border border-blue-200"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mr-4">
              <span className="text-white text-lg font-bold">G</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Gabriel Prunaru</h3>
              <p className="text-sm text-gray-600">Operatore</p>
            </div>
          </button>

          <button
            onClick={() => handleUserSelect('hanna')}
            className="w-full flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-colors border border-green-200"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center mr-4">
              <span className="text-white text-lg font-bold">H</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Hanna Mazhar</h3>
              <p className="text-sm text-gray-600">Contabilità</p>
            </div>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <p>Seleziona il tuo profilo per accedere al sistema</p>
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