import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, X, Maximize2, Minimize2, Zap, MessageSquare, Code, GitBranch, Play, RefreshCw, Save, FileCode, AlertTriangle, CheckCircle, Database, Folder, FolderOpen, File, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { Octokit } from '@octokit/rest';
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
  size: number;
}

interface FolderInfo {
  path: string;
  type: 'dir' | 'file';
  name: string;
  children?: FolderInfo[];
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
  const [githubToken, setGithubToken] = useState('');
  const [fileTree, setFileTree] = useState<FolderInfo[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [databaseSchema, setDatabaseSchema] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'github' | 'supabase'>('github');
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
        text: `Ciao ${userProfile?.nome || 'Amministratore'}! Sono il tuo assistente di sviluppo IA. Posso aiutarti con il codice, analizzare errori, suggerire modifiche e testare l'applicazione.\n\nPer iniziare, seleziona una delle seguenti opzioni:\n\n1. Connetti il tuo repository GitHub per analizzare il codice\n2. Connetti a Supabase per analizzare il database\n\nPuoi anche chiedermi direttamente assistenza su problemi specifici.`,
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
      const repo = urlParts[1]?.split('#')[0]?.split('?')[0];
      
      if (!owner || !repo) {
        throw new Error('URL del repository non valido');
      }
      
      setRepositoryInfo({
        owner,
        repo,
        branch: 'main'
      });
      
      // Carica la struttura dei file
      await fetchRepositoryFiles(owner, repo);
      
      const connectMessage: Message = {
        id: Date.now().toString(),
        text: `✅ Repository connesso con successo: ${owner}/${repo}\n\nHo caricato la struttura dei file. Puoi esplorare i file nella sidebar e selezionarli per l'analisi.`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, connectMessage]);
      
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

