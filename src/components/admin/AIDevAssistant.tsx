import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, X, Send, Code, Database, Github, 
  Zap, Settings, Maximize2, Minimize2, 
  FileCode, FolderOpen, RefreshCw, Search,
  Save, Play, CheckCircle, AlertTriangle,
  Upload, Download, ExternalLink, Rocket,
  Server, Shield, Terminal, Cpu
} from 'lucide-react';
import { aiDevService } from '../../services/aiDevService';
import { boltDiyService } from '../../services/boltDiyService';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  text: string;
  code?: string;
  language?: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
}

interface DeployOptions {
  provider: 'vercel' | 'netlify';
  buildCommand: string;
  outputDir: string;
  environmentVariables: Record<string, string>;
}

const AIDevAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'code' | 'supabase' | 'github' | 'deploy'>('chat');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [aiModel, setAiModel] = useState<'openai' | 'boltdiy' | 'ollama' | 'huggingface' | 'local'>('boltdiy');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [databaseSchema, setDatabaseSchema] = useState<any>(null);
  const [rlsPolicies, setRlsPolicies] = useState<any>(null);
  const [deployOptions, setDeployOptions] = useState<DeployOptions>({
    provider: 'netlify',
    buildCommand: 'npm run build',
    outputDir: 'dist',
    environmentVariables: {}
  });
  const [deployStatus, setDeployStatus] = useState<any>(null);
  const [githubRepo, setGithubRepo] = useState<string>('');
  const [githubToken, setGithubToken] = useState<string>('');
  const [isGithubConnected, setIsGithubConnected] = useState(false);

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
        text: `Ciao! Sono Bolt.diy, il tuo assistente AI per lo sviluppo. Posso aiutarti con:

1. 💻 Analisi e miglioramento del codice
2. 🔧 Risoluzione di errori e bug
3. 🔐 Configurazione delle policy RLS di Supabase
4. 📊 Analisi dello schema del database
5. 🚀 Deploy su Vercel o Netlify
6. 📁 Gestione dei file su GitHub

Come posso aiutarti oggi?`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages([initialMessage]);
    }
  }, [isOpen, messages.length]);

  // Initialize Bolt.diy
  useEffect(() => {
    const initBoltDiy = async () => {
      await boltDiyService.initialize();
    };
    
    initBoltDiy();
  }, []);

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
      let response;
      
      // Determina quale servizio AI utilizzare
      if (aiModel === 'boltdiy') {
        response = await boltDiyService.askQuestion(message);
      } else if (aiModel === 'openai' || aiModel === 'ollama' || aiModel === 'huggingface') {
        const result = await aiDevService.analyzeCode(message, {
          model: aiModel,
          previousMessages: messages.slice(-5)
        });
        response = result.text;
        
        // Se c'è del codice, aggiungilo separatamente
        if (result.code) {
          response += `\n\n\`\`\`${result.language || ''}\n${result.code}\n\`\`\``;
        }
      } else {
        // Modello locale
        const result = await aiDevService.analyzeCode(message, {});
        response = result.text;
      }
      
      // Add AI message with typing effect
      setTimeout(() => {
        const aiMessage: Message = {
          id: Date.now().toString(),
          text: response,
          sender: 'ai',
          timestamp: new Date()
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
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
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

  const switchAiModel = (model: 'openai' | 'boltdiy' | 'ollama' | 'huggingface' | 'local') => {
    setAiModel(model);
    
    const switchMessage: Message = {
      id: Date.now().toString(),
      text: `Modello AI cambiato a ${
        model === 'openai' ? 'OpenAI GPT-4' : 
        model === 'boltdiy' ? 'Bolt.diy' :
        model === 'ollama' ? 'Ollama (locale)' : 
        model === 'huggingface' ? 'Hugging Face' : 
        'Modello Locale'
      }`,
      sender: 'ai',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, switchMessage]);
  };

  const fetchFileTree = async () => {
    setIsLoading(true);
    try {
      // Simula il recupero della struttura dei file
      const files = await aiDevService.getRepositoryFiles('owner', 'repo', '');
      
      // Costruisci l'albero dei file
      const tree: FileNode[] = [];
      
      files.forEach(file => {
        const parts = file.path.split('/');
        let currentLevel = tree;
        
        parts.forEach((part, index) => {
          const isFile = index === parts.length - 1;
          const existingNode = currentLevel.find(node => node.name === part);
          
          if (existingNode) {
            if (!isFile) {
              currentLevel = existingNode.children || [];
            }
          } else {
            const newNode: FileNode = {
              name: part,
              path: parts.slice(0, index + 1).join('/'),
              type: isFile ? 'file' : 'folder',
              children: isFile ? undefined : [],
              content: isFile ? file.content : undefined
            };
            
            currentLevel.push(newNode);
            
            if (!isFile) {
              currentLevel = newNode.children || [];
            }
          }
        });
      });
      
      setFileTree(tree);
    } catch (error) {
      console.error('Error fetching file tree:', error);
      toast.error('Errore nel recupero dei file');
    } finally {
      setIsLoading(false);
    }
  };

  const selectFile = (file: FileNode) => {
    if (file.type === 'file') {
      setSelectedFile(file);
      setFileContent(file.content || '');
    }
  };

  const saveFile = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    try {
      // Salva su GitHub
      const githubSuccess = await aiDevService.saveCodeChanges(
        selectedFile.path,
        fileContent,
        `Aggiornamento di ${selectedFile.path} tramite Bolt.diy`
      );
      
      // Salva anche su Supabase se connesso
      let supabaseSuccess = false;
      if (isConnected) {
        supabaseSuccess = await boltDiyService.saveToSupabase('code_files', {
          path: selectedFile.path,
          content: fileContent,
          updated_at: new Date().toISOString()
        });
      }
      
      if (githubSuccess) {
        toast.success(`File salvato ${supabaseSuccess ? 'su GitHub e Supabase' : 'su GitHub'}`);
        
        // Aggiorna il file nell'albero
        const updatedTree = [...fileTree];
        updateFileInTree(updatedTree, selectedFile.path, fileContent);
        setFileTree(updatedTree);
      } else {
        toast.error('Errore nel salvataggio del file');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      toast.error('Errore nel salvataggio del file');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFileInTree = (tree: FileNode[], path: string, content: string) => {
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    
    for (const node of tree) {
      if (node.type === 'file' && node.name === fileName && node.path === path) {
        node.content = content;
        return;
      } else if (node.type === 'folder' && node.children) {
        updateFileInTree(node.children, path, content);
      }
    }
  };

  const connectToSupabase = async () => {
    setIsLoading(true);
    try {
      const isConnected = await supabase.from('clienti').select('count').limit(1);
      
      if (isConnected.error) {
        throw isConnected.error;
      }
      
      setIsConnected(true);
      toast.success('Connesso a Supabase');
      
      // Recupera lo schema del database
      const schema = await aiDevService.getDatabaseSchema();
      setDatabaseSchema(schema);
      
      // Recupera le policy RLS
      const policies = await aiDevService.analyzeRLSPolicies();
      setRlsPolicies(policies);
    } catch (error) {
      console.error('Error connecting to Supabase:', error);
      toast.error('Errore nella connessione a Supabase');
    } finally {
      setIsLoading(false);
    }
  };

  const fixRLSPolicy = async (tableName: string) => {
    setIsLoading(true);
    try {
      const sql = await boltDiyService.fixRLSPolicies(tableName);
      
      // Crea una nuova migrazione
      const success = await boltDiyService.createMigration(
        sql,
        `fix_rls_policies_for_${tableName}`
      );
      
      if (success) {
        toast.success(`Policy RLS generate per ${tableName}`);
        
        // Aggiungi un messaggio nella chat
        const message: Message = {
          id: Date.now().toString(),
          text: `Ho generato le policy RLS per la tabella ${tableName}. Ecco il SQL:`,
          code: sql,
          language: 'sql',
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, message]);
      } else {
        toast.error(`Errore nella generazione delle policy RLS per ${tableName}`);
      }
    } catch (error) {
      console.error('Error fixing RLS policy:', error);
      toast.error('Errore nella generazione delle policy RLS');
    } finally {
      setIsLoading(false);
    }
  };

  const connectToGitHub = async () => {
    if (!githubRepo || !githubToken) {
      toast.error('Inserisci repository e token GitHub');
      return;
    }
    
    setIsLoading(true);
    try {
      // Simula la connessione a GitHub
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsGithubConnected(true);
      toast.success('Connesso a GitHub');
      
      // Recupera i file
      await fetchFileTree();
    } catch (error) {
      console.error('Error connecting to GitHub:', error);
      toast.error('Errore nella connessione a GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  const deployProject = async () => {
    setIsLoading(true);
    try {
      const result = await boltDiyService.deployToProvider(
        deployOptions.provider,
        deployOptions
      );
      
      if (result.success) {
        setDeployStatus(result);
        toast.success(`Deployment su ${deployOptions.provider} completato!`);
      } else {
        toast.error(`Errore nel deployment su ${deployOptions.provider}`);
      }
    } catch (error) {
      console.error('Error deploying project:', error);
      toast.error('Errore nel deployment');
    } finally {
      setIsLoading(false);
    }
  };

  const renderFileTree = (nodes: FileNode[], level: number = 0) => {
    return (
      <div style={{ marginLeft: level > 0 ? '1rem' : '0' }}>
        {nodes.map(node => (
          <div key={node.path}>
            <div
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                selectedFile?.path === node.path ? 'bg-purple-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => node.type === 'file' ? selectFile(node) : toggleFolder(node)}
            >
              {node.type === 'folder' ? (
                <FolderOpen className="h-4 w-4 text-yellow-500" />
              ) : (
                <FileCode className="h-4 w-4 text-blue-500" />
              )}
              <span className="text-sm truncate">{node.name}</span>
            </div>
            
            {node.type === 'folder' && node.children && (
              <div>
                {renderFileTree(node.children, level + 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const toggleFolder = (folder: FileNode) => {
    // Implementazione per espandere/collassare cartelle
    console.log('Toggle folder:', folder.path);
  };

  const searchFiles = (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      // Implementazione della ricerca file
      const results = searchInTree(fileTree, query.toLowerCase());
      
      if (results.length > 0) {
        toast.success(`Trovati ${results.length} file`);
        
        // Mostra i risultati nella chat
        const resultsMessage: Message = {
          id: Date.now().toString(),
          text: `Ho trovato ${results.length} file che corrispondono alla ricerca "${query}":`,
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, resultsMessage]);
        
        // Seleziona il primo risultato
        selectFile(results[0]);
      } else {
        toast.error(`Nessun file trovato per "${query}"`);
      }
    } catch (error) {
      console.error('Error searching files:', error);
      toast.error('Errore nella ricerca dei file');
    } finally {
      setIsLoading(false);
    }
  };

  const searchInTree = (nodes: FileNode[], query: string): FileNode[] => {
    const results: FileNode[] = [];
    
    for (const node of nodes) {
      if (node.name.toLowerCase().includes(query) || node.path.toLowerCase().includes(query)) {
        if (node.type === 'file') {
          results.push(node);
        }
      }
      
      if (node.type === 'folder' && node.children) {
        results.push(...searchInTree(node.children, query));
      }
    }
    
    return results;
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
      className={`fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <h3 className="font-medium">Bolt.diy - Assistente Sviluppo</h3>
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
            <div className="w-16 bg-gray-100 border-r border-gray-200 flex flex-col items-center py-4">
              <button
                onClick={() => setActiveTab('chat')}
                className={`p-3 rounded-lg mb-2 ${
                  activeTab === 'chat' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-200'
                }`}
                title="Chat"
              >
                <Brain className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`p-3 rounded-lg mb-2 ${
                  activeTab === 'code' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-200'
                }`}
                title="Codice"
              >
                <Code className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveTab('supabase')}
                className={`p-3 rounded-lg mb-2 ${
                  activeTab === 'supabase' ? 'bg-green-100 text-green-600' : 'text-gray-500 hover:bg-gray-200'
                }`}
                title="Supabase"
              >
                <Database className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveTab('github')}
                className={`p-3 rounded-lg mb-2 ${
                  activeTab === 'github' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-200'
                }`}
                title="GitHub"
              >
                <Github className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveTab('deploy')}
                className={`p-3 rounded-lg mb-2 ${
                  activeTab === 'deploy' ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-200'
                }`}
                title="Deploy"
              >
                <Rocket className="h-5 w-5" />
              </button>
              
              <div className="mt-auto">
                <button
                  className="p-3 rounded-lg text-gray-500 hover:bg-gray-200"
                  title="Impostazioni"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* AI Model Selector */}
              <div className="flex border-b border-gray-200 bg-gray-50 p-2">
                <button
                  onClick={() => switchAiModel('boltdiy')}
                  className={`flex-1 text-xs py-1 px-2 rounded-l-md ${
                    aiModel === 'boltdiy' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="h-3 w-3" />
                    <span>Bolt.diy</span>
                  </div>
                </button>
                <button
                  onClick={() => switchAiModel('openai')}
                  className={`flex-1 text-xs py-1 px-2 ${
                    aiModel === 'openai' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Brain className="h-3 w-3" />
                    <span>GPT-4</span>
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
                    <Cpu className="h-3 w-3" />
                    <span>Ollama</span>
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
                    <Server className="h-3 w-3" />
                    <span>HF</span>
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
                    <Terminal className="h-3 w-3" />
                    <span>Locale</span>
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'chat' && (
                  <div className="flex flex-col h-full">
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
                                <div className="mt-2 bg-gray-800 rounded-md p-3 overflow-x-auto">
                                  <pre className="text-xs text-white">{msg.code}</pre>
                                </div>
                              )}
                              
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
                            placeholder="Chiedi a Bolt.diy..."
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
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Powered by Bolt.diy
                        </div>
                        <div className="text-xs text-purple-600 flex items-center gap-1">
                          <Brain className="h-3 w-3" />
                          Assistente Sviluppo
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'code' && (
                  <div className="flex h-full">
                    {/* File Explorer */}
                    <div className="w-1/4 border-r border-gray-200 overflow-y-auto">
                      <div className="p-3 border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Cerca file..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onKeyDown={(e) => e.key === 'Enter' && searchFiles(searchQuery)}
                          />
                          <button
                            onClick={() => searchFiles(searchQuery)}
                            className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Search className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-700">File Explorer</h4>
                          <button
                            onClick={fetchFileTree}
                            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Aggiorna"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        {isLoading ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                          </div>
                        ) : fileTree.length > 0 ? (
                          renderFileTree(fileTree)
                        ) : (
                          <div className="text-center py-4 text-sm text-gray-500">
                            <p>Nessun file disponibile</p>
                            <button
                              onClick={fetchFileTree}
                              className="mt-2 text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              Carica file
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Code Editor */}
                    <div className="flex-1 flex flex-col">
                      <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCode className="h-4 w-4 text-blue-600" />
                          <h4 className="text-sm font-medium text-gray-700">
                            {selectedFile ? selectedFile.path : 'Nessun file selezionato'}
                          </h4>
                        </div>
                        
                        {selectedFile && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={saveFile}
                              disabled={isLoading}
                              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                              title="Salva"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                // Analizza il codice
                                setActiveTab('chat');
                                setMessage(`Analizza questo codice:\n\n\`\`\`\n${fileContent}\n\`\`\``);
                                handleSendMessage();
                              }}
                              className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Analizza con AI"
                            >
                              <Brain className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 overflow-y-auto">
                        {selectedFile ? (
                          <textarea
                            value={fileContent}
                            onChange={(e) => setFileContent(e.target.value)}
                            className="w-full h-full p-4 font-mono text-sm focus:outline-none"
                            spellCheck={false}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            <p>Seleziona un file per visualizzarlo</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'supabase' && (
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-900">Supabase Database</h4>
                        
                        {!isConnected ? (
                          <button
                            onClick={connectToSupabase}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            {isLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Connessione...</span>
                              </>
                            ) : (
                              <>
                                <Database className="h-4 w-4" />
                                <span>Connetti a Supabase</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Connesso</span>
                          </div>
                        )}
                      </div>
                      
                      {isConnected && (
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <h5 className="text-sm font-medium text-green-800 mb-1">Tabelle</h5>
                            <p className="text-2xl font-bold text-green-600">
                              {databaseSchema?.tables?.length || 0}
                            </p>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <h5 className="text-sm font-medium text-blue-800 mb-1">Viste</h5>
                            <p className="text-2xl font-bold text-blue-600">
                              {databaseSchema?.views?.length || 0}
                            </p>
                          </div>
                          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                            <h5 className="text-sm font-medium text-purple-800 mb-1">Funzioni</h5>
                            <p className="text-2xl font-bold text-purple-600">
                              {databaseSchema?.functions?.length || 0}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4">
                      {isConnected ? (
                        <div className="space-y-6">
                          {/* Schema Database */}
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="p-3 border-b border-gray-200 bg-gray-50">
                              <h5 className="font-medium text-gray-900">Schema Database</h5>
                            </div>
                            <div className="p-4">
                              {databaseSchema?.tables?.length > 0 ? (
                                <div className="space-y-4">
                                  {databaseSchema.tables.map((table: any) => (
                                    <div key={table.name} className="border border-gray-200 rounded-lg overflow-hidden">
                                      <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Database className="h-4 w-4 text-blue-600" />
                                          <h6 className="font-medium text-gray-900">{table.name}</h6>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            table.is_rls_enabled 
                                              ? 'bg-green-100 text-green-800' 
                                              : 'bg-red-100 text-red-800'
                                          }`}>
                                            {table.is_rls_enabled ? 'RLS Attivo' : 'RLS Disattivato'}
                                          </span>
                                          
                                          {!table.is_rls_enabled && (
                                            <button
                                              onClick={() => fixRLSPolicy(table.name)}
                                              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                                            >
                                              Correggi RLS
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="p-2">
                                        <div className="text-xs text-gray-500 mb-1">Colonne:</div>
                                        <div className="grid grid-cols-3 gap-2">
                                          {table.columns.slice(0, 6).map((column: any) => (
                                            <div key={column.name} className="text-xs bg-gray-50 p-1 rounded">
                                              <span className="font-medium">{column.name}</span>
                                              <span className="text-gray-500"> ({column.type})</span>
                                            </div>
                                          ))}
                                          {table.columns.length > 6 && (
                                            <div className="text-xs bg-gray-50 p-1 rounded text-gray-500">
                                              +{table.columns.length - 6} altre
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-gray-500">
                                  <p>Nessuna tabella disponibile</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Policy RLS */}
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="p-3 border-b border-gray-200 bg-gray-50">
                              <h5 className="font-medium text-gray-900">Policy RLS</h5>
                            </div>
                            <div className="p-4">
                              {rlsPolicies?.length > 0 ? (
                                <div className="space-y-4">
                                  {rlsPolicies.map((policy: any) => (
                                    <div key={policy.id} className="border border-gray-200 rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <Shield className="h-4 w-4 text-green-600" />
                                          <h6 className="font-medium text-gray-900">{policy.name}</h6>
                                        </div>
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                          {policy.table}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-600 mb-1">
                                        {policy.definition}
                                      </p>
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="bg-gray-100 px-1 rounded">{policy.operation}</span>
                                        <span>per</span>
                                        <span className="bg-gray-100 px-1 rounded">{policy.roles.join(', ')}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-gray-500">
                                  <p>Nessuna policy RLS disponibile</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <Database className="h-16 w-16 text-gray-300 mb-4" />
                          <h5 className="text-lg font-medium text-gray-900 mb-2">Connetti a Supabase</h5>
                          <p className="text-gray-500 text-center max-w-md mb-6">
                            Connettiti al tuo database Supabase per visualizzare lo schema, analizzare le policy RLS e generare migrazioni SQL.
                          </p>
                          <button
                            onClick={connectToSupabase}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            {isLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Connessione...</span>
                              </>
                            ) : (
                              <>
                                <Database className="h-4 w-4" />
                                <span>Connetti a Supabase</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'github' && (
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">GitHub Repository</h4>
                      
                      {!isGithubConnected ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="githubRepo" className="block text-sm font-medium text-gray-700 mb-1">
                              Repository (owner/repo)
                            </label>
                            <input
                              type="text"
                              id="githubRepo"
                              value={githubRepo}
                              onChange={(e) => setGithubRepo(e.target.value)}
                              placeholder="es. stackblitz-labs/bolt.diy"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label htmlFor="githubToken" className="block text-sm font-medium text-gray-700 mb-1">
                              Token GitHub
                            </label>
                            <input
                              type="password"
                              id="githubToken"
                              value={githubToken}
                              onChange={(e) => setGithubToken(e.target.value)}
                              placeholder="ghp_..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Github className="h-5 w-5 text-gray-900" />
                            <span className="font-medium">{githubRepo}</span>
                          </div>
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Connesso</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4">
                      {isGithubConnected ? (
                        <div className="space-y-6">
                          {/* File Explorer */}
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                              <h5 className="font-medium text-gray-900">File Repository</h5>
                              <button
                                onClick={fetchFileTree}
                                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Aggiorna"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="p-4 max-h-96 overflow-y-auto">
                              {isLoading ? (
                                <div className="flex justify-center py-4">
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                                </div>
                              ) : fileTree.length > 0 ? (
                                renderFileTree(fileTree)
                              ) : (
                                <div className="text-center py-4 text-gray-500">
                                  <p>Nessun file disponibile</p>
                                  <button
                                    onClick={fetchFileTree}
                                    className="mt-2 text-blue-600 hover:text-blue-800 text-xs font-medium"
                                  >
                                    Carica file
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Azioni Repository */}
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="p-3 border-b border-gray-200 bg-gray-50">
                              <h5 className="font-medium text-gray-900">Azioni Repository</h5>
                            </div>
                            <div className="p-4">
                              <div className="grid grid-cols-2 gap-4">
                                <button
                                  onClick={() => {
                                    // Implementazione per il pull
                                    toast.success('Pull eseguito con successo');
                                  }}
                                  className="flex items-center justify-center gap-2 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                  <Download className="h-4 w-4 text-gray-700" />
                                  <span className="text-sm font-medium">Pull</span>
                                </button>
                                <button
                                  onClick={() => {
                                    // Implementazione per il push
                                    toast.success('Push eseguito con successo');
                                  }}
                                  className="flex items-center justify-center gap-2 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                  <Upload className="h-4 w-4 text-gray-700" />
                                  <span className="text-sm font-medium">Push</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <Github className="h-16 w-16 text-gray-300 mb-4" />
                          <h5 className="text-lg font-medium text-gray-900 mb-2">Connetti a GitHub</h5>
                          <p className="text-gray-500 text-center max-w-md mb-6">
                            Connettiti al tuo repository GitHub per visualizzare, modificare e salvare i file del progetto.
                          </p>
                          <button
                            onClick={connectToGitHub}
                            disabled={isLoading}
                            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            {isLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Connessione...</span>
                              </>
                            ) : (
                              <>
                                <Github className="h-4 w-4" />
                                <span>Connetti a GitHub</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'deploy' && (
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Deploy Applicazione</h4>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <button
                          onClick={() => setDeployOptions(prev => ({ ...prev, provider: 'vercel' }))}
                          className={`p-4 rounded-lg border-2 transition-colors ${
                            deployOptions.provider === 'vercel'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-center mb-2">
                            <svg viewBox="0 0 76 65" fill="none" className="h-8 w-8">
                              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill={deployOptions.provider === 'vercel' ? '#0070F3' : '#000000'} />
                            </svg>
                          </div>
                          <p className="text-center font-medium">Vercel</p>
                        </button>
                        
                        <button
                          onClick={() => setDeployOptions(prev => ({ ...prev, provider: 'netlify' }))}
                          className={`p-4 rounded-lg border-2 transition-colors ${
                            deployOptions.provider === 'netlify'
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-center mb-2">
                            <svg viewBox="0 0 40 40" className="h-8 w-8">
                              <path fill={deployOptions.provider === 'netlify' ? '#00AD9F' : '#000000'} d="M28.589 14.135l-.014-.006c-.008-.003-.016-.006-.023-.013a.11.11 0 0 1-.028-.093l.773-4.726 3.625 3.626-3.77 1.604a.083.083 0 0 1-.033.006h-.015c-.005-.003-.01-.007-.02-.017a1.716 1.716 0 0 0-.495-.381zm5.258-.288l3.876 3.876c.805.806 1.208 1.208 1.355 1.674.022.069.04.138.054.209l-9.263-3.923a.728.728 0 0 0-.015-.006c-.037-.015-.08-.032-.08-.07 0-.038.044-.056.081-.071l.012-.005 3.98-1.684zm5.127 7.003c-.2.376-.59.766-1.25 1.427l-4.37 4.369-5.652-1.177-.03-.006c-.05-.008-.103-.017-.103-.062a1.706 1.706 0 0 0-.655-1.193c-.023-.023-.017-.059-.01-.092 0-.005 0-.01.002-.014l1.063-6.526.004-.022c.006-.05.015-.108.06-.108a1.73 1.73 0 0 0 1.16-.665c.009-.01.015-.021.027-.027.032-.015.07 0 .103.014l9.65 4.082zm-6.625 6.801l-7.186 7.186 1.23-7.56.002-.01c.001-.01.003-.02.006-.029.01-.024.036-.034.061-.044l.012-.005a1.85 1.85 0 0 0 .695-.517c.024-.028.053-.055.09-.06a.09.09 0 0 1 .029 0l5.06 1.04zm-8.707 8.707l-.81.81-8.955-12.942a.424.424 0 0 0-.01-.014c-.014-.019-.029-.038-.026-.06.001-.016.011-.03.022-.042l.01-.013c.027-.04.05-.08.075-.123l.02-.035.003-.003c.014-.024.027-.047.051-.06.021-.01.05-.006.073-.001l9.921 2.046a.164.164 0 0 1 .076.033c.013.013.016.027.019.043a1.757 1.757 0 0 0 1.028 1.175c.028.014.016.045.003.078a.238.238 0 0 0-.015.045c-.125.76-1.197 7.298-1.485 9.063zm-1.692 1.691c-.597.591-.949.904-1.347 1.03a2 2 0 0 1-1.206 0c-.466-.148-.869-.55-1.674-1.356L8.73 28.73l2.349-3.643c.011-.018.022-.034.04-.047.025-.018.061-.01.091 0a2.434 2.434 0 0 0 1.638-.083c.027-.01.054-.017.075.002a.19.19 0 0 1 .028.032L21.95 38.05zM7.863 27.863L5.8 25.8l4.074-1.738a.084.084 0 0 1 .033-.007c.034 0 .054.034.072.065a2.91 2.91 0 0 0 .13.184l.013.016c.012.017.004.034-.008.05l-2.25 3.493zm-2.976-2.976l-2.61-2.61c-.444-.444-.766-.766-.99-1.043l7.936 1.646a.84.84 0 0 0 .03.005c.049.008.103.017.103.063 0 .05-.059.073-.109.092l-.023.01-4.337 1.837zM.831 19.892a2 2 0 0 1 .09-.495c.148-.466.55-.868 1.356-1.674l3.34-3.34a2175.525 2175.525 0 0 0 4.626 6.687c.027.036.057.076.026.106-.146.161-.292.337-.395.528a.16.16 0 0 1-.05.062c-.013.008-.027.005-.042.002H9.78L.831 19.891zm5.68-6.403l4.491-4.491c.422.185 1.958.834 3.332 1.414 1.04.44 1.988.84 2.286.97.03.012.057.024.07.054.008.018.004.041 0 .06a2.003 2.003 0 0 0 .523 1.828c.03.03 0 .073-.026.11l-.014.021-4.56 7.063c-.012.02-.023.037-.043.05-.024.015-.058.008-.086.001a2.274 2.274 0 0 0-.543-.074c-.164 0-.342.03-.522.063h-.001c-.02.003-.038.007-.054-.005a.21.21 0 0 1-.045-.051l-4.808-7.013zm5.398-5.398l5.814-5.814c.805-.805 1.208-1.208 1.674-1.355a2 2 0 0 1 1.206 0c.466.147.869.55 1.674 1.355l1.26 1.26-4.135 6.404a.155.155 0 0 1-.041.048c-.025.017-.06.01-.09 0a2.097 2.097 0 0 0-1.92.37c-.027.028-.067.012-.101-.003-.54-.235-4.74-2.01-5.341-2.265zm12.506-3.676l3.818 3.818-.92 5.698v.015a.135.135 0 0 1-.008.038c-.01.02-.03.024-.05.03a1.83 1.83 0 0 0-.548.273.154.154 0 0 0-.02.017c-.011.012-.022.023-.04.025a.114.114 0 0 1-.043-.007l-5.818-2.472-.011-.005c-.037-.015-.081-.033-.081-.071a2.198 2.198 0 0 0-.31-.915c-.028-.046-.059-.094-.035-.141l4.066-6.303zm-3.932 8.606l5.454 2.31c.03.014.063.027.076.058a.106.106 0 0 1 0 .057c-.016.08-.03.171-.03.263v.153c0 .038-.039.054-.075.069l-.011.004c-.864.369-12.13 5.173-12.147 5.173-.017 0-.035 0-.052-.017-.03-.03 0-.072.027-.11a.76.76 0 0 0 .014-.02l4.482-6.94.008-.012c.026-.042.056-.089.104-.089l.045.007c.102.014.192.027.283.027.68 0 1.31-.331 1.69-.897a.16.16 0 0 1 .034-.04c.027-.02.067-.01.098.004zm-6.246 9.185l12.28-5.237s.018 0 .035.017c.067.067.124.112.179.154l.027.017c.025.014.05.03.052.056 0 .01 0 .016-.002.025L25.756 23.7l-.004.026c-.007.05-.014.107-.061.107a1.729 1.729 0 0 0-1.373.847l-.005.008c-.014.023-.027.045-.05.057-.021.01-.048.006-.07.001l-9.793-2.02c-.01-.002-.152-.519-.163-.52z"/>
                            </svg>
                          </div>
                          <p className="text-center font-medium">Netlify</p>
                        </button>
                      </div>
                      
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Configurazione Build</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="buildCommand" className="block text-xs font-medium text-gray-600 mb-1">
                              Comando Build
                            </label>
                            <input
                              type="text"
                              id="buildCommand"
                              value={deployOptions.buildCommand}
                              onChange={(e) => setDeployOptions(prev => ({ ...prev, buildCommand: e.target.value }))}
                              className="w-full px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label htmlFor="outputDir" className="block text-xs font-medium text-gray-600 mb-1">
                              Directory Output
                            </label>
                            <input
                              type="text"
                              id="outputDir"
                              value={deployOptions.outputDir}
                              onChange={(e) => setDeployOptions(prev => ({ ...prev, outputDir: e.target.value }))}
                              className="w-full px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4">
                      {deployStatus ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-green-100 rounded-full">
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <h5 className="text-lg font-medium text-green-900">Deploy Completato!</h5>
                              <p className="text-green-700">
                                La tua applicazione è stata deployata con successo su {deployStatus.provider === 'vercel' ? 'Vercel' : 'Netlify'}.
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 border border-green-200 mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <h6 className="font-medium text-gray-900">URL Applicazione</h6>
                              <a
                                href={deployStatus.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>Apri</span>
                              </a>
                            </div>
                            <p className="text-blue-600 font-medium break-all">
                              {deployStatus.url}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => setDeployStatus(null)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                          >
                            Nuovo Deploy
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="p-3 border-b border-gray-200 bg-gray-50">
                              <h5 className="font-medium text-gray-900">Variabili d'Ambiente</h5>
                            </div>
                            <div className="p-4">
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Nome"
                                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Valore"
                                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Nome"
                                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Valore"
                                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                              <button
                                className="mt-2 text-xs text-orange-600 hover:text-orange-800 font-medium"
                              >
                                + Aggiungi variabile
                              </button>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="p-3 border-b border-gray-200 bg-gray-50">
                              <h5 className="font-medium text-gray-900">Ottimizzazioni</h5>
                            </div>
                            <div className="p-4">
                              <div className="space-y-2">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={true}
                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                  />
                                  <span className="text-sm text-gray-700">Ottimizza immagini</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={true}
                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                  />
                                  <span className="text-sm text-gray-700">Minifica CSS e JavaScript</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={true}
                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                  />
                                  <span className="text-sm text-gray-700">Genera sitemap.xml</span>
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={deployProject}
                            disabled={isLoading}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Deploying...</span>
                              </>
                            ) : (
                              <>
                                <Rocket className="h-5 w-5" />
                                <span>Deploy su {deployOptions.provider === 'vercel' ? 'Vercel' : 'Netlify'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AIDevAssistant;