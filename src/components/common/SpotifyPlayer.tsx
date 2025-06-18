import React, { useState, useEffect } from 'react';
import { Music, ExternalLink, RefreshCw, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
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

  // Playlist di musica rilassante predefinite
  const relaxingPlaylists = [
    { id: '37i9dQZF1DX8Uebhn9wzrS', name: 'Peaceful Piano' },
    { id: '37i9dQZF1DWZqd5JICZI0u', name: 'Peaceful Meditation' },
    { id: '37i9dQZF1DX3Ogo9pFvBkY', name: 'Ambient Chill' },
    { id: '37i9dQZF1DX1s9knjP51Oa', name: 'Calm Before the Storm' },
    { id: '37i9dQZF1DX9uKNf5jGX6m', name: 'Relaxing Massage' }
  ];

  useEffect(() => {
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
  }, []);

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
    setIsPlaying(!isPlaying);
  };

  const changeTrack = (direction: 'next' | 'prev') => {
    setIsLoading(true);
    
    // Simula cambio traccia
    setTimeout(() => {
      setCurrentTrack({
        name: direction === 'next' ? 'Calm Waters' : 'Mountain Breeze',
        artist: 'Nature Sounds',
        album: 'Relaxation Collection',
        image: 'https://i.scdn.co/image/ab67706f00000003e4eadd417a05b2546e866934'
      });
      setIsLoading(false);
    }, 800);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
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
        image: `https://i.scdn.co/image/ab67706f00000003ca5a7517156021292e5663a4`
      });
      setIsLoading(false);
      setIsPlaying(true);
    }, 1000);
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-green-900">Spotify Connect</h3>
        </div>
        <a 
          href="https://open.spotify.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          Apri Spotify
        </a>
      </div>

      {!isConnected ? (
        <div className="text-center py-8">
          <Music className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-green-800 mb-2">Connetti il tuo account Spotify</h4>
          <p className="text-sm text-green-600 mb-4">
            Ascolta la tua musica preferita mentre lavori
          </p>
          <button
            onClick={authorizeSpotify}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-full font-medium transition-colors flex items-center gap-2 mx-auto"
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
            <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
              <img 
                src={currentTrack?.image || 'https://i.scdn.co/image/ab67706f00000003ca5a7517156021292e5663a4'} 
                alt="Album cover" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-green-900 truncate">{currentTrack?.name || 'Nessuna traccia'}</h4>
              <p className="text-sm text-green-600 truncate">{currentTrack?.artist || 'Artista sconosciuto'}</p>
              <p className="text-xs text-green-500 truncate">{currentTrack?.album || 'Album sconosciuto'}</p>
            </div>
          </div>

          {/* Controlli */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => changeTrack('prev')}
              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full transition-colors"
            >
              <SkipBack className="h-5 w-5" />
            </button>
            
            <button 
              onClick={togglePlayback}
              className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>
            
            <button 
              onClick={() => changeTrack('next')}
              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full transition-colors"
            >
              <SkipForward className="h-5 w-5" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 mb-6">
            <button 
              onClick={toggleMute}
              className="text-green-600 hover:text-green-800"
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
              className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
            <span className="text-xs text-green-600 w-8 text-right">{isMuted ? 0 : volume}%</span>
          </div>

          {/* Playlist */}
          <div>
            <h5 className="text-sm font-medium text-green-800 mb-2">Playlist Rilassanti</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {relaxingPlaylists.map(playlist => (
                <button
                  key={playlist.id}
                  onClick={() => changePlaylist(playlist.id)}
                  className={`text-left p-2 rounded-lg text-sm transition-colors ${
                    playlistId === playlist.id 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-white hover:bg-green-100 text-green-700'
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