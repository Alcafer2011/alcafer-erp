import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Radio, Volume2, VolumeX } from 'lucide-react';

const STATIONS = [
  { name: 'Radio 105', url: 'https://streaming.radio105.it/radio105' },
  { name: 'Virgin Radio', url: 'https://icecast.unitedradio.it/VirginRadio' },
  { name: 'Radio Italia', url: 'https://streaming.radioitalia.it/radioitalia' },
  { name: 'RTL 102.5', url: 'https://streamingv2.rtl.it/rtl1025' },
  { name: 'Radio Deejay', url: 'https://streamingv2.rtl.it/radiodeejay' },
  { name: 'Radio Monte Carlo', url: 'https://streaming.radiomontecarlo.net/rmc' },
  { name: 'Radio Capital', url: 'https://streaming.radiocapital.it/capital' },
  { name: 'Radio Kiss Kiss', url: 'https://streaming.radiokisskiss.it/kisskiss' },
  { name: 'Radio Zeta', url: 'https://streaming.radiozeta.it/radiozeta' },
  { name: 'Radio 24', url: 'https://streaming.radio24.it/radio24' },
];

const WebRadioPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(60);
  const [isMuted, setIsMuted] = useState(false);
  const [stationIdx, setStationIdx] = useState(0);

  useEffect(() => {
    const audio = new Audio(STATIONS[stationIdx].url);
    audio.preload = 'none';
    audio.volume = volume / 100;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = STATIONS[stationIdx].url;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    }
  }, [stationIdx]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <motion.div 
      className="fixed left-1/2 -translate-x-1/2 bottom-6 z-[900] bg-white/90 backdrop-blur-xl shadow-2xl border border-white/30 rounded-2xl px-6 py-4 flex items-center gap-4"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
          <Radio className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold text-gray-700">Radio</span>
      </div>
      
      <select
        className="text-sm border-2 border-gray-200 rounded-xl px-3 py-2 bg-white/80 backdrop-blur-sm min-w-[200px] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
        value={stationIdx}
        onChange={(e) => setStationIdx(parseInt(e.target.value))}
      >
        {STATIONS.map((s, i) => (
          <option key={s.name} value={i}>{s.name}</option>
        ))}
      </select>
      
      <motion.button 
        onClick={togglePlay} 
        className="p-3 rounded-xl hover:bg-purple-100 transition-all duration-200 bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
        title={isPlaying ? "Pausa" : "Riproduci"}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </motion.button>
      
      <div className="flex items-center gap-3">
        <motion.button 
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
          title={isMuted ? "Riattiva audio" : "Disattiva audio"}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isMuted ? <VolumeX className="h-4 w-4 text-gray-500" /> : <Volume2 className="h-4 w-4 text-gray-700" />}
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
          className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:shadow-lg"
        />
        <span className="text-xs text-gray-600 w-8 text-right font-medium">{isMuted ? 0 : volume}%</span>
      </div>
    </motion.div>
  );
};

export default WebRadioPlayer;







