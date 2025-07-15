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
    return {
      text: "Sono l'assistente di sviluppo locale. Posso aiutarti con analisi di base del codice, ma per funzionalità avanzate è necessaria una connessione a OpenAI o Hugging Face.",
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