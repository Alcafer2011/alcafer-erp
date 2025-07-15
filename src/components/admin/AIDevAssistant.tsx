import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, X, Maximize2, Minimize2, Zap, MessageSquare, Code, GitBranch, Play, RefreshCw, Save, FileCode, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  code?: string;
  language?: string;
  error?: string;
  isExecuting?: boolean;
  executionResult?: string;
}

interface FileInfo {
  path: string;
  content: string;
  language: string;
}

const AIDevAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState('');
  const [repositoryInfo, setRepositoryInfo] = useState({ owner: '', repo: '', branch: 'main' });
  const [githubUrl, setGithubUrl] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userProfile } = useAuth();
  const [aiModel, setAiModel] = useState<'openai' | 'huggingface' | 'ollama' | 'local'>('openai');

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialMessage: Message = {
        id: Date.now().toString(),
        text: `Ciao ${userProfile?.nome || 'Amministratore'}! Sono il tuo assistente di sviluppo IA. Posso aiutarti con il codice, analizzare errori, suggerire modifiche e testare l'applicazione. Per iniziare, inserisci l'URL del tuo repository GitHub.`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages([initialMessage]);
    }
  }, [isOpen, messages.length, userProfile?.nome]);

  const handleConnectRepository = async () => {
    if (!githubUrl) {
      toast.error('Inserisci l\'URL del repository GitHub');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Estrai owner e repo dall'URL
      const urlParts = githubUrl.replace('https://github.com/', '').split('/');
      const owner = urlParts[0];
      const repo = urlParts[1];
      
      if (!owner || !repo) {
        throw new Error('URL del repository non valido');
      }
      
      setRepositoryInfo({
        owner,
        repo,
        branch: 'main'
      });
      
      // Simula il caricamento dei file
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const connectMessage: Message = {
        id: Date.now().toString(),
        text: `✅ Repository connesso con successo: ${owner}/${repo}\n\nOra posso aiutarti con il codice. Cosa vuoi fare?`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, connectMessage]);
      
      // Carica alcuni file di esempio
      await handleFileSelect();
      
    } catch (error) {
      console.error('Errore nella connessione al repository:', error);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: `❌ Errore nella connessione al repository: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        sender: 'ai',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // Add user message
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
      // Prepare context for AI
      const context = {
        userId: userProfile?.id,
        userRole: userProfile?.ruolo,
        selectedFiles: selectedFiles,
        repositoryInfo: repositoryInfo,
        previousMessages: messages.slice(-5)
      };
      
      // In a real implementation, this would call your AI service
      const response = await processAIRequest(message, context);
      
      // Add AI message with typing effect
      setTimeout(() => {
        const aiMessage: Message = {
          id: Date.now().toString(),
          text: response.text,
          sender: 'ai',
          timestamp: new Date(),
          code: response.code,
          language: response.language
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Mi dispiace, ho avuto un problema nel processare la tua richiesta. Puoi riprovare?',
        sender: 'ai',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  // Simulated AI processing function
  // In a real implementation, this would call your AI service (OpenAI, HuggingFace, etc.)
  const processAIRequest = async (userMessage: string, context: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, we'll return a hardcoded response based on the message
    if (userMessage.toLowerCase().includes('errore') || userMessage.toLowerCase().includes('bug')) {
      return {
        text: "Ho analizzato il codice e ho trovato un potenziale problema. Sembra che ci sia un errore nella gestione dell'autenticazione con Supabase. Ecco una possibile soluzione:",
        code: `// Fix per il problema di autenticazione
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica che le variabili d'ambiente siano definite
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variabili d\'ambiente Supabase mancanti');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funzione per verificare la connessione
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count');
    return !error;
  } catch (e) {
    return false;
  }
};`,
        language: 'typescript'
      };
    } else if (userMessage.toLowerCase().includes('deploy') || userMessage.toLowerCase().includes('pubblicare')) {
      return {
        text: "Posso aiutarti con il deploy dell'applicazione. Ecco i passaggi per fare il deploy su Netlify:",
        code: `# Passaggi per il deploy su Netlify
# 1. Costruisci l'applicazione
npm run build

# 2. Deploy su Netlify
npx netlify deploy --prod --dir=dist

