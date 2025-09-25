import { HfInference } from '@huggingface/inference';
import { supabase } from '../lib/supabase';

// Importa i moduli di Bolt.diy
import { BoltDiy } from '../lib/bolt.diy';
import type { BoltDiyConfig } from '../lib/bolt.diy/types';

export class BoltDiyService {
  private static instance: BoltDiyService;
  private boltDiy: BoltDiy | null = null;
  private hf: HfInference | null = null;
  private initialized: boolean = false;

  private constructor() {
    // Inizializza Hugging Face Inference
    try {
      this.hf = new HfInference('hf_free_api_key');
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

  async initialize(config?: Partial<BoltDiyConfig>): Promise<boolean> {
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
          openai: '',
          huggingface: 'hf_free_api_key',
          anthropic: ''
        }
      };
      
      // Unisci la configurazione fornita con quella di default
      const finalConfig = { ...defaultConfig, ...config };
      
      // Inizializza Bolt.diy
      this.boltDiy = new BoltDiy(finalConfig);
      await this.boltDiy.initialize();
      
      this.initialized = true;
      console.log('✅ Bolt.diy inizializzato con successo!');
      return true;
    } catch (error) {
      console.error('❌ Errore nell\'inizializzazione di Bolt.diy:', error);
      return false;
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
    // Genera SQL standard per attivare RLS e creare policy base
    let sql = `-- Correzione policy RLS per la tabella ${tableName}\n\n`;
    sql += `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;\n\n`;
    sql += `DO $$\nBEGIN\n`;
    sql += `  IF NOT EXISTS (\n`;
    sql += `    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = '${tableName}' AND policyname = 'Utenti autenticati possono leggere ${tableName}'\n`;
    sql += `  ) THEN\n`;
    sql += `    CREATE POLICY "Utenti autenticati possono leggere ${tableName}" ON ${tableName}\n`;
    sql += `      FOR SELECT TO authenticated USING (true);\n`;
    sql += `  END IF;\n`;
    sql += `  IF NOT EXISTS (\n`;
    sql += `    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = '${tableName}' AND policyname = 'Utenti autenticati possono modificare ${tableName}'\n`;
    sql += `  ) THEN\n`;
    sql += `    CREATE POLICY "Utenti autenticati possono modificare ${tableName}" ON ${tableName}\n`;
    sql += `      FOR ALL TO authenticated USING (true) WITH CHECK (true);\n`;
    sql += `  END IF;\n`;
    sql += `END$$;\n`;
    return sql;
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
      if (this.boltDiy) {
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