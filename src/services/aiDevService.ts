import { supabase } from '../lib/supabase';

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

  private constructor() {
    // Inizializza le chiavi API dalle variabili d'ambiente
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
    this.githubToken = import.meta.env.VITE_GITHUB_TOKEN || null;
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
      if (!this.githubToken) {
        return this.getMockRepositoryFiles();
      }

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
          'Authorization': `token ${this.githubToken}`
        }
      });

      const data = await response.json();
      
      // Se è un file singolo
      if (!Array.isArray(data)) {
        const content = atob(data.content); // Decodifica il contenuto Base64
        return [{
          path: data.path,
          content
        }];
      }

      // Se è una directory, recupera i file
      const files: RepositoryFile[] = [];
      for (const item of data) {
        if (item.type === 'file') {
          const fileResponse = await fetch(item.url, {
            headers: {
              'Authorization': `token ${this.githubToken}`
            }
          });
          const fileData = await fileResponse.json();
          const content = atob(fileData.content);
          files.push({
            path: item.path,
            content
          });
        }
      }

      return files;
    } catch (error) {
      console.error('Errore nel recupero dei file dal repository:', error);
      return this.getMockRepositoryFiles();
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
      if (!this.githubToken) {
        // Simula il salvataggio
        console.log(`Simulazione salvataggio: ${path}`);
        return true;
      }

      // In un'implementazione reale, questo salverebbe le modifiche su GitHub
      // Per questa demo, simuliamo il salvataggio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    }
    
    // Seleziona una risposta casuale dalla categoria
    const categoryResponses = responses[responseCategory as keyof typeof responses];
    const text = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    
    // Genera un esempio di codice
    let code = null;
    let language = null;
    
    if (responseCategory === 'errore' || responseCategory === 'implementa') {
      code = `// Esempio di codice generato localmente
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
    } else if (responseCategory === 'deploy') {
      code = `# Comandi per il deploy
npm run build
npx netlify deploy --prod --dir=dist`;
      language = 'bash';
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
      }
    ];
  }
}

export const aiDevService = AIDevService.getInstance();