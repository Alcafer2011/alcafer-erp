import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, FileText, Briefcase, Settings, Menu, X, LogOut, HelpCircle, ChevronDown, Calculator, TrendingUp, PieChart, Receipt, Wrench, UserCheck, Building2, Package, Truck, UserCog, Droplet, Flame, Target, Music, Volume2, VolumeX, Play, Pause, SkipForward, SkipBack, Disc, Headphones, Heart, Clock, ListMusic, Shuffle, Repeat, Share2, PenTool as Tool, Lock, Radio, MessageCircle, Send, Brain, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import AddToHomeScreen from '../common/AddToHomeScreen';
import SpotifyPlayer from '../common/SpotifyPlayer';
import toast from 'react-hot-toast';
import GlobalAIPanel from '../common/GlobalAIPanel';
import IntegratedMessaging from '../common/IntegratedMessaging';

// Declare Elfsight global
declare global {
  interface Window {
    Elfsight?: {
      init: () => void;
    };
  }
}

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
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showTelegram, setShowTelegram] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  


  // Relaxing music tracks - Playlist meditazione con i tuoi file audio
  const relaxingTracks = [
    { 
      name: 'Tibetan Healing Flute', 
      url: '/audio/Eliminates All Negative Energy, Tibetan Healing Flute, Increases Mental Strength ★2.mp3',
      artist: 'Tibetan Healing'
    },
    { 
      name: 'Fiori di Ciliegio - 432 Hz', 
      url: '/audio/Fiori di ciliegio - musica per meditazione a 432 Hz.mp3',
      artist: 'Meditazione 432 Hz'
    },
    { 
      name: 'Musica per Meditare 10 Minuti', 
      url: '/audio/Straordinaria Musica per Meditare 10 Minuti. Musica Rlassante per una Veloce Meditazione Quotidiana..mp3',
      artist: 'Meditazione Quotidiana'
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

    // Initialize custom radio player and load stations
    console.log('📻 Player radio personalizzato inizializzato');

    return () => {
      window.removeEventListener('closeSpotify', handleCloseSpotify);
      clearInterval(interval);
    };
  }, []);

  // Inizializza il player audio in un useEffect separato
  useEffect(() => {
    console.log('🎵 Inizializzazione player audio meditazione...');
    const audio = new Audio();
    audio.id = 'meditationPlayer';
    audio.loop = false;
    audio.volume = isMuted ? 0 : volume / 100;
    audio.src = relaxingTracks[currentTrack].url;
    audio.addEventListener('error', (e) => {
      console.error('Errore caricamento audio:', e);
      toast.error('Errore nel caricamento del file audio');
    });
    audio.addEventListener('canplay', () => {
      console.log('✅ Audio pronto per la riproduzione:', relaxingTracks[currentTrack].name);
    });
    setAudioPlayer(audio);
    console.log('✅ Player audio meditazione inizializzato');
    
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []); // Solo una volta all'inizio

  useEffect(() => {
    // Update audio source when track changes
    if (audioPlayer) {
      audioPlayer.src = relaxingTracks[currentTrack].url;
      audioPlayer.load(); // Carica il nuovo src
      if (isPlaying) {
        audioPlayer.play().catch(err => {
          console.log('Playback error:', err);
          toast('Clicca play per iniziare la riproduzione');
        });
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    // Update volume when it changes
    if (audioPlayer) {
      audioPlayer.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    // Add ended event listener after functions are defined
    if (audioPlayer) {
      const handleEnded = () => {
        console.log('🎵 Traccia terminata, passaggio alla prossima...');
        const newTrack = (currentTrack + 1) % relaxingTracks.length;
        setCurrentTrack(newTrack);
        if (audioPlayer) {
          audioPlayer.src = relaxingTracks[newTrack].url;
          audioPlayer.load();
          if (isPlaying) {
            audioPlayer.play().catch(err => {
              console.error('Errore riproduzione automatica:', err);
            });
          }
        }
      };
      
      audioPlayer.addEventListener('ended', handleEnded);
      console.log('✅ Event listener "ended" aggiunto al player audio');
      
      return () => {
        audioPlayer.removeEventListener('ended', handleEnded);
        console.log('🧹 Event listener "ended" rimosso');
      };
    }
  }, [audioPlayer, currentTrack, isPlaying]);

  // Rimuoviamo il controllo bolt.diy per evitare errori

  const toggleAudio = () => {
    if (audioPlayer) {
      if (audioPlayer.paused) {
        // Assicurati che il src sia aggiornato
        if (audioPlayer.src !== relaxingTracks[currentTrack].url) {
          audioPlayer.src = relaxingTracks[currentTrack].url;
          audioPlayer.load();
        }
        
        audioPlayer.play().catch(err => {
          console.error('Errore riproduzione:', err);
          toast.error('Errore nella riproduzione del file audio');
        });
        setIsPlaying(true);
        toast.success(`🎵 In riproduzione: ${relaxingTracks[currentTrack].name}`);
      } else {
        audioPlayer.pause();
        setIsPlaying(false);
        toast.success('⏸️ Musica in pausa');
      }
    } else {
      toast.error('❌ Player audio non inizializzato');
    }
  };

  const nextTrack = () => {
    const newTrack = (currentTrack + 1) % relaxingTracks.length;
    setCurrentTrack(newTrack);
    if (audioPlayer) {
      audioPlayer.src = relaxingTracks[newTrack].url;
      audioPlayer.load();
      if (isPlaying) {
        audioPlayer.play().catch(err => {
          console.error('Errore riproduzione traccia successiva:', err);
        });
      }
    }
    toast.success(`🎵 Traccia successiva: ${relaxingTracks[newTrack].name}`);
  };

  const prevTrack = () => {
    const newTrack = (currentTrack - 1 + relaxingTracks.length) % relaxingTracks.length;
    setCurrentTrack(newTrack);
    if (audioPlayer) {
      audioPlayer.src = relaxingTracks[newTrack].url;
      audioPlayer.load();
      if (isPlaying) {
        audioPlayer.play().catch(err => {
          console.error('Errore riproduzione traccia precedente:', err);
        });
      }
    }
    toast.success(`🎵 Traccia precedente: ${relaxingTracks[newTrack].name}`);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioPlayer) {
      audioPlayer.volume = !isMuted ? 0 : volume / 100;
    }
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
            {/* Web Radio Player - Stretto verticalmente, largo orizzontalmente */}
            <motion.div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-1 shadow-xl backdrop-blur-sm w-[200px] h-[60px]"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="flex items-center justify-between h-full">
                {/* Titolo e Icona */}
                <div className="flex items-center gap-1">
                  <Radio className="h-3 w-3 text-white" />
                  <span className="text-xs text-white font-semibold">📻</span>
                </div>
                
                {/* Station Selector - Compatto */}
                <select
                  className="text-xs bg-white/20 text-white border border-white/30 rounded px-1 py-0.5 backdrop-blur-sm w-[80px] h-6"
                  onChange={(e) => {
                    const audio = document.getElementById('webRadioPlayer') as HTMLAudioElement;
                    if (audio) {
                      const sources = audio.querySelectorAll('source');
                      const selectedIndex = parseInt(e.target.value);
                      if (selectedIndex >= 0 && sources[selectedIndex]) {
                        audio.src = sources[selectedIndex].src;
                        audio.load();
                        toast.success(`📻 ${e.target.options[e.target.selectedIndex].text} selezionata`);
                      }
                    }
                  }}
                >
                  <option value="-1" className="bg-gray-800 text-white">Stazione</option>
                  <option value="0" className="bg-gray-800 text-white">Nova</option>
                  <option value="1" className="bg-gray-800 text-white">Nova 2</option>
                  <option value="2" className="bg-gray-800 text-white">Nova 3</option>
                  <option value="3" className="bg-gray-800 text-white">Nova 4</option>
                  <option value="4" className="bg-gray-800 text-white">Nova 5</option>
                </select>
                
                {/* Radio Player HTML5 - Molto compatto */}
                <div className="w-[100px]">
                  <audio 
                    id="webRadioPlayer"
                    controls
                    className="w-full h-5 bg-white/20 rounded"
                    style={{
                      filter: 'invert(1)',
                      opacity: 0.9
                    }}
                    onPlay={() => console.log('📻 Radio in riproduzione')}
                    onPause={() => console.log('⏸️ Radio in pausa')}
                    onLoadStart={() => console.log('📻 Caricamento stazione...')}
                    onCanPlay={() => console.log('✅ Stazione pronta')}
                    onError={(e) => {
                      console.error('❌ Errore radio:', e);
                      toast.error('❌ Errore nel caricamento della stazione');
                    }}
                  >
                    <source src="https://streaming.radionova.it/radionova" type="audio/mpeg" />
                    <source src="https://streaming.radionova.it/radionova2" type="audio/mpeg" />
                    <source src="https://streaming.radionova.it/radionova3" type="audio/mpeg" />
                    <source src="https://streaming.radionova.it/radionova4" type="audio/mpeg" />
                    <source src="https://streaming.radionova.it/radionova5" type="audio/mpeg" />
                    Il tuo browser non supporta l'elemento audio.
                  </audio>
                </div>
              </div>
            </motion.div>

            {/* WhatsApp, Telegram e AI Assistant */}
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {/* WhatsApp */}
              <button 
                onClick={() => setShowWhatsApp(true)}
                className="p-3 bg-green-500 hover:bg-green-600 rounded-xl transition-colors shadow-lg"
                title="WhatsApp Integrato"
              >
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </button>

              {/* Telegram */}
              <button 
                onClick={() => setShowTelegram(true)}
                className="p-3 bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors shadow-lg"
                title="Telegram Integrato"
              >
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </button>

              {/* AI Assistant Consolidato */}
              <button 
                onClick={() => {
                  // Apri pannello AI consolidato
                  const aiPanel = document.querySelector('[data-ai-panel]');
                  if (aiPanel) {
                    aiPanel.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="p-3 bg-purple-500 hover:bg-purple-600 rounded-xl transition-colors shadow-lg"
                title="AI Assistant - Assistente, Bug Report, Suggerimenti, Upload Media"
              >
                <Brain className="h-5 w-5 text-white" />
              </button>
            </motion.div>
            {/* Player Musica Meditazione - Stile coerente con il tema */}
            <motion.div 
              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-3 shadow-xl backdrop-blur-sm flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="flex items-center gap-1 mr-2">
                <Music className="h-4 w-4 text-white" />
                <span className="text-xs text-white/80 font-medium">Meditazione</span>
              </div>
              
              <motion.button 
                onClick={toggleAudio}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 text-white"
                title={isPlaying ? "Pause" : "Play"}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </motion.button>
              
              <select
                className="text-xs text-white bg-white/20 rounded-lg px-2 py-1 border border-white/30 backdrop-blur-sm min-w-[120px]"
                value={currentTrack}
                onChange={(e) => setCurrentTrack(parseInt(e.target.value))}
                title="Seleziona traccia rilassante"
              >
                {relaxingTracks.map((t, i) => (
                  <option key={t.name} value={i} className="text-gray-800">{t.name}</option>
                ))}
              </select>
              
              <div className="hidden md:flex items-center gap-2">
                <motion.button 
                  onClick={toggleMute}
                  className="text-white p-1 hover:bg-white/20 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
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
                  className="w-12 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
                <span className="text-white text-xs font-medium">{isMuted ? 0 : volume}%</span>
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

      {/* AI Panel Consolidato - Si apre quando clicchi l'icona AI nella barra superiore */}
      <div data-ai-panel className="hidden">
        <GlobalAIPanel />
      </div>

      {/* Pannelli di Messaggistica Integrata */}
      <IntegratedMessaging 
        isOpen={showWhatsApp} 
        onClose={() => setShowWhatsApp(false)} 
        type="whatsapp" 
      />
      <IntegratedMessaging 
        isOpen={showTelegram} 
        onClose={() => setShowTelegram(false)} 
        type="telegram" 
      />
    </div>
  );
};

export default Layout;
