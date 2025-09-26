import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface SpotifyAuthProps {
  onAuthSuccess: (token: string) => void;
  onAuthError: (error: string) => void;
}

const SpotifyAuth: React.FC<SpotifyAuthProps> = ({ onAuthSuccess, onAuthError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [clientId, setClientId] = useState('');

  useEffect(() => {
    // Carica il client ID da .env
    const envClientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    if (envClientId && envClientId !== 'your_spotify_client_id_here') {
      setClientId(envClientId);
    }
  }, []);

  const handleSpotifyAuth = () => {
    if (!clientId) {
      toast.error('Spotify Client ID non configurato. Aggiungi VITE_SPOTIFY_CLIENT_ID in .env.local');
      return;
    }

    setIsLoading(true);
    
    const redirectUri = window.location.origin;
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-modify-playback-state',
      'user-read-playback-state',
      'user-read-currently-playing',
      'playlist-read-private',
      'playlist-read-collaborative'
    ].join(' ');

    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${clientId}&` +
      `response_type=token&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `show_dialog=true`;

    // Apri in una nuova finestra
    const authWindow = window.open(
      authUrl,
      'spotify-auth',
      'width=500,height=700,scrollbars=yes,resizable=yes'
    );

    // Ascolta il messaggio dalla finestra di autenticazione
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'SPOTIFY_AUTH_SUCCESS') {
        const token = event.data.token;
        localStorage.setItem('spotify_token', token);
        localStorage.setItem('spotify_token_expires', event.data.expires_in);
        onAuthSuccess(token);
        authWindow?.close();
        setIsLoading(false);
        toast.success('Connesso a Spotify con successo!');
      } else if (event.data.type === 'SPOTIFY_AUTH_ERROR') {
        onAuthError(event.data.error);
        authWindow?.close();
        setIsLoading(false);
        toast.error('Errore durante la connessione a Spotify');
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup
    const checkClosed = setInterval(() => {
      if (authWindow?.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleDemoMode = () => {
    toast.success('Modalità Demo attivata - Funzionalità limitate');
    onAuthSuccess('demo_token');
  };

  const handleSkipAuth = () => {
    toast('Autenticazione saltata - Usa la modalità demo');
    onAuthSuccess('demo_token');
  };

  return (
    <div className="text-center py-8">
      <motion.div 
        className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-400 rounded-full flex items-center justify-center mx-auto mb-4"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <svg viewBox="0 0 24 24" width="48" height="48" fill="white">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      </motion.div>
      
      <h4 className="text-xl font-medium text-white mb-2">Connetti il tuo account Spotify</h4>
      <p className="text-sm text-white/80 mb-6">
        Accedi al tuo account Spotify per ascoltare la tua musica preferita
      </p>
      
      <div className="space-y-3">
        <button
          onClick={handleSpotifyAuth}
          disabled={isLoading || !clientId}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white py-3 px-8 rounded-full font-medium transition-colors flex items-center gap-2 mx-auto shadow-lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Connessione...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Connetti a Spotify
            </>
          )}
        </button>
        
        <div className="flex gap-2 justify-center">
          <button
            onClick={handleDemoMode}
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-full font-medium transition-colors text-sm"
          >
            Modalità Demo
          </button>
          <button
            onClick={handleSkipAuth}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-full font-medium transition-colors text-sm"
          >
            Salta
          </button>
        </div>
      </div>
      
      {!clientId && (
        <div className="mt-6 bg-yellow-100 border border-yellow-300 rounded-lg p-3 max-w-md mx-auto">
          <p className="text-xs text-yellow-800">
            <strong>Nota:</strong> Per utilizzare Spotify, aggiungi VITE_SPOTIFY_CLIENT_ID nel file .env.local
          </p>
        </div>
      )}
    </div>
  );
};

export default SpotifyAuth;
