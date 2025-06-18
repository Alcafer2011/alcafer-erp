import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface MeditationPlayerProps {
  autoplay?: boolean;
  onTogglePlay?: (isPlaying: boolean) => void;
}

const MeditationPlayer: React.FC<MeditationPlayerProps> = ({ autoplay = false, onTogglePlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Meditation tracks
  const meditationTracks = [
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
    },
    {
      name: 'Mountain Stream',
      url: 'https://soundbible.com/mp3/stream-1-SoundBible.com-1641121904.mp3',
      artist: 'Mountain Sounds'
    },
    {
      name: 'Gentle Rain',
      url: 'https://soundbible.com/mp3/rain_inside_house-Mike_Koenig-1233099289.mp3',
      artist: 'Rain Sounds'
    }
  ];

  useEffect(() => {
    // Initialize audio
    const audio = new Audio(meditationTracks[currentTrack].url);
    audio.loop = false;
    audio.volume = volume / 100;
    audio.addEventListener('ended', handleTrackEnd);
    audioRef.current = audio;

    if (autoplay) {
      audio.play().catch(err => {
        console.log('Autoplay prevented by browser, user interaction required');
      });
      setIsPlaying(true);
    }

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleTrackEnd);
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    // Update audio source when track changes
    if (audioRef.current) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.src = meditationTracks[currentTrack].url;
      if (wasPlaying) {
        audioRef.current.play().catch(err => {
          console.log('Playback error:', err);
        });
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    // Update volume when it changes
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const handleTrackEnd = () => {
    nextTrack();
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        toast.error('Errore nella riproduzione. Clicca di nuovo per riprovare.');
      });
    }
    
    setIsPlaying(!isPlaying);
    if (onTogglePlay) onTogglePlay(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % meditationTracks.length);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + meditationTracks.length) % meditationTracks.length);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 shadow-lg">
      <div className="flex items-center gap-3">
        <button 
          onClick={prevTrack}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <SkipBack className="h-5 w-5" />
        </button>
        
        <button 
          onClick={togglePlayback}
          className="p-3 bg-white/30 hover:bg-white/40 text-white rounded-full transition-colors shadow-lg"
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </button>
        
        <button 
          onClick={nextTrack}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <SkipForward className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleMute}
            className="text-white/80 hover:text-white transition-colors"
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
      
      <div className="mt-2 text-center">
        <p className="text-sm text-white font-medium">
          {meditationTracks[currentTrack].name}
        </p>
        <p className="text-xs text-white/70">
          {meditationTracks[currentTrack].artist}
        </p>
      </div>
    </div>
  );
};

export default MeditationPlayer;