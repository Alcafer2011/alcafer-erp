import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Zap, 
  RefreshCw, 
  MessageSquare,
  Bug,
  Lightbulb,
  Download
} from 'lucide-react';
import { boltDiyService, BoltDiyMessage } from '../../services/boltDiyService';
import toast from 'react-hot-toast';

const BoltDiyPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<BoltDiyMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Carica messaggi esistenti
    setMessages(boltDiyService.getMessages());
    setIsConnected(boltDiyService.isHealthy());

    // Aggiungi listener per nuovi messaggi
    const handleNewMessage = (message: BoltDiyMessage) => {
      setMessages(prev => [message, ...prev]);
    };

    boltDiyService.addListener(handleNewMessage);

    // Controlla salute ogni 30 secondi
    const healthInterval = setInterval(async () => {
      const healthy = await boltDiyService.checkHealth();
      setIsConnected(healthy);
    }, 30000);

    return () => {
      boltDiyService.removeListener(handleNewMessage);
      clearInterval(healthInterval);
    };
  }, []);

  const handleAnalyzeError = async () => {
    setIsLoading(true);
    try {
      const error = new Error('Errore di test per dimostrare bolt.diy');
      const response = await boltDiyService.analyzeError(error, {
        component: 'BoltDiyPanel',
        action: 'test_analysis'
      });
      
      if (response.success) {
        toast.success('Analisi completata!');
      } else {
        toast.error('Errore durante l\'analisi');
      }
    } catch (error) {
      toast.error('Errore durante l\'analisi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestFix = async () => {
    setIsLoading(true);
    try {
      const response = await boltDiyService.requestFix('Migliora le performance dell\'applicazione', {
        component: 'BoltDiyPanel',
        action: 'performance_improvement'
      });
      
      if (response.success) {
        toast.success('Richiesta elaborata!');
      } else {
        toast.error('Errore durante l\'elaborazione');
      }
    } catch (error) {
      toast.error('Errore durante l\'elaborazione');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChat = async () => {
    setIsLoading(true);
    try {
      const response = await boltDiyService.sendMessage('Come posso migliorare l\'applicazione?', {
        component: 'BoltDiyPanel',
        action: 'chat'
      });
      
      if (response.success) {
        toast.success('Messaggio inviato!');
      } else {
        toast.error('Errore durante l\'invio');
      }
    } catch (error) {
      toast.error('Errore durante l\'invio');
    } finally {
      setIsLoading(false);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'success': return 'bg-green-50 border-green-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed left-4 bottom-4 z-[1000]">
      {/* Pulsante per aprire/chiudere */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-full shadow-lg transition-all ${
          isConnected 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
            : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
        } opacity-80 hover:opacity-100`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={isConnected ? "Bolt.diy Attivo" : "Bolt.diy Disconnesso"}
      >
        <Brain className="h-5 w-5" />
      </motion.button>

      {/* Pannello Bolt.diy */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 mb-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className={`p-3 text-white flex items-center justify-between ${
              isConnected 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                : 'bg-gradient-to-r from-red-500 to-rose-500'
            }`}>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                <h4 className="font-medium">Bolt.diy AI</h4>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-300' : 'bg-red-300'}`} />
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Controlli */}
            <div className="p-3 border-b border-gray-200">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleAnalyzeError}
                  disabled={isLoading}
                  className="flex flex-col items-center p-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Bug className="h-4 w-4 mb-1" />
                  <span className="text-xs">Analizza</span>
                </button>
                <button
                  onClick={handleRequestFix}
                  disabled={isLoading}
                  className="flex flex-col items-center p-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Lightbulb className="h-4 w-4 mb-1" />
                  <span className="text-xs">Correggi</span>
                </button>
                <button
                  onClick={handleChat}
                  disabled={isLoading}
                  className="flex flex-col items-center p-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  <MessageSquare className="h-4 w-4 mb-1" />
                  <span className="text-xs">Chat</span>
                </button>
              </div>
            </div>

            {/* Messaggi */}
            <div className="flex-1 max-h-60 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nessun messaggio</p>
                  <p className="text-xs">Bolt.diy è pronto per l'analisi</p>
                </div>
              ) : (
                messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-2 rounded-lg border ${getMessageColor(message.type)}`}
                  >
                    <div className="flex items-start gap-2">
                      {getMessageIcon(message.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {message.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-1">
                            {message.suggestions.map((suggestion, index) => (
                              <p key={index} className="text-xs text-gray-600">
                                • {suggestion}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
              <span>Status: {isConnected ? 'Connesso' : 'Disconnesso'}</span>
              {isLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BoltDiyPanel;


