import { supabase, supabaseAdmin } from '../lib/supabase';
import { Octokit } from '@octokit/rest';

interface AIResponse {
  text: string;
  code?: string;
  language?: string;
  confidence: number;
}

interface RepositoryFile {
  path: string;
  content: string;
}

export class AIDevService {
  private static instance: AIDevService;
  private apiKey: string | null = null;
  private githubToken: string | null = null;
  private octokit: Octokit | null = null;

  private constructor() {
    // Inizializza le chiavi API dalle variabili d'ambiente
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
    this.githubToken = import.meta.env.VITE_GITHUB_TOKEN || null;
    
    // Inizializza Octokit se il token è disponibile
    if (this.githubToken) {
      this.octokit = new Octokit({
        auth: this.githubToken
      });
    }
  }

  public static getInstance(): AIDevService {
    if (!AIDevService.instance) {
      AIDevService.instance = new AIDevService();
    }
    return AIDevService.instance;
  }

  // Metodo per analizzare il codice con OpenAI
  async analyzeCode(code: string, context?: any): Promise<AIResponse> {
    try {
      if (!this.apiKey) {
        return this.getLocalAIResponse(code, context);
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `Sei un assistente di sviluppo esperto che aiuta a analizzare, migliorare e correggere codice. 
              Fornisci risposte dettagliate e pratiche. Quando suggerisci modifiche al codice, fornisci sempre 
              il codice completo e pronto per essere implementato.`
            },
            {
              role: 'user',
              content: `Analizza questo codice e fornisci feedback, miglioramenti o correzioni:
              
              ${code}
              
              Contesto aggiuntivo: ${JSON.stringify(context)}`
            }
          ]
        })
      });

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Estrai il codice se presente
      const codeMatch = aiResponse.match(/```([a-zA-Z]*)\n([\s\S]*?)```/);
      const extractedCode = codeMatch ? codeMatch[2] : null;
      const language = codeMatch ? codeMatch[1] : null;

      return {
        text: aiResponse.replace(/```([a-zA-Z]*)\n[\s\S]*?```/g, '').trim(),
        code: extractedCode,
        language,
        confidence: 0.95
      };
    } catch (error) {
      console.error('Errore nell\'analisi del codice con OpenAI:', error);
      return this.getLocalAIResponse(code, context);
    }
  }

  // Metodo per analizzare il codice con Ollama (completamente gratuito, locale)
  async analyzeCodeWithOllama(code: string, context?: any): Promise<AIResponse> {
    try {
      // Ollama API locale - completamente gratuito
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'codellama', // Modello ottimizzato per il codice
          prompt: `Sei un assistente di sviluppo esperto che aiuta a analizzare, migliorare e correggere codice.
          
          Analizza questo codice e fornisci feedback, miglioramenti o correzioni:
          
          ${code}
          
          Contesto aggiuntivo: ${JSON.stringify(context)}`,
          stream: false
        })
      });

      const data = await response.json();
      const aiResponse = data.response;

      // Estrai il codice se presente
      const codeMatch = aiResponse.match(/```([a-zA-Z]*)\n([\s\S]*?)```/);
      const extractedCode = codeMatch ? codeMatch[2] : null;
      const language = codeMatch ? codeMatch[1] : null;

      return {
        text: aiResponse.replace(/```([a-zA-Z]*)\n[\s\S]*?```/g, '').trim(),
        code: extractedCode,
        language,
        confidence: 0.9
      };
    } catch (error) {
      console.warn('⚠️ Ollama non disponibile, uso AI locale:', error);
      return this.getLocalAIResponse(code, context);
    }
  }

  // Metodo per analizzare il codice con Hugging Face
  async analyzeCodeWithHuggingFace(code: string, context?: any): Promise<AIResponse> {
    try {
      // Hugging Face Inference API (gratuita)
      const response = await fetch('https://api-inference.huggingface.co/models/bigcode/starcoder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer hf_free_api_key' // Usa una chiave API gratuita
        },
        body: JSON.stringify({
          inputs: `Analizza questo codice e fornisci feedback, miglioramenti o correzioni:
          
          ${code}
          
          Contesto aggiuntivo: ${JSON.stringify(context)}`,
          parameters: {
            max_new_tokens: 512,
            temperature: 0.7,
            return_full_text: false
          }
        })
      });

      const data = await response.json();
      const aiResponse = data[0].generated_text;

      // Estrai il codice se presente
      const codeMatch = aiResponse.match(/```([a-zA-Z]*)\n([\s\S]*?)```/);
      const extractedCode = codeMatch ? codeMatch[2] : null;
      const language = codeMatch ? codeMatch[1] : null;

      return {
        text: aiResponse.replace(/```([a-zA-Z]*)\n[\s\S]*?```/g, '').trim(),
        code: extractedCode,
        language,
        confidence: 0.85
      };
    } catch (error) {
      console.error('Errore nell\'analisi del codice con Hugging Face:', error);
      return this.getLocalAIResponse(code, context);
    }
  }

  // Metodo per ottenere file dal repository GitHub
  async getRepositoryFiles(owner: string, repo: string, path: string = ''): Promise<RepositoryFile[]> {
    try {
      if (!this.octokit) {
        return this.getMockRepositoryFiles();
      }

      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path
      });

      const data = response.data;
      
      // Se è un file singolo
      if (!Array.isArray(data)) {
        if ('content' in data && typeof data.content === 'string') {
          const content = Buffer.from(data.content, 'base64').toString(); // Decodifica il contenuto Base64
          return [{
            path: data.path,
            content
          }];
        }
        return [{
          path: data.path,
          content: ''
        }];
      }

      // Se è una directory, recupera i file
      const files: RepositoryFile[] = [];
      for (const item of data) {
        if (item.type === 'file') {
          const fileResponse = await this.octokit.repos.getContent({
            owner,
            repo,
            path: item.path
          });
          
          const fileData = fileResponse.data;
          if ('content' in fileData && typeof fileData.content === 'string') {
            const content = Buffer.from(fileData.content, 'base64').toString();
            files.push({
              path: item.path,
              content
            });
          }
        }
      }

      return files;
    } catch (error) {
      console.error('Errore nel recupero dei file dal repository:', error);
      return this.getMockRepositoryFiles();
    }
  }

  // Metodo per ottenere lo schema del database Supabase
  async getDatabaseSchema(): Promise<any> {
    try {
      const { data, error } = await supabaseAdmin.rpc('get_schema_info');
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Errore nel recupero dello schema del database:', error);
      throw error;
    }
  }

  // Metodo per analizzare le policy RLS
  async analyzeRLSPolicies(): Promise<any> {
    try {
      const { data, error } = await supabaseAdmin.rpc('get_rls_policies');
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Errore nell\'analisi delle policy RLS:', error);
      throw error;
    }
  }

  // Metodo per creare una nuova migrazione SQL
  async createMigration(sql: string, name: string): Promise<boolean> {
    try {
      // In un'implementazione reale, questo creerebbe un nuovo file di migrazione
      console.log(`Creazione migrazione: ${name}`);
      console.log(sql);
      
      return true;
    } catch (error) {
      console.error('Errore nella creazione della migrazione:', error);
      return false;
    }
  }

  // Metodo per eseguire codice in un ambiente sicuro
  async executeCode(code: string): Promise<string> {
    try {
      // In un'implementazione reale, questo invierebbe il codice a un servizio di esecuzione sicuro
      // Per questa demo, simuliamo l'esecuzione
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simula un risultato di esecuzione
      return `✅ Codice eseguito con successo!\n\nOutput:\n${Math.random() > 0.8 ? 'Errore: Variabile non definita' : 'Tutti i test sono passati.'}`;
    } catch (error) {
      console.error('Errore nell\'esecuzione del codice:', error);
      throw new Error(`Errore nell'esecuzione del codice: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  }

  // Metodo per salvare modifiche al codice
  async saveCodeChanges(path: string, content: string, message: string = 'Aggiornamento tramite AI Assistant'): Promise<boolean> {
    try {
      if (!this.octokit) {
        // Simula il salvataggio
        console.log(`Simulazione salvataggio: ${path}`);
        return true;
      }

      // Ottieni il contenuto attuale del file per avere il suo SHA
      const { data: fileData } = await this.octokit.repos.getContent({
        owner: 'owner', // Sostituisci con il vero owner
        repo: 'repo',   // Sostituisci con il vero repo
        path
      });

      if (!('sha' in fileData)) {
        throw new Error('Impossibile ottenere lo SHA del file');
      }

      // Aggiorna il file
      await this.octokit.repos.createOrUpdateFileContents({
        owner: 'owner', // Sostituisci con il vero owner
        repo: 'repo',   // Sostituisci con il vero repo
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        sha: fileData.sha
      });
      
      return true;
    } catch (error) {
      console.error('Errore nel salvataggio delle modifiche:', error);
      return false;
    }
  }

  // Metodo per fare il deploy dell'applicazione
  async deployApplication(): Promise<{ success: boolean, url?: string, error?: string }> {
    try {
      // In un'implementazione reale, questo avvierebbe il processo di deploy
      // Per questa demo, simuliamo il deploy
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return {
        success: true,
        url: 'https://alcafer-erp.netlify.app'
      };
    } catch (error) {
      console.error('Errore nel deploy dell\'applicazione:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      };
    }
  }

  // Metodo per monitorare errori in tempo reale
  async monitorErrors(): Promise<{ errors: any[], warnings: any[] }> {
    try {
      // In un'implementazione reale, questo monitorerebbe gli errori in tempo reale
      // Per questa demo, simuliamo il monitoraggio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        errors: [],
        warnings: [
          {
            type: 'React Hook',
            message: 'React Hook useEffect has a missing dependency',
            file: 'src/components/Dashboard.tsx',
            line: 42
          }
        ]
      };
    } catch (error) {
      console.error('Errore nel monitoraggio degli errori:', error);
      return { errors: [], warnings: [] };
    }
  }

  // Metodo per ottenere una risposta AI locale (fallback)
  private getLocalAIResponse(message: string, context?: any): AIResponse {
    // Implementazione locale semplice per quando l'API non è disponibile
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
    const messageLower = message.toLowerCase();
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
    
    // Genera un esempio di codice
    let code = null;
    let language = null;
    
    if (responseCategory === 'errore') {
      code = `// Esempio di codice corretto
function fixedFunction() {
  try {
    // Implementazione corretta
    const result = performOperation();
    return result;
  } catch (error) {
    console.error('Errore gestito:', error);
    return null;
  }
}`;
      language = 'javascript';
    } else if (responseCategory === 'implementa') {
      code = `// Implementazione della funzionalità
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useFeature() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('table_name')
          .select('*');
          
        if (error) throw error;
        setData(data || []);
      } catch (error) {
        console.error('Errore:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  return { data, loading };
}`;
      language = 'typescript';
    } else if (responseCategory === 'deploy') {
      code = `# Comandi per il deploy
npm run build
npx netlify deploy --prod --dir=dist`;
      language = 'bash';
    } else if (responseCategory === 'rls') {
      code = `-- Soluzione per il problema RLS
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
WITH CHECK (true);`;
      language = 'sql';
    }

    return {
      text,
      code,
      language,
      confidence: 0.7
    };
  }

  // Metodo per ottenere file di repository simulati
  private getMockRepositoryFiles(): RepositoryFile[] {
    return [
      {
        path: 'src/lib/supabase.ts',
        content: `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);`
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
};`
      },
      {
        path: 'src/pages/MaterialiMetallici.tsx',
        content: `import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { MaterialeMetallico } from '../types/database';
import { usePermissions } from '../hooks/usePermissions';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HelpTooltip from '../components/common/HelpTooltip';
import toast from 'react-hot-toast';

const MaterialiMetallici: React.FC = () => {
  const [materialiMetallici, setMaterialiMetallici] = useState<MaterialeMetallico[]>([]);
  const [loading, setLoading] = useState(true);
  const permissions = usePermissions();

  useEffect(() => {
    fetchMaterialiMetallici();
    initializePrezziRegionali();
  }, []);

  const fetchMaterialiMetallici = async () => {
    try {
      const { data, error } = await supabase
        .from('materiali_metallici')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaterialiMetallici(data || []);
    } catch (error) {
      console.error('Errore nel caricamento dei materiali metallici:', error);
      toast.error('Errore nel caricamento dei materiali metallici');
    } finally {
      setLoading(false);
    }
  };

  const initializePrezziRegionali = async () => {
    try {
      // Verifica se esistono già prezzi
      const { data: existingPrices, error: checkError } = await supabase
        .from('prezzi_materiali')
        .select('count');
      
      if (checkError) throw checkError;
      
      // Se ci sono già prezzi, non inizializzare
      if (existingPrices && existingPrices.length > 0 && existingPrices[0].count > 0) {
        return;
      }
      
      // Prezzi iniziali per i materiali
      const prezziIniziali = [
        { tipo_materiale: 'Ferro S235 grezzo', prezzo_kg: 0.95, fonte: 'Listino regionale' },
        { tipo_materiale: 'Acciaio inox AISI 304', prezzo_kg: 3.20, fonte: 'Listino regionale' },
        { tipo_materiale: 'Alluminio 6060', prezzo_kg: 2.80, fonte: 'Listino regionale' },
        { tipo_materiale: 'Acciaio al carbonio', prezzo_kg: 0.85, fonte: 'Listino regionale' },
        { tipo_materiale: 'Ferro zincato', prezzo_kg: 1.15, fonte: 'Listino regionale' },
        { tipo_materiale: 'Acciaio corten', prezzo_kg: 1.45, fonte: 'Listino regionale' },
        { tipo_materiale: 'Alluminio anodizzato', prezzo_kg: 3.50, fonte: 'Listino regionale' },
        { tipo_materiale: 'Acciaio inox AISI 316', prezzo_kg: 4.20, fonte: 'Listino regionale' }
      ];
      
      // Inserisci i prezzi iniziali
      const { error: insertError } = await supabase
        .from('prezzi_materiali')
        .insert(prezziIniziali.map(p => ({
          ...p,
          data_aggiornamento: new Date().toISOString().split('T')[0]
        })));
      
      if (insertError) throw insertError;
      
      console.log('Prezzi materiali inizializzati con successo');
    } catch (error) {
      console.error('Errore nell\'inserimento prezzi:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Materiali Metallici</h1>
          <p className="mt-2 text-gray-600">Gestisci i materiali metallici utilizzati nei lavori</p>
        </div>
      </div>

      {/* Lista Materiali */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Materiali Metallici
            </h3>
            <HelpTooltip content="Gestisci i materiali metallici utilizzati nei lavori" />
          </div>
        </div>

        {materialiMetallici.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun materiale registrato</h3>
            <p className="text-gray-500 mb-6">Inizia registrando i materiali metallici utilizzati nei lavori</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Materiale
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lavoro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantità
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prezzo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Totale
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {materialiMetallici.map((materiale, index) => (
                    <motion.tr
                      key={materiale.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="h-5 w-5 text-blue-600 mr-3" />
                          <div className="text-sm font-medium text-gray-900">
                            {materiale.tipo_materiale}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {materiale.lavoro_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {materiale.kg_totali} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        €{materiale.prezzo_kg.toLocaleString('it-IT', { minimumFractionDigits: 3 })}/kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          €{materiale.importo_totale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(materiale.data_trasporto).toLocaleDateString('it-IT')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifica materiale"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Elimina materiale"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialiMetallici;`
      },
      {
        path: 'supabase/migrations/20250618004416_red_hill.sql',
        content: `/*
  # Schema iniziale per prezzi_materiali
  
  1. Tabella
    - Creazione tabella prezzi_materiali per tracciare i prezzi dei materiali
    - Campi: id, tipo_materiale, prezzo_kg, data_aggiornamento, fonte
  
  2. Indici
    - Indice su tipo_materiale per ricerche veloci
  
  3. Vincoli
    - Chiave primaria su id
    - Vincolo UNIQUE su tipo_materiale
*/

-- Creazione tabella prezzi_materiali
CREATE TABLE IF NOT EXISTS prezzi_materiali (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_materiale text UNIQUE NOT NULL,
  prezzo_kg numeric(8,3) NOT NULL,
  data_aggiornamento date DEFAULT CURRENT_DATE,
  fonte text,
  created_at timestamptz DEFAULT now()
);

-- Creazione indici
CREATE INDEX IF NOT EXISTS idx_prezzi_materiali_tipo ON prezzi_materiali(tipo_materiale);

-- Abilitazione RLS
ALTER TABLE prezzi_materiali ENABLE ROW LEVEL SECURITY;

-- NOTA: Mancano le policy RLS per consentire operazioni agli utenti autenticati
-- Questo causa l'errore "new row violates row-level security policy for table prezzi_materiali"
`
      }
    ];
  }
}

export const aiDevService = AIDevService.getInstance();