# In alternativa, puoi configurare il deploy automatico collegando il repository GitHub
# a Netlify e impostando:
# - Build command: npm run build
# - Publish directory: dist`,
        language: 'bash'
      };
    } else if (userMessage.toLowerCase().includes('test') || userMessage.toLowerCase().includes('esegui')) {
      return {
        text: "Posso eseguire dei test sull'applicazione. Ecco un esempio di test che possiamo eseguire:",
        code: `// Test di connessione a Supabase
import { supabase } from './lib/supabase';

async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count');
    if (error) throw error;
    console.log('Connessione a Supabase riuscita!');
    return true;
  } catch (error) {
    console.error('Errore di connessione a Supabase:', error);
    return false;
  }
}

testSupabaseConnection();`,
        language: 'typescript'
      };
    } else if (userMessage.toLowerCase().includes('supabase') || userMessage.toLowerCase().includes('database')) {
      return {
        text: "Ho analizzato la configurazione di Supabase. Ecco alcune informazioni e suggerimenti per migliorare l'integrazione:",
        code: `// Miglioramenti per l'integrazione con Supabase
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/supabase';

// Usa variabili d'ambiente con fallback sicuri
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verifica che le variabili siano definite
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Variabili d\'ambiente Supabase mancanti');
}

// Crea il client con tipizzazione
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Funzione per verificare la connessione
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('users').select('count');
    return !error;
  } catch (error) {
    console.error('Errore di connessione a Supabase:', error);
    return false;
  }
};`,
        language: 'typescript'
      };
    } else {
      return {
        text: "Sono qui per aiutarti con il tuo codice. Posso analizzare il repository, suggerire miglioramenti, correggere errori o aiutarti a implementare nuove funzionalità. Dimmi cosa ti serve e sarò felice di aiutarti!",
        code: null,
        language: null
      };
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleFileSelect = async () => {
    // In a real implementation, this would open a file browser or fetch files from GitHub
    setIsLoading(true);
    
    try {
      // Simulate API call to fetch files
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Example files
      const files: FileInfo[] = [
        {
          path: 'src/lib/supabase.ts',
          content: `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);`,
          language: 'typescript'
        },
        {
          path: 'src/hooks/useAuth.ts',
          content: `import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check active sessions
    const session = supabase.auth.getSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return { user, loading };
};`,
          language: 'typescript'
        }
      ];
      
      setSelectedFiles(files);
      
      // Add a message about the selected files
      const fileMessage: Message = {
        id: Date.now().toString(),
        text: `Ho caricato ${files.length} file dal repository per l'analisi:`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fileMessage]);
      
    } catch (error) {
      console.error('Errore nel caricamento dei file:', error);
      toast.error('Errore nel caricamento dei file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteCode = async (code: string) => {
    // Find the message containing this code
    const messageIndex = messages.findIndex(m => m.code === code);
    if (messageIndex === -1) return;
    
    // Update the message to show it's executing
    const updatedMessages = [...messages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      isExecuting: true
    };
    setMessages(updatedMessages);
    
    try {
      // In a real implementation, this would send the code to a secure sandbox for execution
      setIsExecuting(true);
      
      // Simulate execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate execution result
      const result = "✅ Codice eseguito con successo!\n\nOutput:\nConnessione a Supabase riuscita!\nTutti i test sono passati.";
      
      // Update the message with the execution result
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        isExecuting: false,
        executionResult: result
      };
      setMessages(updatedMessages);
      
      setExecutionOutput(result);
    } catch (error) {
      console.error('Errore nell\'esecuzione del codice:', error);
      
      // Update the message with the error
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        isExecuting: false,
        executionResult: `❌ Errore nell'esecuzione del codice: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
      };
      setMessages(updatedMessages);
      
      toast.error('Errore nell\'esecuzione del codice');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSaveCode = async (code: string, path: string) => {
    try {
      // In a real implementation, this would save the code to the file system or GitHub
      toast.success(`Codice salvato in ${path}`);
      
      // Add a message about the saved code
      const saveMessage: Message = {
        id: Date.now().toString(),
        text: `Ho salvato le modifiche al file ${path}`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, saveMessage]);
    } catch (error) {
      console.error('Errore nel salvataggio del codice:', error);
      toast.error('Errore nel salvataggio del codice');
    }
  };

  const handleDeploy = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, this would trigger a deployment process
      // Simulate deployment
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Add a message about the deployment
      const deployMessage: Message = {
        id: Date.now().toString(),
        text: `Ho avviato il processo di deploy dell'applicazione. Il deploy è stato completato con successo! L'applicazione è ora disponibile all'indirizzo: https://alcafer-erp.netlify.app`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, deployMessage]);
      toast.success('Deploy completato con successo!');
    } catch (error) {
      console.error('Errore nel deploy:', error);
      toast.error('Errore nel deploy');
      
      // Add an error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: `Mi dispiace, c'è stato un errore durante il deploy: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        sender: 'ai',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const switchAiModel = (model: 'openai' | 'huggingface' | 'local') => {
    setAiModel(model);
    
    const switchMessage: Message = {
      id: Date.now().toString(),
      text: `Modello AI cambiato a ${model === 'openai' ? 'OpenAI GPT-4' : model === 'huggingface' ? 'Hugging Face' : 'Modello Locale'}`,
      sender: 'ai',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, switchMessage]);
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        onClick={() => setIsOpen(true)}
      >
        <Brain className="h-6 w-6" />
      </motion.button>
    );
  }

  // Only show to admin users
  if (userProfile?.ruolo !== 'alessandro') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        height: isMinimized ? 'auto' : '80vh',
        width: isMinimized ? 'auto' : '80vw'
      }}
      transition={{ duration: 0.2 }}
      className={`fixed bottom-0 right-0 bg-white rounded-tl-xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200`}
      style={{ maxWidth: '1200px' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <h3 className="font-medium">Assistente Sviluppo IA - Modalità Amministratore</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleMinimize}
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
            className="flex-1 overflow-hidden flex"
          >
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
              {/* Repository Info */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <GitBranch className="h-4 w-4" />
                  <span>Repository</span>
                </div>
                
                {repositoryInfo.owner ? (
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><span className="font-medium">Owner:</span> {repositoryInfo.owner}</p>
                    <p><span className="font-medium">Repo:</span> {repositoryInfo.repo}</p>
                    <p><span className="font-medium">Branch:</span> {repositoryInfo.branch}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="URL repository GitHub"
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                    <button
                      onClick={handleConnectRepository}
                      disabled={isLoading}
                      className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-3 w-3 animate-spin mx-auto" />
                      ) : (
                        'Connetti Repository'
                      )}
                    </button>
                  </div>
                )}
              </div>
              
              {/* Files */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">File Selezionati</h4>
                  <button 
                    onClick={handleFileSelect}
                    className="text-xs text-blue-600 hover:text-blue-800"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      'Seleziona'
                    )}
                  </button>
                </div>
                
                {selectedFiles.length > 0 ? (
                  <div className="space-y-2">
                    {selectedFiles.map((file) => (
                      <div 
                        key={file.path}
                        className="text-xs p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <FileCode className="h-3 w-3 text-blue-500" />
                          <span className="font-medium truncate">{file.path}</span>
                        </div>
                        <div className="text-gray-500 truncate">{file.content.length} caratteri</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 text-center py-4">
                    Nessun file selezionato
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="p-4 border-t border-gray-200 space-y-2">
                <button
                  onClick={handleDeploy}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Deploy Applicazione
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    // In a real implementation, this would run tests
                    toast.success('Test avviati');
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                >
                  <Play className="h-4 w-4" />
                  Esegui Test
                </button>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* AI Model Selector */}
              <div className="flex border-b border-gray-200 bg-gray-50 p-2">
                <button
                  onClick={() => switchAiModel('openai')} 
                  className={`flex-1 text-xs py-1 px-2 rounded-l-md ${
                    aiModel === 'openai' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="h-3 w-3" />
                    <span>OpenAI GPT-4</span>
                  </div>
                </button>
                <button
                  onClick={() => switchAiModel('huggingface')}
                  className={`flex-1 text-xs py-1 px-2 border-r border-gray-200 ${
                    aiModel === 'huggingface' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Brain className="h-3 w-3" />
                    <span>Hugging Face</span>
                  </div>
                </button>
                <button
                  onClick={() => switchAiModel('ollama')}
                  className={`flex-1 text-xs py-1 px-2 ${
                    aiModel === 'ollama' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className="h-3 w-3">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm0 22.5C6.2 22.5 1.5 17.8 1.5 12S6.2 1.5 12 1.5 22.5 6.2 22.5 12 17.8 22.5 12 22.5zm0-19.5c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 16.5c-4.1 0-7.5-3.4-7.5-7.5S7.9 4.5 12 4.5s7.5 3.4 7.5 7.5-3.4 7.5-7.5 7.5z"/>
                    </svg>
                    <span>Ollama</span>
                  </div>
                </button>
                <button
                  onClick={() => switchAiModel('local')}
                  className={`flex-1 text-xs py-1 px-2 rounded-r-md ${
                    aiModel === 'local' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Code className="h-3 w-3" />
                    <span>Modello Locale</span>
                  </div>
                </button>
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <div className="space-y-4">
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
                            : 'bg-white border border-gray-200 text-gray-800'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        
                        {msg.code && (
                          <div className="mt-3 bg-gray-800 rounded-md overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 bg-gray-700">
                              <span className="text-xs text-gray-300">{msg.language || 'code'}</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleExecuteCode(msg.code!)}
                                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition-colors"
                                  disabled={msg.isExecuting}
                                >
                                  {msg.isExecuting ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    'Esegui'
                                  )}
                                </button>
                                <button
                                  onClick={() => handleSaveCode(msg.code!, 'path/to/file.ts')}
                                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                                >
                                  Salva
                                </button>
                              </div>
                            </div>
                            <pre className="p-4 text-xs text-gray-300 overflow-x-auto">
                              <code>{msg.code}</code>
                            </pre>
                          </div>
                        )}
                        
                        {msg.executionResult && (
                          <div className="mt-3 bg-gray-100 rounded-md p-3 text-xs">
                            <pre className="whitespace-pre-wrap">{msg.executionResult}</pre>
                          </div>
                        )}
                        
                        {msg.error && (
                          <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-3 text-xs text-red-700">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className="h-3 w-3" />
                              <span className="font-medium">Errore</span>
                            </div>
                            <p>{msg.error}</p>
                          </div>
                        )}
                        
                        <p className="text-xs mt-2 opacity-70">
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
                      placeholder="Chiedi all'IA di analizzare codice, correggere errori, implementare funzionalità..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={2}
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
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Powered by {
                      aiModel === 'openai' ? 'OpenAI GPT-4' : 
                      aiModel === 'huggingface' ? 'Hugging Face' : 
                      aiModel === 'ollama' ? 'Ollama (locale)' : 
                      'Modello Locale'
                    }
                  </div>
                  <div className="text-xs text-purple-600 flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    Assistente Privato - Solo Amministratore
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AIDevAssistant;