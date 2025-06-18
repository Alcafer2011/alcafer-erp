import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Users, FileText, Briefcase, Settings, 
  Menu, X, LogOut, HelpCircle, ChevronDown, Calculator,
  TrendingUp, PieChart, Receipt, Wrench, UserCheck, Building2,
  Package, Truck, UserCog, Droplet, Flame, Target, Music, Volume2,
  Play, Pause, SkipForward, SkipBack, Disc, Headphones, Heart, Clock, ListMusic, Shuffle, Repeat, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import AddToHomeScreen from '../common/AddToHomeScreen';
import SpotifyPlayer from '../common/SpotifyPlayer';
import toast from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['main']);
  const { userProfile, switchUser } = useAuth();
  const permissions = usePermissions();
  const [activeUsers, setActiveUsers] = useState<string[]>(['alessandro']);
  const [showAddToHome, setShowAddToHome] = useState(true);
  const [showSpotify, setShowSpotify] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(30);

  // Relaxing music tracks
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

  useEffect(() => {
    // Simula altri utenti attivi
    const interval = setInterval(() => {
      // Aggiunge o rimuove casualmente utenti attivi per simulare accessi multipli
      const randomUser = Math.random() > 0.5 ? 'gabriel' : 'hanna';
      setActiveUsers(prev => {
        if (prev.includes(randomUser)) {
          return prev.filter(u => u !== randomUser);
        } else {
          return [...prev, randomUser];
        }
      });
    }, 30000); // Cambia ogni 30 secondi
    
    // Inizializza il player audio per la musica rilassante
    const audio = new Audio(relaxingTracks[currentTrack].url);
    audio.loop = false;
    audio.volume = volume / 100;
    audio.addEventListener('ended', () => nextTrack());
    setAudioPlayer(audio);
    
    return () => {
      clearInterval(interval);
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = '';
      }
    };
  }, []);

  useEffect(() => {
    // Update audio source when track changes
    if (audioPlayer) {
      audioPlayer.src = relaxingTracks[currentTrack].url;
      if (isPlaying) {
        audioPlayer.play().catch(err => {
          console.log('Playback error:', err);
        });
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    // Update volume when it changes
    if (audioPlayer) {
      audioPlayer.volume = volume / 100;
    }
  }, [volume]);

  const toggleAudio = () => {
    if (audioPlayer) {
      if (audioPlayer.paused) {
        audioPlayer.play().catch(err => {
          console.log('Autoplay prevented by browser, user interaction required');
          toast.error('Errore nella riproduzione. Clicca di nuovo per riprovare.');
        });
        setIsPlaying(true);
        toast.success(`In riproduzione: ${relaxingTracks[currentTrack].name}`);
      } else {
        audioPlayer.pause();
        setIsPlaying(false);
        toast.success('Musica in pausa');
      }
    }
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % relaxingTracks.length);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + relaxingTracks.length) % relaxingTracks.length);
  };

  const handleLogout = async () => {
    toast.success('Logout effettuato con successo');
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const navigation = [
    {
      section: 'main',
      title: 'Principale',
      items: [
        { name: 'Dashboard', href: '/', icon: Home, show: true },
        { name: 'Home Finanziaria', href: '/home-finanziaria', icon: TrendingUp, show: permissions.canViewFinancials },
      ]
    },
    {
      section: 'gestione',
      title: 'Gestione',
      items: [
        { name: 'Clienti', href: '/clienti', icon: Users, show: true },
        { name: 'Preventivi', href: '/preventivi', icon: FileText, show: permissions.canModifyPreventivi },
        { name: 'Lavori', href: '/lavori', icon: Briefcase, show: permissions.canModifyLavori },
        { name: 'Fornitori', href: '/fornitori', icon: Truck, show: permissions.canViewFornitori },
      ]
    },
    {
      section: 'costi',
      title: 'Costi e Materiali',
      items: [
        { name: 'Materiali Metallici', href: '/materiali-metallici', icon: Package, show: true },
        { name: 'Materiali Vari', href: '/materiali-vari', icon: Settings, show: permissions.canModifyCostiMateriali },
        { name: 'Leasing Strumentali', href: '/leasing', icon: Wrench, show: true },
        { name: 'Manovalanza', href: '/manovalanza', icon: UserCheck, show: true },
        { name: 'Costi Utenze', href: '/costi-utenze', icon: Flame, show: permissions.canModifyUtenze },
      ]
    },
    {
      section: 'finanziari',
      title: 'Sezione Finanziaria',
      items: [
        { name: 'Informazioni Importanti', href: '/finanziari/info', icon: Calculator, show: permissions.canViewFinancials },
        { name: 'Dividendi', href: '/finanziari/dividendi', icon: PieChart, show: permissions.canViewFinancials },
        { name: 'Tasse e IVA Alcafer', href: '/finanziari/tasse-alcafer', icon: Receipt, show: permissions.canModifyTaxes },
        { name: 'Tasse e IVA Gabifer', href: '/finanziari/tasse-gabifer', icon: Receipt, show: permissions.canModifyTaxes },
      ]
    },
    {
      section: 'marketing',
      title: 'Marketing',
      items: [
        { name: 'Strategie Marketing', href: '/marketing', icon: Target, show: true },
      ]
    },
    {
      section: 'admin',
      title: 'Amministrazione',
      items: [
        { name: 'Gestione Utenti', href: '/utenti', icon: UserCog, show: permissions.canViewUsers },
      ]
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  const NavigationContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex h-16 items-center px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Alcafer & Gabifer ERP
        </h1>
        <button
          onClick={() => setSidebarOpen(false)}
          className="ml-auto lg:hidden text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {navigation.map((section) => {
          const visibleItems = section.items.filter(item => item.show);
          if (visibleItems.length === 0) return null;

          const isExpanded = expandedSections.includes(section.section);

          return (
            <div key={section.section}>
              <button
                onClick={() => toggleSection(section.section)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span>{section.title}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-2 mt-1 space-y-1 overflow-hidden"
                  >
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isActive(item.href)
                              ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Icon className="mr-3 h-4 w-4" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        {/* Utenti attivi */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">Utenti online:</p>
          <div className="flex -space-x-2">
            {activeUsers.includes('alessandro') && (
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center border-2 border-white" title="Alessandro">
                <span className="text-xs font-bold text-red-800">A</span>
              </div>
            )}
            {activeUsers.includes('gabriel') && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white" title="Gabriel">
                <span className="text-xs font-bold text-blue-800">G</span>
              </div>
            )}
            {activeUsers.includes('hanna') && (
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center border-2 border-white" title="Hanna">
                <span className="text-xs font-bold text-green-800">H</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {userProfile?.nome?.charAt(0)}{userProfile?.cognome?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userProfile?.nome} {userProfile?.cognome}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {userProfile?.ruolo === 'alessandro' && 'Amministratore'}
              {userProfile?.ruolo === 'gabriel' && 'Operatore'}
              {userProfile?.ruolo === 'hanna' && 'Contabilità'}
            </p>
          </div>
        </div>

        {/* Switch User (solo per demo) */}
        {userProfile?.ruolo === 'alessandro' && (
          <div className="mb-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800 mb-2">Demo - Cambia Utente:</p>
            <div className="flex gap-1">
              <button
                onClick={() => switchUser('alessandro')}
                className={`px-2 py-1 text-xs rounded ${userProfile.ruolo === 'alessandro' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                A
              </button>
              <button
                onClick={() => switchUser('gabriel')}
                className={`px-2 py-1 text-xs rounded ${userProfile.ruolo === 'gabriel' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                G
              </button>
              <button
                onClick={() => switchUser('hanna')}
                className={`px-2 py-1 text-xs rounded ${userProfile.ruolo === 'hanna' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                H
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden"
            >
              <NavigationContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          <NavigationContent />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:px-6">
          <button
            type="button"
            className="lg:hidden text-gray-600 hover:text-gray-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1" />

          {/* Music Controls */}
          <div className="flex items-center">
            <motion.div 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full p-1 shadow-lg flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <button 
                onClick={prevTrack}
                className="text-white p-1 hover:bg-white/10 rounded-full transition-colors"
                title="Traccia precedente"
              >
                <SkipBack className="h-4 w-4" />
              </button>
              
              <button 
                onClick={toggleAudio}
                className="text-white p-2 mx-1 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
                title={isPlaying ? "Pausa" : "Riproduci"}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              
              <button 
                onClick={nextTrack}
                className="text-white p-1 hover:bg-white/10 rounded-full transition-colors"
                title="Traccia successiva"
              >
                <SkipForward className="h-4 w-4" />
              </button>
              
              <div className="hidden md:flex items-center ml-2 mr-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div className="hidden md:block text-white text-xs font-medium px-2 py-1 bg-white/10 rounded-full ml-1 mr-2">
                {isPlaying ? (
                  <div className="flex items-center gap-1">
                    <Disc className="h-3 w-3 animate-spin" />
                    <span className="truncate max-w-[80px]">{relaxingTracks[currentTrack].name}</span>
                  </div>
                ) : (
                  <span>Musica</span>
                )}
              </div>
            </motion.div>
            
            <button 
              onClick={() => setShowSpotify(!showSpotify)}
              className={`ml-2 p-2 rounded-lg transition-all flex items-center gap-2 px-3 ${
                showSpotify 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md' 
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-green-100 hover:to-green-200'
              }`}
              title="Spotify"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              <span className="text-sm font-medium">Spotify</span>
            </button>
          </div>

          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Spotify Player */}
        <AnimatePresence>
          {showSpotify && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2"
            >
              <SpotifyPlayer />
            </motion.div>
          )}
        </AnimatePresence>

        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Add to Home Screen Prompt */}
      {showAddToHome && (
        <AddToHomeScreen onClose={() => setShowAddToHome(false)} />
      )}
    </div>
  );
};

export default Layout;