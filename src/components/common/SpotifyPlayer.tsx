import React, { useState, useEffect } from 'react';
import { Music, ExternalLink, RefreshCw, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Disc, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface SpotifyPlayerProps {
  defaultPlaylist?: string;
}

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ defaultPlaylist = '37i9dQZF1DX8Uebhn9wzrS' }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSpotifyToken, setHasSpotifyToken] = useState(false);
  const [playlistId, setPlaylistId] = useState(defaultPlaylist);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  // Playlist di musica rilassante predefinite
  const relaxingPlaylists = [
    { id: '37i9dQZF1DX8Uebhn9wzrS', name: 'Peaceful Piano', image: 'https://i.scdn.co/image/ab67706f00000003ca5a7517156021292e5663a4' },
    { id: '37i9dQZF1DWZqd5JICZI0u', name: 'Peaceful Meditation', image: 'https://i.scdn.co/image/ab67706f00000003e4eadd417a05b2546e866934' },
    { id: '37i9dQZF1DX3Ogo9pFvBkY', name: 'Ambient Chill', image: 'https://i.scdn.co/image/ab67706f000000034d26d431869cabfc53c67d8e' },
    { id: '37i9dQZF1DX1s9knjP51Oa', name: 'Calm Before the Storm', image: 'https://i.scdn.co/image/ab67706f000000035f55eb92a797dfd5ab3fb9b8' },
    { id: '37i9dQZF1DX9uKNf5jGX6m', name: 'Relaxing Massage', image: 'https://i.scdn.co/image/ab67706f00000003b70e0223f544b1faa2e95ed9' }
  ];

  // Tracce di musica rilassante gratuite
  const freeTracks = [
    { 
      name: 'Peaceful Meditation', 
      url: 'https://soundbible.com/mp3/meadow-wind-and-chimes-nature-sounds-7802.mp3',
      artist: 'Nature Sounds',
      album: 'Meditation Collection',
      image: 'https://i.scdn.co/image/ab67706f00000003ca5a7517156021292e5663a4'
    },
    { 
      name: 'Ocean Waves', 
      url: 'https://soundbible.com/mp3/Ocean_Waves-Mike_Koenig-980635527.mp3',
      artist: 'Nature Sounds',
      album: 'Ocean Collection',
      image: 'https://i.scdn.co/image/ab67706f00000003e4eadd417a05b2546e866934'
    },
    { 
      name: 'Forest Birds', 
      url: 'https://soundbible.com/mp3/songbird-daniel-simion.mp3',
      artist: 'Nature Sounds',
      album: 'Forest Collection',
      image: 'https://i.scdn.co/image/ab67706f000000034d26d431869cabfc53c67d8e'
    }
  ];

  useEffect(() => {
    // Inizializza il player audio
    const audio = new Audio();
    audio.loop = true;
    audio.volume = volume / 100;
    setAudioPlayer(audio);
    
    // Controlla se l'utente ha già un token Spotify salvato
    const token = localStorage.getItem('spotify_token');
    if (token) {
      setHasSpotifyToken(true);
      connectToSpotify();
    }
    
    // Controlla se c'è un token nell'URL (dopo il reindirizzamento da Spotify)
    const hash = window.location.hash;
    if (hash) {
      const token = hash.substring(1).split('&').find(elem => elem.startsWith('access_token'))?.split('=')[1];
      if (token) {
        localStorage.setItem('spotify_token', token);
        setHasSpotifyToken(true);
        connectToSpotify();
        // Pulisci l'URL
        window.location.hash = '';
      }
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);

  useEffect(() => {
    // Aggiorna il volume quando cambia
    if (audioPlayer) {
      audioPlayer.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const connectToSpotify = () => {
    setIsLoading(true);
    
    // Simula connessione a Spotify
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
      setCurrentTrack({
        name: 'Peaceful Piano',
        artist: 'Relaxing Music',
        album: 'Meditation Sounds',
        image: 'https://i.scdn.co/image/ab67706f00000003ca5a7517156021292e5663a4'
      });
      
      // Avvia la riproduzione di una traccia gratuita
      if (audioPlayer) {
        audioPlayer.src = freeTracks[0].url;
        audioPlayer.play().catch(err => {
          console.log('Autoplay prevented by browser, user interaction required');
        });
        setIsPlaying(true);
      }
      
      toast.success('Connesso a Spotify');
    }, 1500);
  };

  const authorizeSpotify = () => {
    // In un'app reale, reindirizza a Spotify per l'autorizzazione
    const clientId = 'your_spotify_client_id';
    const redirectUri = window.location.origin;
    const scopes = 'user-read-private user-read-email user-modify-playback-state user-read-playback-state';
    
    toast.success('Simulazione connessione a Spotify...');
    connectToSpotify();
    
    // Codice reale per la redirezione a Spotify
    // window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scopes)}&response_type=token`;
  };

  const togglePlayback = () => {
    if (audioPlayer) {
      if (isPlaying) {
        audioPlayer.pause();
      } else {
        audioPlayer.play().catch(err => {
          toast.error('Errore nella riproduzione. Clicca di nuovo per riprovare.');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const changeTrack = (direction: 'next' | 'prev') => {
    if (!audioPlayer) return;
    
    setIsLoading(true);
    
    // Trova l'indice della traccia corrente
    const currentIndex = freeTracks.findIndex(track => track.url === audioPlayer.src);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % freeTracks.length;
    } else {
      newIndex = (currentIndex - 1 + freeTracks.length) % freeTracks.length;
    }
    
    // Cambia traccia
    const newTrack = freeTracks[newIndex];
    audioPlayer.src = newTrack.url;
    
    // Aggiorna UI
    setCurrentTrack({
      name: newTrack.name,
      artist: newTrack.artist,
      album: newTrack.album,
      image: newTrack.image
    });
    
    // Riproduci
    audioPlayer.play().then(() => {
      setIsPlaying(true);
      setIsLoading(false);
    }).catch(err => {
      setIsLoading(false);
      toast.error('Errore nella riproduzione. Clicca play per riprovare.');
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioPlayer) {
      audioPlayer.volume = !isMuted ? 0 : volume / 100;
    }
  };

  const changePlaylist = (id: string) => {
    setPlaylistId(id);
    setIsLoading(true);
    
    // Simula cambio playlist
    setTimeout(() => {
      const playlist = relaxingPlaylists.find(p => p.id === id);
      setCurrentTrack({
        name: `${playlist?.name} Track 1`,
        artist: 'Various Artists',
        album: playlist?.name,
        image: playlist?.image || 'https://i.scdn.co/image/ab67706f00000003ca5a7517156021292e5663a4'
      });
      
      // Cambia traccia audio
      if (audioPlayer) {
        // Seleziona una traccia casuale
        const randomTrack = freeTracks[Math.floor(Math.random() * freeTracks.length)];
        audioPlayer.src = randomTrack.url;
        audioPlayer.play().catch(err => {
          console.log('Playback error:', err);
        });
      }
      
      setIsLoading(false);
      setIsPlaying(true);
    }, 1000);
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 border border-purple-700 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/20 rounded-full">
            <Headphones className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Spotify Connect
          </h3>
        </div>
        <a 
          href="https://open.spotify.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-white/80 hover:text-white flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          Apri Spotify
        </a>
      </div>

      {!isConnected ? (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music className="h-10 w-10 text-white" />
          </div>
          <h4 className="text-lg font-medium text-white mb-2">Connetti il tuo account Spotify</h4>
          <p className="text-sm text-white/80 mb-4">
            Ascolta la tua musica preferita mentre lavori
          </p>
          <button
            onClick={authorizeSpotify}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-full font-medium transition-colors flex items-center gap-2 mx-auto"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Connessione...
              </>
            ) : (
              <>
                <Music className="h-4 w-4" />
                Connetti a Spotify
              </>
            )}
          </button>
        </div>
      ) : (
        <div>
          {/* Player UI */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
              <img 
                src={currentTrack?.image || 'https://i.scdn.co/image/ab67706f00000003ca5a7517156021292e5663a4'} 
                alt="Album cover" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white truncate">{currentTrack?.name || 'Nessuna traccia'}</h4>
              <p className="text-sm text-white/80 truncate">{currentTrack?.artist || 'Artista sconosciuto'}</p>
              <p className="text-xs text-white/60 truncate">{currentTrack?.album || 'Album sconosciuto'}</p>
              
              {isPlaying && (
                <div className="flex items-center gap-1 mt-1">
                  <Disc className="h-3 w-3 text-white/60 animate-spin" />
                  <span className="text-xs text-white/60">In riproduzione</span>
                </div>
              )}
            </div>
          </div>

          {/* Controlli */}
          <div className="bg-white/10 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => changeTrack('prev')}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              
              <button 
                onClick={togglePlayback}
                className="p-4 bg-white text-indigo-600 hover:bg-white/90 rounded-full transition-colors shadow-lg"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>
              
              <button 
                onClick={() => changeTrack('next')}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleMute}
                className="text-white/80 hover:text-white"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
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
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
              <span className="text-xs text-white/80 w-8 text-right">{isMuted ? 0 : volume}%</span>
            </div>
          </div>

          {/* Playlist */}
          <div>
            <h5 className="text-sm font-medium text-white/90 mb-2">Playlist Rilassanti</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {relaxingPlaylists.map(playlist => (
                <button
                  key={playlist.id}
                  onClick={() => changePlaylist(playlist.id)}
                  className={`text-left p-2 rounded-lg text-sm transition-colors ${
                    playlistId === playlist.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-white/10 hover:bg-white/15 text-white/80'
                  }`}
                >
                  {playlist.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotifyPlayer;