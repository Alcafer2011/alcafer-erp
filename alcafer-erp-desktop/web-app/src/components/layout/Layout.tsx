import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, FileText, Briefcase, Settings, Menu, X, LogOut, HelpCircle, ChevronDown, Calculator, TrendingUp, PieChart, Receipt, Wrench, UserCheck, Building2, Package, Truck, UserCog, Droplet, Flame, Target, Music, Volume2, Play, Pause, SkipForward, SkipBack, Disc, Headphones, Heart, Clock, ListMusic, Shuffle, Repeat, Share2, PenTool as Tool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import AddToHomeScreen from '../common/AddToHomeScreen';
import SpotifyPlayer from '../common/SpotifyPlayer';
import toast from 'react-hot-toast';
import WebRadioPlayer from '../common/WebRadioPlayer';
import GlobalAIPanel from '../common/GlobalAIPanel';
import BoltDiyPanel from '../common/BoltDiyPanel';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['main']);
  const { userProfile, switchUser, signOut } = useAuth();
  const permissions = usePermissions();
  const [activeUsers, setActiveUsers] = useState<string[]>(['alessandro']);
  const [showAddToHome, setShowAddToHome] = useState(true);
  const [showSpotify, setShowSpotify] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(30);
  // Relaxing music tracks - Playlist meditazione con audio reale
  const relaxingTracks = [
    { 
      name: 'Peaceful Meditation', 
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      artist: 'Meditation Sounds'
    },
    { 
      name: 'Ocean Waves', 
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      artist: 'Nature Sounds'
    },
    { 
      name: 'Forest Ambience', 
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      artist: 'Forest Sounds'
    },
    { 
      name: 'Gentle Rain', 
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      artist: 'Nature Sounds'
    },
    { 
      name: 'Wind Chimes', 
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      artist: 'Ambient'
    },
    { 
      name: 'Flowing Stream', 
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      artist: 'Nature Sounds'
    },
    { 
      name: 'Morning Birds', 
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      artist: 'Bird Sounds'
    },
    { 
      name: 'Thunderstorm', 
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      artist: 'Weather Sounds'
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

    // Gestisce la chiusura di Spotify
    const handleCloseSpotify = () => {
      setShowSpotify(false);
    };

    window.addEventListener('closeSpotify', handleCloseSpotify);
    return () => {
      window.removeEventListener('closeSpotify', handleCloseSpotify);
    };
    
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
      audioPlayer.load(); // Carica il nuovo src
      if (isPlaying) {
        audioPlayer.play().catch(err => {
          console.log('Playback error:', err);
          toast.info('Clicca play per iniziare la riproduzione');
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

  // Rimuoviamo il controllo bolt.diy per evitare errori

  const toggleAudio = () => {
    if (audioPlayer) {
      if (audioPlayer.paused) {
        audioPlayer.play().catch(err => {
          console.log('Autoplay prevented by browser, user interaction required');
          toast.info('Clicca di nuovo per iniziare la riproduzione');
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
    await signOut();
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
        { name: 'Posa in Opera', href: '/posa-in-opera', icon: Tool, show: permissions.canModifyLavori },
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
      <div className="flex h-20 items-center px-6 border-b border-white/20 bg-gradient-to-r from-blue-600/10 to-indigo-600/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Alcafer ERP
            </h1>
            <p className="text-xs text-gray-500">Sistema Integrato</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="ml-auto lg:hidden text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-3 overflow-y-auto">
        {navigation.map((section) => {
          const visibleItems = section.items.filter(item => item.show);
          if (visibleItems.length === 0) return null;

          const isExpanded = expandedSections.includes(section.section);

          return (
            <div key={section.section} className="space-y-1">
              <motion.button
                onClick={() => toggleSection(section.section)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-white/50 rounded-xl transition-all duration-200 group"
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                  {section.title}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''} group-hover:text-blue-600`} />
              </motion.button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="ml-4 mt-2 space-y-1 overflow-hidden"
                  >
                    {visibleItems.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Link
                            to={item.href}
                            className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                              isActive(item.href)
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                                : 'text-gray-600 hover:bg-white/60 hover:text-gray-900 hover:shadow-sm'
                            }`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <Icon className={`mr-3 h-4 w-4 transition-colors ${
                              isActive(item.href) ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
                            }`} />
                            {item.name}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/20 p-6 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
        {/* Utenti attivi */}
        <div className="mb-4">
          <p className="text-xs text-gray-600 mb-3 font-medium">Utenti online:</p>
          <div className="flex -space-x-2">
            {activeUsers.includes('alessandro') && (
              <motion.div 
                className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center border-3 border-white shadow-lg" 
                title="Alessandro"
                whileHover={{ scale: 1.1 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <span className="text-sm font-bold text-white">A</span>
              </motion.div>
            )}
            {activeUsers.includes('gabriel') && (
              <motion.div 
                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center border-3 border-white shadow-lg" 
                title="Gabriel"
                whileHover={{ scale: 1.1 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-sm font-bold text-white">G</span>
              </motion.div>
            )}
            {activeUsers.includes('hanna') && (
              <motion.div 
                className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center border-3 border-white shadow-lg" 
                title="Hanna"
                whileHover={{ scale: 1.1 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-sm font-bold text-white">H</span>
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 p-3 bg-white/60 rounded-xl backdrop-blur-sm">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-lg font-bold">
              {userProfile?.nome?.charAt(0)}{userProfile?.cognome?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {userProfile?.nome} {userProfile?.cognome}
            </p>
            <p className="text-xs text-gray-600 capitalize font-medium">
              {userProfile?.ruolo === 'alessandro' && '👑 Amministratore'}
              {userProfile?.ruolo === 'gabriel' && '⚙️ Operatore'}
              {userProfile?.ruolo === 'hanna' && '📊 Contabilità'}
            </p>
          </div>
        </div>

        {/* Switch User */}
        <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50">
          <p className="text-xs text-amber-800 mb-3 font-semibold">🔄 Cambia Utente:</p>
          <div className="flex gap-2">
            <motion.button
              onClick={() => switchUser('alessandro')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                userProfile?.ruolo === 'alessandro' 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg' 
                  : 'bg-white/60 text-gray-700 hover:bg-red-100 hover:text-red-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              A
            </motion.button>
            <motion.button
              onClick={() => switchUser('gabriel')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                userProfile?.ruolo === 'gabriel' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                  : 'bg-white/60 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              G
            </motion.button>
            <motion.button
              onClick={() => switchUser('hanna')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                userProfile?.ruolo === 'hanna' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
                  : 'bg-white/60 text-gray-700 hover:bg-green-100 hover:text-green-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              H
            </motion.button>
          </div>
        </div>

        <div className="space-y-2">
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="h-4 w-4 group-hover:text-red-600" />
            Logout
          </motion.button>
          
          {/* Pulsante per tornare alla login page */}
          <motion.button
            onClick={() => {
              localStorage.removeItem('userProfile');
              localStorage.removeItem('isAuthenticated');
              window.location.reload();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Lock className="h-4 w-4 group-hover:text-blue-800" />
            Torna al Login
          </motion.button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-white/20 lg:hidden"
            >
              <NavigationContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl">
          <NavigationContent />
        </div>
      </div>

      {/* Banner rimosso per evitare interferenze */}

      {/* Main content */}
      <div className="lg:pl-72">
        <div className="flex h-20 items-center gap-x-4 border-b border-white/20 bg-white/60 backdrop-blur-xl px-4 shadow-lg lg:px-6">
          <button
            type="button"
            className="lg:hidden text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-white/50 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1" />

          {/* Music Controls */}
          <div className="flex items-center gap-3">
            <motion.div 
              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-1 shadow-xl flex items-center backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <button 
                onClick={prevTrack}
                className="text-white p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105"
                title="Traccia precedente"
              >
                <SkipBack className="h-4 w-4" />
              </button>
              
              <button 
                onClick={toggleAudio}
                className="text-white p-3 mx-1 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center bg-white/10"
                title={isPlaying ? "Pausa" : "Riproduci"}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              
              <button 
                onClick={nextTrack}
                className="text-white p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105"
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
                  className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>
              
              <div className="hidden md:block text-white text-xs font-medium px-3 py-2 bg-white/20 rounded-xl ml-1 mr-2 backdrop-blur-sm">
                {isPlaying ? (
                  <div className="flex items-center gap-2">
                    <Disc className="h-3 w-3 animate-spin" />
                    <span className="truncate max-w-[100px]">{relaxingTracks[currentTrack].name}</span>
                  </div>
                ) : (
                  <span>Musica</span>
                )}
              </div>
            </motion.div>
            
            <motion.button 
              onClick={() => setShowSpotify(!showSpotify)}
              className={`p-3 rounded-2xl transition-all duration-300 flex items-center gap-2 px-4 shadow-lg backdrop-blur-sm ${
                showSpotify 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/25' 
                  : 'bg-white/60 text-gray-700 hover:from-green-100 hover:to-emerald-100 hover:shadow-lg'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Spotify"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              <span className="text-sm font-semibold">Spotify</span>
            </motion.button>
          </div>

          <motion.button 
            className="text-gray-500 hover:text-gray-700 p-2 rounded-xl hover:bg-white/50 transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <HelpCircle className="h-5 w-5" />
          </motion.button>
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

                <main className="py-8">
                  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {children}
                    </motion.div>
                  </div>
                </main>
      </div>

      {/* Add to Home Screen Prompt */}
      {showAddToHome && (
        <AddToHomeScreen onClose={() => setShowAddToHome(false)} />
      )}

      {/* Web Radio e AI Panels */}
      <WebRadioPlayer />
      <GlobalAIPanel />
      <BoltDiyPanel />
    </div>
  );
};

export default Layout;