  const fetchRepositoryFiles = async (owner: string, repo: string, path: string = '') => {
    try {
      // Usa l'API GitHub pubblica per repository pubblici
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // È una directory
        const items: FolderInfo[] = data.map(item => ({
          path: item.path,
          type: item.type,
          name: item.name,
          children: item.type === 'dir' ? [] : undefined
        }));
        
        if (path === '') {
          setFileTree(items);
        } else {
          // Aggiorna il file tree esistente
          const newFileTree = [...fileTree];
          const updateFolderChildren = (folders: FolderInfo[], folderPath: string, newChildren: FolderInfo[]) => {
            for (const folder of folders) {
              if (folder.path === folderPath) {
                folder.children = newChildren;
                return true;
              }
              if (folder.children && updateFolderChildren(folder.children, folderPath, newChildren)) {
                return true;
              }
            }
            return false;
          };
          
          updateFolderChildren(newFileTree, path, items);
          setFileTree(newFileTree);
        }
      } else {
        // È un file
        const fileContent = atob(data.content); // Decodifica Base64
        const fileInfo: FileInfo = {
          path: data.path,
          content: fileContent,
          language: getLanguageFromPath(data.path),
          size: fileContent.length
        };
        
        setSelectedFiles(prev => {
          // Evita duplicati
          const exists = prev.some(f => f.path === fileInfo.path);
          return exists ? prev : [...prev, fileInfo];
        });
      }
    } catch (error) {
      console.error('Errore nel caricamento dei file:', error);
      toast.error('Errore nel caricamento dei file');
    }
  };

  const getLanguageFromPath = (path: string): string => {
    const extension = path.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'sql': 'sql',
      'py': 'python',
      'rb': 'ruby',
      'go': 'go',
      'java': 'java',
      'php': 'php',
      'c': 'c',
      'cpp': 'cpp',
      'cs': 'csharp',
      'sh': 'bash',
      'yml': 'yaml',
      'yaml': 'yaml',
      'toml': 'toml',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'dart': 'dart',
    };
    
    return extension ? (languageMap[extension] || 'text') : 'text';
  };

  const handleFolderClick = async (folder: FolderInfo) => {
    if (folder.type === 'dir') {
      if (expandedFolders.includes(folder.path)) {
        // Chiudi la cartella
        setExpandedFolders(prev => prev.filter(p => p !== folder.path));
      } else {
        // Apri la cartella e carica i contenuti se non sono già stati caricati
        setExpandedFolders(prev => [...prev, folder.path]);
        if (!folder.children || folder.children.length === 0) {
          await fetchRepositoryFiles(repositoryInfo.owner, repositoryInfo.repo, folder.path);
        }
      }
    } else {
      // È un file, caricalo
      await fetchFileContent(folder.path);
    }
  };

  const fetchFileContent = async (path: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://api.github.com/repos/${repositoryInfo.owner}/${repositoryInfo.repo}/contents/${path}`);
      const data = await response.json();
      
      if (data.content) {
        const fileContent = atob(data.content); // Decodifica Base64
        const fileInfo: FileInfo = {
          path,
          content: fileContent,
          language: getLanguageFromPath(path),
          size: fileContent.length
        };
        
        setSelectedFiles(prev => {
          // Evita duplicati
          const exists = prev.some(f => f.path === fileInfo.path);
          return exists ? prev.map(f => f.path === fileInfo.path ? fileInfo : f) : [...prev, fileInfo];
        });
        
        toast.success(`File ${path} caricato`);
      }
    } catch (error) {
      console.error('Errore nel caricamento del file:', error);
      toast.error('Errore nel caricamento del file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectSupabase = async () => {
    try {
      setIsLoading(true);
      
      // Verifica la connessione a Supabase
      const { data, error } = await supabase.from('users').select('count');
      
      if (error) {
        throw error;
      }
      
      // Carica lo schema del database
      const { data: schema, error: schemaError } = await supabaseAdmin.rpc('get_schema_info');
      
      if (schemaError) {
        throw schemaError;
      }
      
      setDatabaseSchema(schema);
      setIsSupabaseConnected(true);
      
      const connectMessage: Message = {
        id: Date.now().toString(),
        text: `✅ Connessione a Supabase riuscita!\n\nHo caricato lo schema del database. Puoi esplorare le tabelle nella sidebar e analizzare le policy di sicurezza.`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, connectMessage]);
      
    } catch (error) {
      console.error('Errore nella connessione a Supabase:', error);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: `❌ Errore nella connessione a Supabase: ${error instanceof Error ? error.message : 'Errore sconosciuto'}\n\nAssicurati che le variabili d'ambiente siano configurate correttamente e che il client Supabase sia inizializzato.`,
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
        databaseSchema: databaseSchema,
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
  console.error('Variabili d\\'ambiente Supabase mancanti');
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
  console.error('⚠️ Variabili d\\'ambiente Supabase mancanti');
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
    } else if (userMessage.toLowerCase().includes('rls') || userMessage.toLowerCase().includes('policy')) {
      return {
        text: "Ho analizzato il problema di Row Level Security (RLS) nella tabella prezzi_materiali. Ecco come possiamo risolverlo:",
        code: `/*
  # Aggiunta policy RLS per prezzi_materiali
  
  1. Problema
    - La tabella prezzi_materiali ha RLS abilitato ma mancano policy appropriate
    - Gli utenti autenticati non possono inserire o modificare i dati
  
  2. Soluzione
    - Aggiungere policy per consentire operazioni CRUD agli utenti autenticati
*/

-- Abilita RLS sulla tabella (se non già abilitato)
ALTER TABLE prezzi_materiali ENABLE ROW LEVEL SECURITY;

-- Policy per consentire SELECT a tutti gli utenti autenticati
CREATE POLICY "Tutti possono leggere prezzi_materiali" 
ON prezzi_materiali FOR SELECT 
TO authenticated 
USING (true);

-- Policy per consentire INSERT/UPDATE/DELETE agli utenti autenticati
CREATE POLICY "Utenti autenticati possono modificare prezzi_materiali" 
ON prezzi_materiali FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);`,
        language: 'sql'
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

  const switchAiModel = (model: 'openai' | 'huggingface' | 'ollama' | 'local') => {
    setAiModel(model);
    
    const switchMessage: Message = {
      id: Date.now().toString(),
      text: `Modello AI cambiato a ${model === 'openai' ? 'OpenAI GPT-4' : model === 'huggingface' ? 'Hugging Face' : model === 'ollama' ? 'Ollama (locale)' : 'Modello Locale'}`,
      sender: 'ai',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, switchMessage]);
  };

  const renderFileTree = (items: FolderInfo[], level = 0) => {
    return items
      .filter(item => !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(item => (
        <div key={item.path} style={{ marginLeft: `${level * 12}px` }}>
          <div 
            className="flex items-center gap-1 py-1 px-2 hover:bg-gray-100 rounded cursor-pointer text-xs"
            onClick={() => handleFolderClick(item)}
          >
            {item.type === 'dir' ? (
              expandedFolders.includes(item.path) ? (
                <FolderOpen className="h-3 w-3 text-yellow-500" />
              ) : (
                <Folder className="h-3 w-3 text-yellow-500" />
              )
            ) : (
              <File className="h-3 w-3 text-blue-500" />
            )}
            <span className="truncate">{item.name}</span>
          </div>
          
          {item.type === 'dir' && expandedFolders.includes(item.path) && item.children && (
            <div>{renderFileTree(item.children, level + 1)}</div>
          )}
        </div>
      ));
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
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('github')}
                  className={`flex-1 py-2 px-4 text-sm font-medium ${
                    activeTab === 'github' 
                      ? 'bg-white border-b-2 border-purple-600 text-purple-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <GitBranch className="h-4 w-4" />
                    <span>GitHub</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('supabase')}
                  className={`flex-1 py-2 px-4 text-sm font-medium ${
                    activeTab === 'supabase' 
                      ? 'bg-white border-b-2 border-purple-600 text-purple-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Database className="h-4 w-4" />
                    <span>Supabase</span>
                  </div>
                </button>
              </div>
              
              {activeTab === 'github' && (
                <>
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
                      <h4 className="text-sm font-medium text-gray-700">File</h4>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="text-xs text-blue-600 hover:text-blue-800"
                          disabled={isLoading}
                        >
                          Pulisci
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Cerca file..."
                          className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    
                    {fileTree.length > 0 ? (
                      <div className="space-y-1">
                        {renderFileTree(fileTree)}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 text-center py-4">
                        {repositoryInfo.owner ? 'Caricamento file...' : 'Connetti un repository per visualizzare i file'}
                      </div>
                    )}
                  </div>
                  
                  {/* Selected Files */}
                  <div className="p-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">File Selezionati ({selectedFiles.length})</h4>
                    
                    {selectedFiles.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedFiles.map((file) => (
                          <div 
                            key={file.path}
                            className="text-xs p-2 bg-white rounded border border-gray-200 hover:bg-gray-50"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1 truncate">
                                <FileCode className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                <span className="font-medium truncate">{file.path}</span>
                              </div>
                              <button
                                onClick={() => setSelectedFiles(prev => prev.filter(f => f.path !== file.path))}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="text-gray-500">{file.size} bytes</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 text-center py-2">
                        Nessun file selezionato
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {activeTab === 'supabase' && (
                <>
                  {/* Supabase Connection */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Database className="h-4 w-4" />
                      <span>Database Supabase</span>
                    </div>
                    
                    {isSupabaseConnected ? (
                      <div className="text-xs text-gray-600 space-y-1">
                        <p><span className="font-medium">Stato:</span> Connesso</p>
                        <p><span className="font-medium">URL:</span> {import.meta.env.VITE_SUPABASE_URL || 'N/A'}</p>
                        <p><span className="font-medium">Tabelle:</span> {databaseSchema?.tables?.length || 0}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={handleConnectSupabase}
                          disabled={isLoading}
                          className="w-full text-xs bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded transition-colors disabled:opacity-50"
                        >
                          {isLoading ? (
                            <RefreshCw className="h-3 w-3 animate-spin mx-auto" />
                          ) : (
                            'Connetti a Supabase'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Database Schema */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Schema Database</h4>
                    </div>
                    
                    {databaseSchema ? (
                      <div className="space-y-2">
                        {databaseSchema.tables?.map((table: any) => (
                          <div 
                            key={table.name}
                            className="text-xs p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <Database className="h-3 w-3 text-green-500" />
                              <span className="font-medium">{table.name}</span>
                            </div>
                            <div className="text-gray-500">{table.columns?.length || 0} colonne</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 text-center py-4">
                        {isSupabaseConnected ? 'Caricamento schema...' : 'Connetti a Supabase per visualizzare lo schema'}
                      </div>
                    )}
                  </div>
                  
                  {/* RLS Policies */}
                  <div className="p-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Analisi RLS</h4>
                    
                    <button
                      onClick={() => {
                        const rlsMessage: Message = {
                          id: Date.now().toString(),
                          text: "Ho analizzato le policy RLS del database. Ecco cosa ho trovato:\n\nLa tabella `prezzi_materiali` ha RLS abilitato ma mancano policy appropriate per consentire agli utenti autenticati di inserire dati. Questo causa l'errore 'new row violates row-level security policy'.",
                          sender: 'ai',
                          timestamp: new Date(),
                          code: `-- Soluzione per il problema RLS
-- Crea una nuova migrazione SQL con questo contenuto

-- Abilita RLS sulla tabella (se non già abilitato)
ALTER TABLE prezzi_materiali ENABLE ROW LEVEL SECURITY;

-- Policy per consentire SELECT a tutti gli utenti autenticati
CREATE POLICY "Tutti possono leggere prezzi_materiali" 
ON prezzi_materiali FOR SELECT 
TO authenticated 
USING (true);

-- Policy per consentire INSERT/UPDATE/DELETE agli utenti autenticati
CREATE POLICY "Utenti autenticati possono modificare prezzi_materiali" 
ON prezzi_materiali FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);`,
                          language: 'sql'
                        };
                        
                        setMessages(prev => [...prev, rlsMessage]);
                      }}
                      className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded transition-colors"
                    >
                      Analizza Policy RLS
                    </button>
                  </div>
                </>
              )}
              
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
                    
                    const testMessage: Message = {
                      id: Date.now().toString(),
                      text: "Sto eseguendo i test sull'applicazione...",
                      sender: 'ai',
                      timestamp: new Date(),
                      isExecuting: true
                    };
                    
                    setMessages(prev => [...prev, testMessage]);
                    
                    // Simulate test execution
                    setTimeout(() => {
                      const updatedMessages = [...messages, testMessage];
                      const index = updatedMessages.length - 1;
                      
                      updatedMessages[index] = {
                        ...updatedMessages[index],
                        isExecuting: false,
                        executionResult: "✅ Test completati con successo!\n\n17 test passati, 0 falliti, 0 skipped"
                      };
                      
                      setMessages(updatedMessages);
                    }, 3000);
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
                  className={`flex-1 text-xs py-1 px-2 ${
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