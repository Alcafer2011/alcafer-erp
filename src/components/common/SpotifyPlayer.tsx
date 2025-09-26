import React, { useState, useEffect } from 'react';
import { Music, ExternalLink, RefreshCw, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Disc, Headphones, Heart, Clock, ListMusic, Shuffle, Repeat, Share2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import SpotifyAuth from './SpotifyAuth';

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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [isRepeatOn, setIsRepeatOn] = useState(false);
  const [showPlaylistPanel, setShowPlaylistPanel] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);

  // Playlist di musica rilassante predefinite
  const relaxingPlaylists = [
    { id: '37i9dQZF1DX8Uebhn9wzrS', name: 'Peaceful Piano', image: 'https://i.scdn.co/image/ab67706f00000003ca5a7517156021292e5663a4' },
    { id: '37i9dQZF1DWZqd5JICZI0u', name: 'Peaceful Meditation', image: 'https://i.scdn.co/image/ab67706f00000003e4eadd417a05b2546e866934' },
    { id: '37i9dQZF1DX3Ogo9pFvBkY', name: 'Ambient Chill', image: 'https://i.scdn.co/image/ab67706f000000034d26d431869cabfc53c67d8e' },
    { id: '37i9dQZF1DX1s9knjP51Oa', name: 'Calm Before the Storm', image: 'https://i.scdn.co/image/ab67706f000000035f55eb92a797dfd5ab3fb9b8' },
    { id: '37i9dQZF1DX9uKNf5jGX6m', name: 'Relaxing Massage', image: 'https://i.scdn.co/image/ab67706f00000003b70e0223f544b1faa2e95ed9' }
  ];

  // Tracce di musica rilassante gratuite - URL funzionanti
  const freeTracks = [
    { 
      name: 'Peaceful Meditation', 
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      artist: 'Nature Sounds',
      album: 'Meditation Collection',
      image: 'https://i.scdn.co/image/ab67706f00000003ca5a7517156021292e5663a4',
      duration: 180
    },
    { 
      name: 'Ocean Waves', 
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      artist: 'Nature Sounds',
      album: 'Ocean Collection',
      image: 'https://i.scdn.co/image/ab67706f00000003e4eadd417a05b2546e866934',
      duration: 164
    },
    { 
      name: 'Forest Birds', 
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      artist: 'Nature Sounds',
      album: 'Forest Collection',
      image: 'https://i.scdn.co/image/ab67706f000000034d26d431869cabfc53c67d8e',
      duration: 85
    },
    { 
      name: 'Rain Sounds', 
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      artist: 'Nature Sounds',
      album: 'Rain Collection',
      image: 'https://i.scdn.co/image/ab67706f000000035f55eb92a797dfd5ab3fb9b8',
      duration: 200
    },
    { 
      name: 'Wind Chimes', 
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      artist: 'Ambient',
      album: 'Ambient Collection',
      image: 'https://i.scdn.co/image/ab67706f00000003b70e0223f544b1faa2e95ed9',
      duration: 150
    }
  ];

  // Playlist tracks
  const playlistTracks = [
    { name: 'Peaceful Piano', artist: 'Piano Masters', duration: '3:45' },
    { name: 'Gentle Waves', artist: 'Ocean Sounds', duration: '4:12' },
    { name: 'Morning Light', artist: 'Ambient Collective', duration: '2:58' },
    { name: 'Meditation Space', artist: 'Zen Music Garden', duration: '5:30' },
    { name: 'Floating Dreams', artist: 'Sleep Therapy', duration: '3:22' },
    { name: 'Calm Mind', artist: 'Relaxation Project', duration: '4:05' }
  ];

  useEffect(() => {
    // Inizializza il player audio
    const audio = new Audio();
    audio.loop = false;
    audio.volume = volume / 100;
    
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });
    
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });
    
    audio.addEventListener('ended', () => {
      if (isRepeatOn) {
        audio.currentTime = 0;
        audio.play();
      } else if (isShuffleOn) {
        const randomIndex = Math.floor(Math.random() * freeTracks.length);
        changeToTrack(randomIndex);
      } else {
        changeTrack('next');
      }
    });
    
    setAudioPlayer(audio);
    
    // Controlla se l'utente ha già un token Spotify salvato
    const token = localStorage.getItem('spotify_token');
    if (token && token !== 'demo_token') {
      setSpotifyToken(token);
      setHasSpotifyToken(true);
      connectToSpotify();
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

  const handleSpotifyAuthSuccess = (token: string) => {
    setSpotifyToken(token);
    setHasSpotifyToken(true);
    connectToSpotify();
  };

  const handleSpotifyAuthError = (error: string) => {
    console.error('Spotify auth error:', error);
    toast.error('Errore durante l\'autenticazione Spotify');
  };

  const connectToSpotify = () => {
    setIsLoading(true);
    
    if (spotifyToken === 'demo_token') {
      // Modalità demo
      setTimeout(() => {
        setIsConnected(true);
        setIsLoading(false);
        setCurrentTrack({
          name: freeTracks[0].name,
          artist: freeTracks[0].artist,
          album: freeTracks[0].album,
          image: freeTracks[0].image
        });
        
        // Avvia la riproduzione di una traccia gratuita
        if (audioPlayer) {
          audioPlayer.src = freeTracks[0].url;
          audioPlayer.load();
          audioPlayer.play().catch(err => {
            console.log('Autoplay prevented by browser, user interaction required');
            toast('Clicca play per iniziare la riproduzione');
          });
          setIsPlaying(true);
          setDuration(freeTracks[0].duration);
        }
        
        toast.success('Connesso a Spotify - Modalità Demo');
      }, 1000);
    } else if (spotifyToken) {
      // Connessione reale a Spotify
      fetchSpotifyData();
    }
  };

  const fetchSpotifyData = async () => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${spotifyToken}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setIsConnected(true);
        setIsLoading(false);
        
        // Carica una playlist
        const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
          headers: {
            'Authorization': `Bearer ${spotifyToken}`
          }
        });

        if (playlistResponse.ok) {
          const playlistData = await playlistResponse.json();
          if (playlistData.tracks.items.length > 0) {
            const track = playlistData.tracks.items[0].track;
            setCurrentTrack({
              name: track.name,
              artist: track.artists[0].name,
              album: track.album.name,
              image: track.album.images[0]?.url
            });
          }
        }
        
        toast.success(`Benvenuto ${userData.display_name}!`);
      } else {
        throw new Error('Token non valido');
      }
    } catch (error) {
      console.error('Errore connessione Spotify:', error);
      setIsLoading(false);
      toast.error('Errore durante la connessione a Spotify');
    }
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
    
    changeToTrack(newIndex);
  };

  const changeToTrack = (index: number) => {
    if (!audioPlayer) return;
    
    const newTrack = freeTracks[index];
    audioPlayer.src = newTrack.url;
    audioPlayer.load(); // Carica il nuovo src
    
    // Aggiorna UI
    setCurrentTrack({
      name: newTrack.name,
      artist: newTrack.artist,
      album: newTrack.album,
      image: newTrack.image
    });
    
    setDuration(newTrack.duration);
    setCurrentTime(0);
    
    // Riproduci
    audioPlayer.play().then(() => {
      setIsPlaying(true);
      setIsLoading(false);
      toast.success(`In riproduzione: ${newTrack.name}`);
    }).catch(err => {
      setIsLoading(false);
      toast('Clicca play per iniziare la riproduzione');
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioPlayer) {
      const seekTime = parseFloat(e.target.value);
      audioPlayer.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-900 via-indigo-800 to-purple-800 rounded-xl p-6 border border-purple-700/50 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/20 rounded-full">
            <Headphones className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Spotify Premium
          </h3>
          <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">PRO</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Chiudi il pannello Spotify
              const event = new CustomEvent('closeSpotify');
              window.dispatchEvent(event);
            }}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            title="Chiudi Spotify"
          >
            <X className="h-4 w-4" />
          </button>
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
      </div>

      {!isConnected ? (
        <SpotifyAuth 
          onAuthSuccess={handleSpotifyAuthSuccess}
          onAuthError={handleSpotifyAuthError}
        />
      ) : (
        <div>
          {/* Player UI */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="w-full md:w-1/3">
              <motion.div 
                className="w-full aspect-square rounded-lg overflow-hidden shadow-2xl relative group"
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <img 
                  src={currentTrack?.image || 'https://i.scdn.co/image/ab67706f00000003ca5a7517156021292e5663a4'} 
                  alt="Album cover" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={togglePlayback}
                    className="bg-white text-purple-800 p-4 rounded-full shadow-lg transform transition-transform group-hover:scale-110"
                  >
                    {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                  </button>
                </div>
              </motion.div>
              
              <div className="flex justify-between items-center mt-3">
                <button className="text-white/70 hover:text-white transition-colors">
                  <Heart className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setShowPlaylistPanel(!showPlaylistPanel)}
                  className={`text-white/70 hover:text-white transition-colors ${showPlaylistPanel ? 'text-green-400' : ''}`}
                >
                  <ListMusic className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setIsShuffleOn(!isShuffleOn)}
                  className={`text-white/70 hover:text-white transition-colors ${isShuffleOn ? 'text-green-400' : ''}`}
                >
                  <Shuffle className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setIsRepeatOn(!isRepeatOn)}
                  className={`text-white/70 hover:text-white transition-colors ${isRepeatOn ? 'text-green-400' : ''}`}
                >
                  <Repeat className="h-5 w-5" />
                </button>
                <button className="text-white/70 hover:text-white transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col">
              <div className="mb-4">
                <h4 className="font-bold text-2xl text-white truncate">{currentTrack?.name || 'Nessuna traccia'}</h4>
                <p className="text-lg text-white/80 truncate">{currentTrack?.artist || 'Artista sconosciuto'}</p>
                <p className="text-sm text-white/60 truncate">{currentTrack?.album || 'Album sconosciuto'}</p>
              </div>
              
              {/* Progress bar */}
              <div className="mb-4 mt-auto">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-white/70">{formatTime(currentTime)}</span>
                  <div className="flex-1 relative h-1 bg-white/20 rounded-full overflow-hidden">
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-white/70">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between bg-white/10 p-4 rounded-lg">
                <button 
                  onClick={() => changeTrack('prev')}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <SkipBack className="h-6 w-6" />
                </button>
                
                <button 
                  onClick={togglePlayback}
                  className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors shadow-lg"
                >
                  {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                </button>
                
                <button 
                  onClick={() => changeTrack('next')}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <SkipForward className="h-6 w-6" />
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3 mt-4 bg-white/10 p-3 rounded-lg">
                <button 
                  onClick={toggleMute}
                  className="text-white/80 hover:text-white p-1"
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
                  className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500"
                />
                <span className="text-xs text-white/80 w-8 text-right">{isMuted ? 0 : volume}%</span>
              </div>
            </div>
          </div>

          {/* Playlist Panel */}
          <AnimatePresence>
            {showPlaylistPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 overflow-hidden"
              >
                <div className="bg-white/10 rounded-lg p-4">
                  <h5 className="text-white font-medium mb-3 flex items-center gap-2">
                    <ListMusic className="h-4 w-4" />
                    Playlist: {relaxingPlaylists.find(p => p.id === playlistId)?.name || 'Playlist'}
                  </h5>
                  
                  <div className="space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {playlistTracks.map((track, index) => (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                          index === 0 ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm w-5 text-center">{index + 1}</span>
                          <div>
                            <p className="text-sm font-medium">{track.name}</p>
                            <p className="text-xs opacity-80">{track.artist}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button className="opacity-0 group-hover:opacity-100 text-white/70 hover:text-white">
                            <Heart className="h-4 w-4" />
                          </button>
                          <span className="text-xs">{track.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Playlist Selection */}
          <div className="mt-4">
            <h5 className="text-sm font-medium text-white/90 mb-3">Playlist Consigliate</h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {relaxingPlaylists.map(playlist => (
                <motion.button
                  key={playlist.id}
                  onClick={() => changePlaylist(playlist.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative overflow-hidden rounded-lg group`}
                >
                  <img 
                    src={playlist.image} 
                    alt={playlist.name}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <div className={`absolute inset-0 flex items-center justify-center ${
                    playlistId === playlist.id 
                      ? 'bg-green-500/40' 
                      : 'bg-black/40 opacity-0 group-hover:opacity-100'
                  } transition-all duration-200`}>
                    {playlistId === playlist.id && isPlaying ? (
                      <Disc className="h-10 w-10 text-white animate-spin" />
                    ) : (
                      <Play className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-xs font-medium text-white truncate">{playlist.name}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotifyPlayer;
