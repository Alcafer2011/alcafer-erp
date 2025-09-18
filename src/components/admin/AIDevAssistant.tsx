import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Send, X, Maximize2, Minimize2, Zap, 
  MessageSquare, Code, Database, Github, 
  AlertTriangle, CheckCircle, Settings, 
  RefreshCw, Download, Upload
} from 'lucide-react';
import { boltDiyIntegration } from '../../services/boltDiyIntegration';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'error' | 'fix' | 'info' | 'success';
}

interface SystemStatus {
  boltDiyConnected: boolean;
  supabaseConnected: boolean;
  githubConnected: boolean;
  anthropicConnected: boolean;
  lastCheck: string;
}

const AIDevAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    boltDiyConnected: false,
    supabaseConnected: false,
    githubConnected: false,
    anthropicConnected: false,
    lastCheck: new Date().toISOString()
  });
  const [activeTab, setActiveTab] = useState<'chat' | 'monitoring' | 'fixes' | 'settings'>('chat');
  const [errorLog, setErrorLog] = useState<any[]>([]);
  const [appliedFixes, setAppliedFixes] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userProfile } = useAuth();

  useEffect(() => {
    initializeBoltDiyIntegration();
    checkSystemStatus();
    
    // Controlla stato ogni 30 secondi
    const statusInterval = setInterval(checkSystemStatus, 30000);
    
    return () => clearInterval(statusInterval);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const initializeBoltDiyIntegration = async () => {
    try {
      const initialized = await boltDiyIntegration.initialize();
      
      if (initialized) {
        addSystemMessage('✅ bolt.diy AI Assistant connesso e attivo', 'success');
        setSystemStatus(prev => ({ ...prev, boltDiyConnected: true }));
      } else {
        addSystemMessage('⚠️ bolt.diy non disponibile. Alcune funzionalità potrebbero essere limitate.', 'error');
      }
    } catch (error) {
      console.error('Errore inizializzazione bolt.diy:', error);
      addSystemMessage('❌ Errore connessione bolt.diy', 'error');
    }
  };

  const checkSystemStatus = async () => {
    try {
      // Controlla bolt.diy
      const boltResponse = await fetch('http://localhost:5174/api/health').catch(() => null);
      const boltConnected = boltResponse?.ok || false;

      // Controlla Supabase
      const supabaseConnected = await checkSupabaseConnection();

      // Controlla GitHub (simulato)
      const githubConnected = !!localStorage.getItem('github_token');

      // Controlla Anthropic
      const anthropicConnected = !!import.meta.env.VITE_ANTHROPIC_API_KEY;

      setSystemStatus({
        boltDiyConnected: boltConnected,
        supabaseConnected,
        githubConnected,
        anthropicConnected,
        lastCheck: new Date().toISOString()
      });

    } catch (error) {
      console.error('Errore controllo stato sistema:', error);
    }
  };

  const checkSupabaseConnection = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/health/supabase');
      return response.ok;
    } catch {
      return false;
    }
  };

  const addSystemMessage = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'ai',
      timestamp: new Date(),
      type
    };
    
    setMessages(prev => [...prev, systemMessage]);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Aggiungi messaggio utente
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      // Invia a bolt.diy per elaborazione
      const response = await boltDiyIntegration.sendToBoltDiy('chat_message', {
        message: userMessage.text,
        context: {
          userId: userProfile?.id,
          userRole: userProfile?.ruolo,
          currentPage: window.location.pathname,
          systemStatus
        }
      });

      // Simula risposta AI
      setTimeout(() => {
        const aiResponse = response?.response || generateLocalResponse(userMessage.text);
        
        const aiMessage: Message = {
          id: Date.now().toString(),
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1500);

    } catch (error) {
      console.error('Errore invio messaggio:', error);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Mi dispiace, ho avuto un problema nel processare la tua richiesta. Verifica che bolt.diy sia in esecuzione.',
        sender: 'ai',
        timestamp: new Date(),
        type: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const generateLocalResponse = (userMessage: string): string => {
    const messageLower = userMessage.toLowerCase();

    if (messageLower.includes('errore') || messageLower.includes('bug')) {
      return 'Ho rilevato che stai riscontrando un errore. Sto analizzando i log dell\'applicazione per identificare la causa. Nel frattempo, prova a ricaricare la pagina o controlla la console del browser per maggiori dettagli.';
    }

    if (messageLower.includes('supabase') || messageLower.includes('database')) {
      return 'Per problemi con Supabase, verifica che le variabili d\'ambiente siano configurate correttamente. Posso aiutarti a diagnosticare problemi di connessione o policy RLS.';
    }

    if (messageLower.includes('performance') || messageLower.includes('lento')) {
      return 'Sto monitorando le performance dell\'applicazione. Posso suggerire ottimizzazioni per migliorare la velocità di caricamento e l\'uso della memoria.';
    }

    if (messageLower.includes('deploy') || messageLower.includes('pubblicare')) {
      return 'Posso aiutarti con il deployment dell\'applicazione su Vercel o Netlify. Assicurati che tutte le variabili d\'ambiente siano configurate correttamente.';
    }

    return 'Sono il tuo assistente AI integrato con bolt.diy. Posso aiutarti con debugging, ottimizzazioni, correzioni automatiche e molto altro. Cosa posso fare per te?';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const requestManualFix = async () => {
    try {
      await boltDiyIntegration.requestFix('Richiesta correzione manuale dall\'utente');
      toast.success('🤖 Richiesta inviata a bolt.diy');
    } catch (error) {
      toast.error('❌ Errore richiesta correzione');
    }
  };

  const downloadErrorLog = () => {
    const logData = {
      timestamp: new Date().toISOString(),
      errors: errorLog,
      systemStatus,
      appliedFixes
    };

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alcafer-erp-log-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 left-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        onClick={() => setIsOpen(true)}
      >
        <Brain className="h-6 w-6" />
        {systemStatus.boltDiyConnected && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        )}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        height: isMinimized ? 'auto' : '600px',
        width: isMinimized ? 'auto' : '450px'
      }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-6 left-6 bg-white rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <h3 className="font-medium">bolt.diy AI Assistant</h3>
          {systemStatus.boltDiyConnected && (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-1 overflow-hidden flex flex-col"
          >
            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              {[
                { id: 'chat', label: 'Chat', icon: MessageSquare },
                { id: 'monitoring', label: 'Monitor', icon: AlertTriangle },
                { id: 'fixes', label: 'Fixes', icon: Code },
                { id: 'settings', label: 'Config', icon: Settings }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'chat' && (
                <div className="flex flex-col h-full">
                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                    <div className="space-y-4">
                      {messages.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                          <Brain className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm">Ciao {userProfile?.nome}!</p>
                          <p className="text-xs mt-1">Sono il tuo assistente AI integrato con bolt.diy</p>
                        </div>
                      )}
                      
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.sender === 'user'
                                ? 'bg-purple-600 text-white'
                                : `bg-white border border-gray-200 text-gray-800 ${
                                    msg.type === 'error' ? 'border-red-200 bg-red-50' :
                                    msg.type === 'success' ? 'border-green-200 bg-green-50' :
                                    msg.type === 'fix' ? 'border-blue-200 bg-blue-50' : ''
                                  }`
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-start"
                        >
                          <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-[80%]">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-gray-200 bg-white">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Chiedi aiuto all'AI..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                          rows={1}
                          disabled={isTyping}
                        />
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || isTyping}
                        className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'monitoring' && (
                <div className="p-4 space-y-4">
                  <h4 className="font-medium text-gray-900">Stato Sistema</h4>
                  
                  <div className="space-y-3">
                    {[
                      { name: 'bolt.diy AI', connected: systemStatus.boltDiyConnected, icon: Brain },
                      { name: 'Supabase DB', connected: systemStatus.supabaseConnected, icon: Database },
                      { name: 'GitHub', connected: systemStatus.githubConnected, icon: Github },
                      { name: 'Anthropic AI', connected: systemStatus.anthropicConnected, icon: Zap }
                    ].map(service => {
                      const Icon = service.icon;
                      return (
                        <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium">{service.name}</span>
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${
                            service.connected ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {service.connected ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                            {service.connected ? 'Connesso' : 'Disconnesso'}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <button
                      onClick={checkSystemStatus}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Aggiorna Stato
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'fixes' && (
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Correzioni Applicate</h4>
                    <button
                      onClick={requestManualFix}
                      className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Richiedi Fix
                    </button>
                  </div>
                  
                  {appliedFixes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Code className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Nessuna correzione applicata</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {appliedFixes.map((fix, index) => (
                        <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">{fix.description}</span>
                          </div>
                          <p className="text-xs text-green-600">
                            {new Date(fix.timestamp).toLocaleString('it-IT')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="p-4 space-y-4">
                  <h4 className="font-medium text-gray-900">Configurazione</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Monitoraggio Automatico</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Correzioni Automatiche</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Integrazione GitHub</span>
                      <input type="checkbox" defaultChecked={systemStatus.githubConnected} className="rounded" />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    <button
                      onClick={downloadErrorLog}
                      className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Scarica Log
                    </button>
                    
                    <button
                      onClick={() => window.open('http://localhost:5174', '_blank')}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Brain className="h-4 w-4" />
                      Apri bolt.diy
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Powered by bolt.diy + Anthropic</span>
                <span>Ultimo check: {new Date(systemStatus.lastCheck).toLocaleTimeString()}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AIDevAssistant;