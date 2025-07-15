import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, X, Send, Code, Database, Github, 
  Zap, Settings, Maximize2, Minimize2, 
  RefreshCw, Save, Play, Upload, Download,
  FileCode, FolderOpen, Search, CheckCircle,
  AlertTriangle, ExternalLink, Cpu, Server,
  Rocket, ArrowRight, Copy, Trash2
} from 'lucide-react';
import { boltDiyService } from '../../services/boltDiyService';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  code?: string;
  language?: string;
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
  framework: string;
  environmentVariables: Record<string, string>;
}

const AIDevAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'code' | 'database' | 'github' | 'deploy'>('chat');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [codeToAnalyze, setCodeToAnalyze] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('typescript');
  const [codeAnalysisResult, setCodeAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState<FileNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [databaseSchema, setDatabaseSchema] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableDetails, setTableDetails] = useState<any>(null);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [isConnectedToSupabase, setIsConnectedToSupabase] = useState(false);
  const [deployOptions, setDeployOptions] = useState<DeployOptions>({
    provider: 'vercel',
    buildCommand: 'npm run build',
    outputDir: 'dist',
    framework: 'react',
    environmentVariables: {}
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<any>(null);
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [isLoadingRepo, setIsLoadingRepo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inizializza Bolt.diy
  useEffect(() => {
    const initBoltDiy = async () => {
      try {
        const success = await boltDiyService.initialize();
        setIsInitialized(success);
        if (success) {
          console.log('✅ Bolt.diy inizializzato con successo');
        } else {
          console.error('❌ Errore nell\'inizializzazione di Bolt.diy');
        }
      } catch (error) {
        console.error('❌ Errore nell\'inizializzazione di Bolt.diy:', error);
      }
    };
    
    initBoltDiy();
  }, []);

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
        text: `Ciao! Sono l'assistente Bolt.diy, specializzato in sviluppo software. Posso aiutarti con analisi del codice, correzioni, suggerimenti e molto altro. Come posso aiutarti oggi?`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages([initialMessage]);
    }
  }, [isOpen, messages.length]);

  // Filter files when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFiles(fileTree);
      return;
    }
    
    const filterNodes = (nodes: FileNode[]): FileNode[] => {
      return nodes.filter(node => {
        const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             node.path.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (node.type === 'folder' && node.children) {
          const filteredChildren = filterNodes(node.children);
          if (filteredChildren.length > 0) {
            return true;
          }
        }
        
        return matchesSearch;
      }).map(node => {
        if (node.type === 'folder' && node.children) {
          return {
            ...node,
            children: filterNodes(node.children)
          };
        }
        return node;
      });
    };
    
    setFilteredFiles(filterNodes(fileTree));
  }, [searchQuery, fileTree]);

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
      // Get AI response
      const response = await boltDiyService.askQuestion(message);
      
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

  const analyzeCode = async () => {
    if (!codeToAnalyze.trim()) {
      toast.error('Inserisci del codice da analizzare');
      return;
    }
    
    setIsAnalyzing(true);
    setCodeAnalysisResult(null);
    
    try {
      const result = await boltDiyService.analyzeCode(codeToAnalyze, { language: codeLanguage });
      setCodeAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing code:', error);
      toast.error('Errore durante l\'analisi del codice');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadFileTree = async () => {
    try {
      setIsLoadingRepo(true);
      
      // Simula il caricamento della struttura dei file
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockFileTree: FileNode[] = [
        {
          name: 'src',
          path: 'src',
          type: 'folder',
          children: [
            {
              name: 'components',
              path: 'src/components',
              type: 'folder',
              children: [
                {
                  name: 'layout',
                  path: 'src/components/layout',
                  type: 'folder',
                  children: [
                    {
                      name: 'Layout.tsx',
                      path: 'src/components/layout/Layout.tsx',
                      type: 'file',
                      content: '// Layout component code'
                    }
                  ]
                },
                {
                  name: 'common',
                  path: 'src/components/common',
                  type: 'folder',
                  children: [
                    {
                      name: 'Button.tsx',
                      path: 'src/components/common/Button.tsx',
                      type: 'file',
                      content: '// Button component code'
                    },
                    {
                      name: 'Input.tsx',
                      path: 'src/components/common/Input.tsx',
                      type: 'file',
                      content: '// Input component code'
                    }
                  ]
                }
              ]
            },
            {
              name: 'pages',
              path: 'src/pages',
              type: 'folder',
              children: [
                {
                  name: 'Dashboard.tsx',
                  path: 'src/pages/Dashboard.tsx',
                  type: 'file',
                  content: '// Dashboard page code'
                },
                {
                  name: 'Login.tsx',
                  path: 'src/pages/Login.tsx',
                  type: 'file',
                  content: '// Login page code'
                }
              ]
            },
            {
              name: 'lib',
              path: 'src/lib',
              type: 'folder',
              children: [
                {
                  name: 'supabase.ts',
                  path: 'src/lib/supabase.ts',
                  type: 'file',
                  content: '// Supabase client code'
                },
                {
                  name: 'bolt.diy',
                  path: 'src/lib/bolt.diy',
                  type: 'folder',
                  children: [
                    {
                      name: 'index.ts',
                      path: 'src/lib/bolt.diy/index.ts',
                      type: 'file',
                      content: '// Bolt.diy main code'
                    },
                    {
                      name: 'types.ts',
                      path: 'src/lib/bolt.diy/types.ts',
                      type: 'file',
                      content: '// Bolt.diy types'
                    }
                  ]
                }
              ]
            },
            {
              name: 'App.tsx',
              path: 'src/App.tsx',
              type: 'file',
              content: '// App component code'
            },
            {
              name: 'main.tsx',
              path: 'src/main.tsx',
              type: 'file',
              content: '// Main entry point'
            }
          ]
        },
        {
          name: 'public',
          path: 'public',
          type: 'folder',
          children: [
            {
              name: 'index.html',
              path: 'public/index.html',
              type: 'file',
              content: '<!-- HTML template -->'
            },
            {
              name: 'favicon.ico',
              path: 'public/favicon.ico',
              type: 'file',
              content: '// Binary content'
            }
          ]
        },
        {
          name: 'package.json',
          path: 'package.json',
          type: 'file',
          content: '// Package configuration'
        },
        {
          name: 'tsconfig.json',
          path: 'tsconfig.json',
          type: 'file',
          content: '// TypeScript configuration'
        }
      ];
      
      setFileTree(mockFileTree);
      setExpandedFolders(['src', 'src/components', 'src/lib']);
      toast.success('Repository caricata con successo');
    } catch (error) {
      console.error('Error loading file tree:', error);
      toast.error('Errore nel caricamento della repository');
    } finally {
      setIsLoadingRepo(false);
    }
  };

  const connectToSupabase = async () => {
    try {
      setIsLoadingSchema(true);
      
      // Simula il caricamento dello schema del database
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockSchema = {
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'uuid', isPrimary: true },
              { name: 'email', type: 'text', isUnique: true },
              { name: 'name', type: 'text' },
              { name: 'created_at', type: 'timestamp' }
            ],
            hasRLS: true,
            policies: [
              { name: 'Users can read own data', operation: 'SELECT', using: 'auth.uid() = id' }
            ]
          },
          {
            name: 'posts',
            columns: [
              { name: 'id', type: 'uuid', isPrimary: true },
              { name: 'user_id', type: 'uuid', isForeignKey: true, references: 'users.id' },
              { name: 'title', type: 'text' },
              { name: 'content', type: 'text' },
              { name: 'created_at', type: 'timestamp' }
            ],
            hasRLS: true,
            policies: [
              { name: 'Users can read all posts', operation: 'SELECT', using: 'true' },
              { name: 'Users can insert own posts', operation: 'INSERT', using: 'auth.uid() = user_id' }
            ]
          }
        ]
      };
      
      setDatabaseSchema(mockSchema);
      setIsConnectedToSupabase(true);
      toast.success('Connesso a Supabase');
    } catch (error) {
      console.error('Error connecting to Supabase:', error);
      toast.error('Errore nella connessione a Supabase');
    } finally {
      setIsLoadingSchema(false);
    }
  };

  const selectTable = async (tableName: string) => {
    try {
      setSelectedTable(tableName);
      
      // Simula il caricamento dei dettagli della tabella
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const table = databaseSchema.tables.find((t: any) => t.name === tableName);
      setTableDetails(table);
    } catch (error) {
      console.error('Error loading table details:', error);
      toast.error('Errore nel caricamento dei dettagli della tabella');
    }
  };

  const fixRLSPolicies = async (tableName: string) => {
    try {
      const sql = await boltDiyService.fixRLSPolicies(tableName);
      
      // Copia negli appunti
      navigator.clipboard.writeText(sql);
      
      toast.success('SQL generato e copiato negli appunti');
      
      // Aggiungi messaggio alla chat
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: `Ho generato SQL per correggere le policy RLS della tabella ${tableName}:`,
        code: sql,
        language: 'sql',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setActiveTab('chat');
    } catch (error) {
      console.error('Error fixing RLS policies:', error);
      toast.error('Errore nella generazione delle policy RLS');
    }
  };

  const deployToProvider = async () => {
    try {
      setIsDeploying(true);
      
      // Simula il processo di deploy
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const result = await boltDiyService.deployToProvider(deployOptions.provider, deployOptions);
      
      setDeployResult(result);
      
      if (result.success) {
        toast.success(`Deployed to ${deployOptions.provider} successfully!`);
        
        // Aggiungi messaggio alla chat
        const aiMessage: Message = {
          id: Date.now().toString(),
          text: `Ho completato il deploy su ${deployOptions.provider}. L'applicazione è ora disponibile all'indirizzo: ${result.url}`,
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setActiveTab('chat');
      } else {
        toast.error(`Error deploying to ${deployOptions.provider}`);
      }
    } catch (error) {
      console.error('Error deploying:', error);
      toast.error('Errore durante il deploy');
    } finally {
      setIsDeploying(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path && !p.startsWith(`${path}/`))
        : [...prev, path]
    );
  };

  const selectFile = (file: FileNode) => {
    setSelectedFile(file);
    setCodeToAnalyze(file.content || '');
    setCodeLanguage(getLanguageFromFileName(file.name));
  };

  const getLanguageFromFileName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js': return 'javascript';
      case 'ts': return 'typescript';
      case 'jsx': return 'jsx';
      case 'tsx': return 'tsx';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'py': return 'python';
      case 'sql': return 'sql';
      default: return 'typescript';
    }
  };

  const renderFileTree = (nodes: FileNode[], level: number = 0) => {
    return nodes.map(node => {
      const isExpanded = expandedFolders.includes(node.path);
      
      return (
        <div key={node.path} style={{ marginLeft: `${level * 16}px` }}>
          <div 
            className={`flex items-center py-1 px-2 rounded hover:bg-gray-100 cursor-pointer ${
              selectedFile?.path === node.path ? 'bg-blue-50 text-blue-600' : ''
            }`}
            onClick={() => node.type === 'folder' ? toggleFolder(node.path) : selectFile(node)}
          >
            {node.type === 'folder' ? (
              <>
                <div className="mr-1 w-4 h-4 text-gray-500">
                  {isExpanded ? '▼' : '►'}
                </div>
                <FolderOpen className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-sm">{node.name}</span>
              </>
            ) : (
              <>
                <div className="mr-1 w-4 h-4"></div>
                <FileCode className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm">{node.name}</span>
              </>
            )}
          </div>
          
          {node.type === 'folder' && isExpanded && node.children && (
            <div>
              {renderFileTree(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
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
      className={`fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200 max-w-6xl`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6" />
          <h3 className="font-medium text-lg">Bolt.diy Assistant</h3>
          <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">PRO</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleMinimize}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            {isMinimized ? <Maximize2 className="h-5 w-5" /> : <Minimize2 className="h-5 w-5" />}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="h-5 w-5" />
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
            <div className="w-16 bg-gray-800 flex flex-col items-center py-4">
              <button
                onClick={() => setActiveTab('chat')}
                className={`p-3 rounded-lg mb-2 ${
                  activeTab === 'chat' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title="Chat"
              >
                <Brain className="h-6 w-6" />
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`p-3 rounded-lg mb-2 ${
                  activeTab === 'code' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title="Analisi Codice"
              >
                <Code className="h-6 w-6" />
              </button>
              <button
                onClick={() => setActiveTab('database')}
                className={`p-3 rounded-lg mb-2 ${
                  activeTab === 'database' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title="Database"
              >
                <Database className="h-6 w-6" />
              </button>
              <button
                onClick={() => setActiveTab('github')}
                className={`p-3 rounded-lg mb-2 ${
                  activeTab === 'github' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title="GitHub"
              >
                <Github className="h-6 w-6" />
              </button>
              <button
                onClick={() => setActiveTab('deploy')}
                className={`p-3 rounded-lg mb-2 ${
                  activeTab === 'deploy' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title="Deploy"
              >
                <Rocket className="h-6 w-6" />
              </button>
              
              <div className="mt-auto">
                <button
                  onClick={() => {}}
                  className="p-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700"
                  title="Impostazioni"
                >
                  <Settings className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <div className="flex-1 flex flex-col">
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
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-800'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            
                            {msg.code && (
                              <div className="mt-3 bg-gray-800 rounded-md overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-2 bg-gray-700">
                                  <span className="text-xs text-gray-300">{msg.language || 'code'}</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(msg.code || '');
                                      toast.success('Codice copiato negli appunti');
                                    }}
                                    className="text-gray-300 hover:text-white"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </button>
                                </div>
                                <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                                  <code>{msg.code}</code>
                                </pre>
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
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Chiedi a Bolt.diy..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                          rows={2}
                          disabled={isTyping}
                        />
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || isTyping}
                        className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Powered by Bolt.diy
                      </div>
                      <div className="text-xs text-indigo-600 flex items-center gap-1">
                        <Cpu className="h-3 w-3" />
                        Assistente Locale
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Code Analysis Tab */}
              {activeTab === 'code' && (
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 flex">
                    {/* File Explorer */}
                    <div className="w-64 border-r border-gray-200 flex flex-col">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-700">File Explorer</h4>
                          <button
                            onClick={loadFileTree}
                            disabled={isLoadingRepo}
                            className="text-gray-500 hover:text-gray-700"
                            title="Refresh"
                          >
                            <RefreshCw className={`h-4 w-4 ${isLoadingRepo ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Cerca file..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2">
                        {isLoadingRepo ? (
                          <div className="flex justify-center items-center h-full">
                            <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />
                          </div>
                        ) : fileTree.length > 0 ? (
                          renderFileTree(filteredFiles.length > 0 ? filteredFiles : fileTree)
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <Github className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500 mb-4">Nessun repository caricato</p>
                            <button
                              onClick={loadFileTree}
                              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                            >
                              Carica Repository
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Code Editor and Analysis */}
                    <div className="flex-1 flex flex-col">
                      <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-700">
                            {selectedFile ? selectedFile.path : 'Editor di Codice'}
                          </h4>
                          <div className="flex items-center gap-2">
                            <select
                              value={codeLanguage}
                              onChange={(e) => setCodeLanguage(e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="typescript">TypeScript</option>
                              <option value="javascript">JavaScript</option>
                              <option value="jsx">JSX</option>
                              <option value="tsx">TSX</option>
                              <option value="html">HTML</option>
                              <option value="css">CSS</option>
                              <option value="json">JSON</option>
                              <option value="sql">SQL</option>
                            </select>
                            <button
                              onClick={analyzeCode}
                              disabled={isAnalyzing || !codeToAnalyze.trim()}
                              className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 flex items-center gap-1"
                            >
                              {isAnalyzing ? (
                                <>
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                  Analisi...
                                </>
                              ) : (
                                <>
                                  <Zap className="h-3 w-3" />
                                  Analizza
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col md:flex-row">
                        <div className="flex-1 p-4">
                          <textarea
                            value={codeToAnalyze}
                            onChange={(e) => setCodeToAnalyze(e.target.value)}
                            className="w-full h-full p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                            placeholder="Incolla qui il codice da analizzare..."
                          />
                        </div>
                        <div className="flex-1 p-4 border-t md:border-t-0 md:border-l border-gray-200 bg-gray-50 overflow-y-auto">
                          {isAnalyzing ? (
                            <div className="flex justify-center items-center h-full">
                              <div className="text-center">
                                <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-4" />
                                <p className="text-gray-600">Analisi in corso...</p>
                              </div>
                            </div>
                          ) : codeAnalysisResult ? (
                            <div className="space-y-4">
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Analisi:</h5>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{codeAnalysisResult.text}</p>
                                </div>
                              </div>
                              
                              {codeAnalysisResult.code && (
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Codice Suggerito:</h5>
                                  <div className="bg-gray-800 rounded-md overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-2 bg-gray-700">
                                      <span className="text-xs text-gray-300">{codeAnalysisResult.language || 'code'}</span>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(codeAnalysisResult.code || '');
                                          toast.success('Codice copiato negli appunti');
                                        }}
                                        className="text-gray-300 hover:text-white"
                                      >
                                        <Copy className="h-4 w-4" />
                                      </button>
                                    </div>
                                    <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                                      <code>{codeAnalysisResult.code}</code>
                                    </pre>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Cpu className="h-3 w-3" />
                                  <span>Fonte: {codeAnalysisResult.source}</span>
                                </div>
                                <div>
                                  Confidenza: {Math.round(codeAnalysisResult.confidence * 100)}%
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                              <Code className="h-12 w-12 text-gray-300 mb-4" />
                              <h5 className="text-gray-500 mb-2">Nessuna analisi</h5>
                              <p className="text-sm text-gray-400 mb-4">
                                Incolla del codice nell'editor e clicca "Analizza" per ottenere suggerimenti
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Database Tab */}
              {activeTab === 'database' && (
                <div className="flex-1 flex flex-col">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Database Supabase</h4>
                      <button
                        onClick={connectToSupabase}
                        disabled={isLoadingSchema || isConnectedToSupabase}
                        className={`px-3 py-1 text-xs rounded flex items-center gap-1 ${
                          isConnectedToSupabase 
                            ? 'bg-green-600 text-white' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        } transition-colors disabled:opacity-50`}
                      >
                        {isLoadingSchema ? (
                          <>
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            Connessione...
                          </>
                        ) : isConnectedToSupabase ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            Connesso
                          </>
                        ) : (
                          <>
                            <Server className="h-3 w-3" />
                            Connetti a Supabase
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {isConnectedToSupabase ? (
                    <div className="flex-1 flex">
                      {/* Table List */}
                      <div className="w-64 border-r border-gray-200 p-4">
                        <h5 className="text-xs font-medium text-gray-500 mb-2">TABELLE</h5>
                        <div className="space-y-1">
                          {databaseSchema?.tables.map((table: any) => (
                            <button
                              key={table.name}
                              onClick={() => selectTable(table.name)}
                              className={`w-full text-left px-3 py-2 text-sm rounded-lg ${
                                selectedTable === table.name 
                                  ? 'bg-indigo-100 text-indigo-700' 
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              {table.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Table Details */}
                      <div className="flex-1 p-4 overflow-y-auto">
                        {selectedTable && tableDetails ? (
                          <div className="space-y-6">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="text-lg font-medium text-gray-900">{tableDetails.name}</h5>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    tableDetails.hasRLS 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {tableDetails.hasRLS ? 'RLS Enabled' : 'RLS Disabled'}
                                  </span>
                                  {!tableDetails.hasRLS && (
                                    <button
                                      onClick={() => fixRLSPolicies(tableDetails.name)}
                                      className="text-xs px-2 py-1 bg-indigo-600 text-white rounded-full"
                                    >
                                      Fix RLS
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Constraints</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {tableDetails.columns.map((column: any) => (
                                      <tr key={column.name}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                          {column.name}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                          {column.type}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                          <div className="flex flex-wrap gap-1">
                                            {column.isPrimary && (
                                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                                PRIMARY KEY
                                              </span>
                                            )}
                                            {column.isUnique && (
                                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                UNIQUE
                                              </span>
                                            )}
                                            {column.isForeignKey && (
                                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs">
                                                FOREIGN KEY
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">RLS Policies</h5>
                              {tableDetails.policies && tableDetails.policies.length > 0 ? (
                                <div className="space-y-2">
                                  {tableDetails.policies.map((policy: any, index: number) => (
                                    <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-sm">{policy.name}</span>
                                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                                          {policy.operation}
                                        </span>
                                      </div>
                                      <code className="text-xs bg-gray-100 p-1 rounded block">
                                        USING ({policy.using})
                                      </code>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    <p className="text-sm text-yellow-700">
                                      Nessuna policy RLS trovata. Questo potrebbe rappresentare un rischio di sicurezza.
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => fixRLSPolicies(tableDetails.name)}
                                    className="mt-2 text-xs px-3 py-1 bg-yellow-600 text-white rounded"
                                  >
                                    Genera Policy RLS
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center">
                            <Database className="h-12 w-12 text-gray-300 mb-4" />
                            <h5 className="text-gray-500 mb-2">Seleziona una tabella</h5>
                            <p className="text-sm text-gray-400">
                              Seleziona una tabella dalla lista per visualizzare i dettagli
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center max-w-md p-6">
                        <Server className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h5 className="text-xl font-medium text-gray-700 mb-2">Connetti a Supabase</h5>
                        <p className="text-gray-500 mb-6">
                          Connettiti al tuo database Supabase per visualizzare lo schema, analizzare le policy RLS e generare migrazioni SQL.
                        </p>
                        <button
                          onClick={connectToSupabase}
                          disabled={isLoadingSchema}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                        >
                          {isLoadingSchema ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Connessione...
                            </>
                          ) : (
                            <>
                              <Server className="h-4 w-4" />
                              Connetti a Supabase
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* GitHub Tab */}
              {activeTab === 'github' && (
                <div className="flex-1 flex flex-col">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">GitHub Repository</h4>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="URL repository"
                          value={githubRepoUrl}
                          onChange={(e) => setGithubRepoUrl(e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 w-64"
                        />
                        <button
                          onClick={loadFileTree}
                          disabled={isLoadingRepo}
                          className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {isLoadingRepo ? (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              Caricamento...
                            </>
                          ) : (
                            <>
                              <Download className="h-3 w-3" />
                              Carica
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex">
                    {/* File Explorer */}
                    <div className="w-64 border-r border-gray-200 flex flex-col">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-medium text-gray-500">FILE EXPLORER</h4>
                          <button
                            onClick={loadFileTree}
                            disabled={isLoadingRepo}
                            className="text-gray-500 hover:text-gray-700"
                            title="Refresh"
                          >
                            <RefreshCw className={`h-4 w-4 ${isLoadingRepo ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Cerca file..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2">
                        {isLoadingRepo ? (
                          <div className="flex justify-center items-center h-full">
                            <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />
                          </div>
                        ) : fileTree.length > 0 ? (
                          renderFileTree(filteredFiles.length > 0 ? filteredFiles : fileTree)
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <Github className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500 mb-4">Nessun repository caricato</p>
                            <button
                              onClick={loadFileTree}
                              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                            >
                              Carica Repository
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* File Content */}
                    <div className="flex-1 flex flex-col">
                      {selectedFile ? (
                        <>
                          <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-700">{selectedFile.path}</h4>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setCodeToAnalyze(selectedFile.content || '');
                                    setCodeLanguage(getLanguageFromFileName(selectedFile.name));
                                    setActiveTab('code');
                                  }}
                                  className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors"
                                >
                                  Analizza
                                </button>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedFile.content || '');
                                    toast.success('Contenuto copiato negli appunti');
                                  }}
                                  className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
                                >
                                  Copia
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 p-4 overflow-auto">
                            <pre className="font-mono text-sm whitespace-pre-wrap">
                              {selectedFile.content}
                            </pre>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                          <FileCode className="h-12 w-12 text-gray-300 mb-4" />
                          <h5 className="text-gray-500 mb-2">Nessun file selezionato</h5>
                          <p className="text-sm text-gray-400">
                            Seleziona un file dall'explorer per visualizzarne il contenuto
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Deploy Tab */}
              {activeTab === 'deploy' && (
                <div className="flex-1 flex flex-col">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Deploy Application</h4>
                      <button
                        onClick={deployToProvider}
                        disabled={isDeploying}
                        className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {isDeploying ? (
                          <>
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            Deploying...
                          </>
                        ) : (
                          <>
                            <Rocket className="h-3 w-3" />
                            Deploy Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-6">
                    <div className="max-w-2xl mx-auto">
                      <div className="mb-6">
                        <h5 className="text-lg font-medium text-gray-900 mb-4">Configurazione Deploy</h5>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Provider
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                              <button
                                onClick={() => setDeployOptions(prev => ({ ...prev, provider: 'vercel' }))}
                                className={`p-4 border rounded-lg flex items-center gap-3 ${
                                  deployOptions.provider === 'vercel'
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="w-8 h-8 flex items-center justify-center">
                                  <svg viewBox="0 0 76 65" fill="none" className="w-6 h-6">
                                    <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill={deployOptions.provider === 'vercel' ? '#000' : '#888'} />
                                  </svg>
                                </div>
                                <div className="text-left">
                                  <h6 className="font-medium">Vercel</h6>
                                  <p className="text-xs text-gray-500">Deployment veloce e CDN globale</p>
                                </div>
                              </button>
                              
                              <button
                                onClick={() => setDeployOptions(prev => ({ ...prev, provider: 'netlify' }))}
                                className={`p-4 border rounded-lg flex items-center gap-3 ${
                                  deployOptions.provider === 'netlify'
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="w-8 h-8 flex items-center justify-center">
                                  <svg viewBox="0 0 40 40" className="w-6 h-6">
                                    <path d="M28.589 14.135l-.014-.006c-.008-.003-.016-.006-.023-.013a.11.11 0 0 1-.028-.093l.773-4.726 3.625 3.626-3.77 1.604a.083.083 0 0 1-.033.006h-.015c-.005-.003-.01-.007-.02-.017a1.716 1.716 0 0 0-.495-.381zm5.258-.288l3.876 3.876c.805.806 1.208 1.208 1.355 1.674.022.069.04.138.054.209l-9.263-3.923a.728.728 0 0 0-.015-.006c-.037-.015-.08-.032-.08-.07 0-.038.044-.056.081-.071l.012-.005 3.98-1.684zm5.127 7.003c-.2.376-.59.766-1.25 1.427l-4.37 4.369-5.652-1.177-.03-.006c-.05-.008-.103-.017-.103-.062a1.706 1.706 0 0 0-.655-1.193c-.023-.023-.017-.059-.01-.092 0-.005 0-.01.002-.014l1.063-6.526.004-.022c.006-.05.015-.108.06-.108a1.73 1.73 0 0 0 1.16-.665c.009-.01.015-.021.027-.027.032-.015.07 0 .103.014l9.65 4.082zm-6.625 6.801l-7.186 7.186 1.23-7.56.002-.01c.001-.01.003-.02.006-.029.01-.024.036-.034.061-.044l.012-.005a1.85 1.85 0 0 0 .695-.517c.024-.028.053-.055.09-.06a.09.09 0 0 1 .029 0l5.06 1.04zm-8.707 8.707l-.81.81-8.955-12.942a.424.424 0 0 0-.01-.014c-.014-.019-.029-.038-.026-.06.001-.016.011-.03.022-.042l.01-.013c.027-.04.05-.08.075-.123l.02-.035.003-.003c.014-.024.027-.047.051-.06.021-.01.05-.006.073-.001l9.921 2.046a.164.164 0 0 1 .076.033c.013.013.016.027.019.043a1.757 1.757 0 0 0 1.028 1.175c.028.014.016.045.003.078a.238.238 0 0 0-.015.045c-.125.76-1.197 7.298-1.485 9.063zm-1.692 1.691c-.597.591-.949.904-1.347 1.03a2 2 0 0 1-1.206 0c-.466-.148-.869-.55-1.674-1.356L8.73 28.73l2.349-3.643c.011-.018.022-.034.04-.047.025-.018.061-.01.091 0a2.434 2.434 0 0 0 1.638-.083c.027-.01.054-.017.075.002a.19.19 0 0 1 .028.032L21.95 38.05zM7.863 27.863L5.8 25.8l4.074-1.738a.084.084 0 0 1 .033-.007c.034 0 .054.034.072.065a2.91 2.91 0 0 0 .13.184l.013.016c.012.017.004.034-.008.05l-2.25 3.493zm-2.976-2.976l-2.61-2.61c-.444-.444-.766-.766-.99-1.043l7.936 1.646a.84.84 0 0 0 .03.005c.049.008.103.017.103.063 0 .05-.059.073-.109.092l-.023.01-4.337 1.837zM.831 19.892a2 2 0 0 1 .09-.495c.148-.466.55-.868 1.356-1.674l3.34-3.34a2175.525 2175.525 0 0 0 4.626 6.687c.027.036.057.076.026.106-.146.161-.292.337-.395.528a.16.16 0 0 1-.05.062c-.013.008-.027.005-.042.002H9.78L.831 19.891zm5.68-6.403l4.491-4.491c.422.185 1.958.834 3.332 1.414 1.04.44 1.988.84 2.286.97.03.012.057.024.07.054.008.018.004.041 0 .06a2.003 2.003 0 0 0 .523 1.828c.03.03 0 .073-.026.11l-.014.021-4.56 7.063c-.012.02-.023.037-.043.05-.024.015-.058.008-.086.001a2.274 2.274 0 0 0-.543-.074c-.164 0-.342.03-.522.063h-.001c-.02.003-.038.007-.054-.005a.21.21 0 0 1-.045-.051l-4.808-7.013zm5.398-5.398l5.814-5.814c.805-.805 1.208-1.208 1.674-1.355a2 2 0 0 1 1.206 0c.466.147.869.55 1.674 1.355l1.26 1.26-4.135 6.404a.155.155 0 0 1-.041.048c-.025.017-.06.01-.09 0a2.097 2.097 0 0 0-1.92.37c-.027.028-.067.012-.101-.003-.54-.235-4.74-2.01-5.341-2.265zm12.506-3.676l3.818 3.818-.92 5.698v.015a.135.135 0 0 1-.008.038c-.01.02-.03.024-.05.03a1.83 1.83 0 0 0-.548.273.154.154 0 0 0-.02.017c-.011.012-.022.023-.04.025a.114.114 0 0 1-.043-.007l-5.818-2.472-.011-.005c-.037-.015-.081-.033-.081-.071a2.198 2.198 0 0 0-.31-.915c-.028-.046-.059-.094-.035-.141l4.066-6.303zm-3.932 8.606l5.454 2.31c.03.014.063.027.076.058a.106.106 0 0 1 0 .057c-.016.08-.03.171-.03.263v.153c0 .038-.039.054-.075.069l-.011.004c-.864.369-12.13 5.173-12.147 5.173-.017 0-.035 0-.052-.017-.03-.03 0-.072.027-.11a.76.76 0 0 0 .014-.02l4.482-6.94.008-.012c.026-.042.056-.089.104-.089l.045.007c.102.014.192.027.283.027.68 0 1.31-.331 1.69-.897a.16.16 0 0 1 .034-.04c.027-.02.067-.01.098.004zm-6.246 9.185l12.28-5.237s.018 0 .035.017c.067.067.124.112.179.154l.027.017c.025.014.05.03.052.056 0 .01 0 .016-.002.025L25.756 23.7l-.004.026c-.007.05-.014.107-.061.107a1.729 1.729 0 0 0-1.373.847l-.005.008c-.014.023-.027.045-.05.057-.021.01-.048.006-.07.001l-9.793-2.02c-.01-.002-.152-.519-.163-.52z" fill={deployOptions.provider === 'netlify' ? '#00C7B7' : '#888'} />
                                  </svg>
                                </div>
                                <div className="text-left">
                                  <h6 className="font-medium">Netlify</h6>
                                  <p className="text-xs text-gray-500">Funzioni serverless e form handling</p>
                                </div>
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Build Command
                              </label>
                              <input
                                type="text"
                                value={deployOptions.buildCommand}
                                onChange={(e) => setDeployOptions(prev => ({ ...prev, buildCommand: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Output Directory
                              </label>
                              <input
                                type="text"
                                value={deployOptions.outputDir}
                                onChange={(e) => setDeployOptions(prev => ({ ...prev, outputDir: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Framework
                            </label>
                            <select
                              value={deployOptions.framework}
                              onChange={(e) => setDeployOptions(prev => ({ ...prev, framework: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                              <option value="react">React</option>
                              <option value="vue">Vue</option>
                              <option value="angular">Angular</option>
                              <option value="next">Next.js</option>
                              <option value="nuxt">Nuxt.js</option>
                              <option value="svelte">Svelte</option>
                              <option value="static">Static HTML</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      {deployResult && (
                        <div className="mt-8">
                          <h5 className="text-lg font-medium text-gray-900 mb-4">Risultato Deploy</h5>
                          
                          <div className={`p-4 rounded-lg ${
                            deployResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                          }`}>
                            <div className="flex items-center gap-3 mb-3">
                              {deployResult.success ? (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                              ) : (
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                              )}
                              <h6 className="font-medium">
                                {deployResult.success ? 'Deploy completato con successo!' : 'Errore durante il deploy'}
                              </h6>
                            </div>
                            
                            {deployResult.success && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-700">URL:</span>
                                  <a
                                    href={deployResult.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                  >
                                    {deployResult.url}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-700">Provider:</span>
                                  <span className="text-sm text-gray-600 capitalize">{deployResult.provider}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-700">Deploy ID:</span>
                                  <span className="text-sm text-gray-600">{deployResult.deployId}</span>
                                </div>
                              </div>
                            )}
                            
                            {!deployResult.success && deployResult.error && (
                              <div className="mt-2 p-3 bg-red-100 rounded text-sm text-red-800">
                                {deployResult.error}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">Ottimizzazioni per {deployOptions.provider === 'vercel' ? 'Vercel' : 'Netlify'}</h5>
                        
                        <div className="space-y-2">
                          {deployOptions.provider === 'vercel' ? (
                            <>
                              <div className="flex items-center gap-2">
                                <ArrowRight className="h-4 w-4 text-indigo-600" />
                                <p className="text-sm text-gray-600">Configurazione automatica di Next.js Edge Functions</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <ArrowRight className="h-4 w-4 text-indigo-600" />
                                <p className="text-sm text-gray-600">Ottimizzazione delle immagini con Vercel Image Optimization</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <ArrowRight className="h-4 w-4 text-indigo-600" />
                                <p className="text-sm text-gray-600">Configurazione automatica di Vercel Analytics</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <ArrowRight className="h-4 w-4 text-indigo-600" />
                                <p className="text-sm text-gray-600">Configurazione di Netlify Functions per API serverless</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <ArrowRight className="h-4 w-4 text-indigo-600" />
                                <p className="text-sm text-gray-600">Ottimizzazione delle regole di redirect per SPA</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <ArrowRight className="h-4 w-4 text-indigo-600" />
                                <p className="text-sm text-gray-600">Configurazione di Netlify Forms per gestione moduli</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AIDevAssistant;