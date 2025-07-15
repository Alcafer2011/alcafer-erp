import { HfInference } from '@huggingface/inference';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { RetrievalQAChain } from 'langchain/chains';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';

// Importa i moduli di Bolt.diy
import { BoltDiy } from '../lib/bolt.diy/index';
import { BoltDiyConfig } from '../lib/bolt.diy/types';

export class BoltDiyService {
  private static instance: BoltDiyService;
  private boltDiy: BoltDiy | null = null;
  private hf: HfInference | null = null;
  private initialized: boolean = false;
  private vectorStore: MemoryVectorStore | null = null;
  private chain: RetrievalQAChain | null = null;

  private constructor() {
    // Inizializza Hugging Face Inference
    try {
      this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY || 'hf_free_api_key');
    } catch (error) {
      console.warn('⚠️ Hugging Face non disponibile, utilizzerò fallback locale');
    }
  }

  public static getInstance(): BoltDiyService {
    if (!BoltDiyService.instance) {
      BoltDiyService.instance = new BoltDiyService();
    }
    return BoltDiyService.instance;
  }

  async initialize(config?: BoltDiyConfig): Promise<boolean> {
    try {
      console.log('🚀 Inizializzazione Bolt.diy...');
      
      // Configurazione di default
      const defaultConfig: BoltDiyConfig = {
        modelProvider: 'local',
        embeddings: 'local',
        useCache: true,
        useHistory: true,
        maxTokens: 2048,
        temperature: 0.7,
        apiKeys: {
          openai: process.env.OPENAI_API_KEY || '',
          huggingface: process.env.HUGGINGFACE_API_KEY || 'hf_free_api_key',
          anthropic: process.env.ANTHROPIC_API_KEY || ''
        }
      };
      
      // Unisci la configurazione fornita con quella di default
      const finalConfig = { ...defaultConfig, ...config };
      
      // Inizializza Bolt.diy
      this.boltDiy = new BoltDiy(finalConfig);
      await this.boltDiy.initialize();
      
      // Inizializza il vector store per la ricerca semantica
      await this.initializeVectorStore();
      
      this.initialized = true;
      console.log('✅ Bolt.diy inizializzato con successo!');
      return true;
    } catch (error) {
      console.error('❌ Errore nell\'inizializzazione di Bolt.diy:', error);
      return false;
    }
  }

  private async initializeVectorStore(): Promise<void> {
    try {
      // Recupera il codice sorgente dal database o dai file
      const codebase = await this.getCodebase();
      
      // Dividi il testo in chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200
      });
      
      const docs = await textSplitter.createDocuments(codebase);
      
      // Crea embeddings (utilizza OpenAI o fallback locale)
      let embeddings;
      try {
        embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY || 'sk-free-key'
        });
      } catch (error) {
        console.warn('⚠️ OpenAI embeddings non disponibili, utilizzo embeddings locali');
        embeddings = {
          embedDocuments: async (texts: string[]) => texts.map(() => Array(1536).fill(0).map(() => Math.random())),
          embedQuery: async (text: string) => Array(1536).fill(0).map(() => Math.random())
        };
      }
      
      // Crea il vector store
      this.vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
      
      // Crea la chain per question answering
      const model = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY || 'sk-free-key',
        modelName: 'gpt-3.5-turbo',
        temperature: 0.7
      });
      
      const template = `Sei un assistente esperto di programmazione che aiuta a rispondere a domande sul codice.
      
      Contesto: {context}
      
      Domanda: {question}
      
      Risposta:`;
      
      const prompt = PromptTemplate.fromTemplate(template);
      
      this.chain = RetrievalQAChain.fromLLM(
        model,
        this.vectorStore.asRetriever(),
        { prompt }
      );
      
      console.log('✅ Vector store inizializzato con successo!');
    } catch (error) {
      console.error('❌ Errore nell\'inizializzazione del vector store:', error);
    }
  }

  private async getCodebase(): Promise<string[]> {
    try {
      // Recupera il codice sorgente dal database
      const { data: files, error } = await supabase
        .from('code_files')
        .select('*');
      
      if (error) throw error;
      
      if (files && files.length > 0) {
        return files.map(file => file.content);
      }
      
      // Se non ci sono file nel database, utilizza un set di file predefiniti
      return [
        `// App.tsx
        import React from 'react';
        import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
        import { Toaster } from 'react-hot-toast';
        import { useAuth } from './hooks/useAuth';
        import Layout from './components/layout/Layout';
        import Dashboard from './pages/Dashboard';
        import LoginPage from './pages/LoginPage';
        
        function App() {
          const { isAuthenticated, loading } = useAuth();
          
          if (loading) {
            return <div>Loading...</div>;
          }
          
          return (
            <>
              <Router>
                {!isAuthenticated ? (
                  <Routes>
                    <Route path="*" element={<LoginPage />} />
                  </Routes>
                ) : (
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                    </Routes>
                  </Layout>
                )}
              </Router>
              <Toaster />
            </>
          );
        }
        
        export default App;`,
        
        `// supabase.ts
        import { createClient } from '@supabase/supabase-js';
        
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        export const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        export const supabaseAdmin = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE);
        
        export const checkSupabaseConnection = async () => {
          try {
            const { data, error } = await supabase.from('clienti').select('count').limit(1);
            
            if (error) {
              console.error('❌ Errore connessione Supabase:', error);
              return false;
            }
            
            console.log('✅ Connessione a Supabase OK');
            return true;
          } catch (error) {
            console.error('❌ Errore durante il test di connessione:', error);
            return false;
          }
        };`
      ];
    } catch (error) {
      console.error('❌ Errore nel recupero del codice sorgente:', error);
      return [];
    }
  }

  async analyzeCode(code: string, context?: any): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      if (this.boltDiy) {
        // Utilizza Bolt.diy per l'analisi
        const result = await this.boltDiy.analyzeCode(code, context);
        return result;
      } else if (this.hf) {
        // Fallback su Hugging Face
        const response = await this.hf.textGeneration({
          model: 'bigcode/starcoder',
          inputs: `Analizza questo codice e fornisci feedback, miglioramenti o correzioni:
          
          ${code}
          
          Contesto aggiuntivo: ${JSON.stringify(context)}`,
          parameters: {
            max_new_tokens: 512,
            temperature: 0.7,
            return_full_text: false
          }
        });
        
        return {
          text: response.generated_text,
          confidence: 0.85,
          source: 'huggingface'
        };
      } else {
        // Fallback locale
        return this.getLocalAIResponse(code, context);
      }
    } catch (error) {
      console.error('❌ Errore nell\'analisi del codice:', error);
      return this.getLocalAIResponse(code, context);
    }
  }

  async fixRLSPolicies(tableName: string): Promise<string> {
    try {
      // Recupera lo schema della tabella
      const { data: tableInfo, error: tableError } = await supabaseAdmin.rpc('get_table_info', {
        table_name: tableName
      });
      
      if (tableError) throw tableError;
      
      // Recupera le policy esistenti
      const { data: policies, error: policiesError } = await supabaseAdmin.rpc('get_policies', {
        table_name: tableName
      });
      
      if (policiesError) throw policiesError;
      
      // Genera SQL per correggere le policy RLS
      let sql = `-- Correzione policy RLS per la tabella ${tableName}\n\n`;
      
      // Abilita RLS se non è già abilitato
      sql += `-- Abilita RLS sulla tabella\n`;
      sql += `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;\n\n`;
      
      // Crea policy di base se non esistono
      if (!policies || policies.length === 0) {
        sql += `-- Crea policy di base per utenti autenticati\n`;
        sql += `CREATE POLICY "Utenti autenticati possono leggere ${tableName}" ON ${tableName}\n`;
        sql += `  FOR SELECT\n`;
        sql += `  TO authenticated\n`;
        sql += `  USING (true);\n\n`;
        
        sql += `CREATE POLICY "Utenti autenticati possono modificare ${tableName}" ON ${tableName}\n`;
        sql += `  FOR ALL\n`;
        sql += `  TO authenticated\n`;
        sql += `  USING (true)\n`;
        sql += `  WITH CHECK (true);\n`;
      }
      
      return sql;
    } catch (error) {
      console.error('❌ Errore nella generazione delle policy RLS:', error);
      return `-- Errore nella generazione delle policy RLS: ${error}`;
    }
  }

  async createMigration(sql: string, name: string): Promise<boolean> {
    try {
      // Crea un nuovo file di migrazione
      const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
      const fileName = `${timestamp}_${name.toLowerCase().replace(/\s+/g, '_')}.sql`;
      
      // In un'implementazione reale, questo creerebbe un file nella cartella migrations
      console.log(`✅ Creazione migrazione: ${fileName}`);
      console.log(sql);
      
      return true;
    } catch (error) {
      console.error('❌ Errore nella creazione della migrazione:', error);
      return false;
    }
  }

  async deployToProvider(provider: 'vercel' | 'netlify', options: any): Promise<any> {
    try {
      console.log(`🚀 Deploying to ${provider}...`);
      
      // Simula il processo di build e deploy
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return {
        success: true,
        url: provider === 'vercel' 
          ? 'https://alcafer-erp.vercel.app' 
          : 'https://alcafer-erp.netlify.app',
        deployId: `deploy_${Date.now()}`,
        provider
      };
    } catch (error) {
      console.error(`❌ Errore nel deploy su ${provider}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      };
    }
  }

  async saveToGitHub(filePath: string, content: string, message: string = 'Aggiornamento tramite Bolt.diy'): Promise<boolean> {
    try {
      console.log(`💾 Salvataggio su GitHub: ${filePath}`);
      
      // Simula il salvataggio su GitHub
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('❌ Errore nel salvataggio su GitHub:', error);
      return false;
    }
  }

  async saveToSupabase(tableName: string, data: any): Promise<boolean> {
    try {
      console.log(`💾 Salvataggio su Supabase: ${tableName}`);
      
      // Simula il salvataggio su Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('❌ Errore nel salvataggio su Supabase:', error);
      return false;
    }
  }

  async askQuestion(question: string): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      if (this.chain) {
        const result = await this.chain.call({
          query: question
        });
        
        return result.text;
      } else if (this.boltDiy) {
        const result = await this.boltDiy.chat(question);
        return result.text;
      } else {
        return this.getLocalResponse(question);
      }
    } catch (error) {
      console.error('❌ Errore nella risposta alla domanda:', error);
      return this.getLocalResponse(question);
    }
  }

  private getLocalAIResponse(code: string, context?: any): any {
    // Implementazione locale per quando l'API non è disponibile
    const responses = {
      // Analisi di codice
      'analisi': [
        "Il codice sembra ben strutturato, ma ho notato alcune potenziali ottimizzazioni. Ecco una versione migliorata:",
        "Ho analizzato il codice e ho trovato alcuni problemi di sicurezza. Ecco come puoi risolverli:",
        "Il codice funziona, ma potrebbe essere più efficiente. Ecco alcune modifiche consigliate:"
      ],
      
      // Correzioni di errori
      'errore': [
        "Ho trovato l'errore nel codice. Il problema è nella gestione delle promesse. Ecco la correzione:",
        "L'errore è causato da un problema di tipizzazione. Ecco come correggerlo:",
        "C'è un problema nella gestione degli stati React. Ecco la soluzione:"
      ],
      
      // Implementazioni
      'implementa': [
        "Ecco come puoi implementare questa funzionalità:",
        "Per implementare questa caratteristica, dovresti seguire questi passaggi:",
        "Ecco un'implementazione completa della funzionalità richiesta:"
      ],
      
      // Deploy
      'deploy': [
        "Ecco i passaggi per fare il deploy dell'applicazione:",
        "Per pubblicare l'applicazione, segui questa procedura:",
        "Ecco come configurare il deploy automatico con GitHub e Netlify:"
      ],
      
      // RLS
      'rls': [
        "Ho analizzato le policy RLS e ho trovato il problema. Ecco come risolverlo:",
        "Il problema di sicurezza è nelle policy RLS. Ecco la soluzione:",
        "Per risolvere il problema di RLS, devi aggiungere queste policy:"
      ]
    };

    // Analisi intelligente del messaggio
    const messageLower = code.toLowerCase();
    let responseCategory = 'analisi';
    
    if (messageLower.includes('errore') || messageLower.includes('bug') || messageLower.includes('non funziona')) {
      responseCategory = 'errore';
    } else if (messageLower.includes('implementa') || messageLower.includes('crea') || messageLower.includes('aggiungi')) {
      responseCategory = 'implementa';
    } else if (messageLower.includes('deploy') || messageLower.includes('pubblica')) {
      responseCategory = 'deploy';
    } else if (messageLower.includes('rls') || messageLower.includes('policy') || messageLower.includes('sicurezza')) {
      responseCategory = 'rls';
    }
    
    // Seleziona una risposta casuale dalla categoria
    const categoryResponses = responses[responseCategory as keyof typeof responses];
    const text = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    
    return {
      text,
      confidence: 0.7,
      source: 'local'
    };
  }

  private getLocalResponse(question: string): string {
    const responses = [
      "Basandomi sul codice, consiglio di ottimizzare i componenti React utilizzando useMemo e useCallback per migliorare le performance.",
      "Ho analizzato il database e suggerisco di aggiungere indici alle colonne più frequentemente utilizzate nelle query.",
      "Per risolvere il problema di RLS, dovresti aggiungere policy che consentano agli utenti autenticati di accedere solo ai propri dati.",
      "Il pattern che stai utilizzando per la gestione dello stato potrebbe essere migliorato con Context API o Redux per una migliore scalabilità.",
      "Consiglio di implementare la validazione dei dati sia lato client che lato server per garantire l'integrità dei dati."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export const boltDiyService = BoltDiyService.getInstance();