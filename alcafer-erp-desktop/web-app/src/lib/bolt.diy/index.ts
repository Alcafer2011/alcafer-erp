import { BoltDiyConfig } from './types';

export class BoltDiy {
  private config: BoltDiyConfig;
  private initialized: boolean = false;
  private cache: Map<string, any> = new Map();
  private history: any[] = [];

  constructor(config?: Partial<BoltDiyConfig>) {
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
        huggingface: '',
        anthropic: ''
      }
    };
    
    // Unisci la configurazione fornita con quella di default
    this.config = { ...defaultConfig, ...config };
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 Inizializzazione Bolt.diy...');
      
      // Simula l'inizializzazione
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      // Controlla se il risultato è nella cache
      const cacheKey = `code_${this.hashString(code)}`;
      if (this.config.useCache && this.cache.has(cacheKey)) {
        console.log('🔍 Risultato trovato nella cache');
        return this.cache.get(cacheKey);
      }
      
      // Simula l'analisi del codice
      console.log('🔍 Analisi del codice in corso...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Genera una risposta basata sul codice
      const response = this.generateCodeAnalysis(code, context);
      
      // Salva nella cache
      if (this.config.useCache) {
        this.cache.set(cacheKey, response);
      }
      
      // Salva nella cronologia
      if (this.config.useHistory) {
        this.history.push({
          type: 'code_analysis',
          code,
          response,
          timestamp: new Date()
        });
      }
      
      return response;
    } catch (error) {
      console.error('❌ Errore nell\'analisi del codice:', error);
      return {
        text: 'Mi dispiace, si è verificato un errore durante l\'analisi del codice.',
        confidence: 0.5,
        source: 'local'
      };
    }
  }

  async chat(message: string, context?: any): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Controlla se il risultato è nella cache
      const cacheKey = `chat_${this.hashString(message)}`;
      if (this.config.useCache && this.cache.has(cacheKey)) {
        console.log('🔍 Risultato trovato nella cache');
        return this.cache.get(cacheKey);
      }
      
      // Simula la generazione della risposta
      console.log('🔍 Generazione risposta in corso...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Genera una risposta basata sul messaggio
      const response = this.generateChatResponse(message, context);
      
      // Salva nella cache
      if (this.config.useCache) {
        this.cache.set(cacheKey, response);
      }
      
      // Salva nella cronologia
      if (this.config.useHistory) {
        this.history.push({
          type: 'chat',
          message,
          response,
          timestamp: new Date()
        });
      }
      
      return response;
    } catch (error) {
      console.error('❌ Errore nella generazione della risposta:', error);
      return {
        text: 'Mi dispiace, si è verificato un errore durante la generazione della risposta.',
        confidence: 0.5,
        source: 'local'
      };
    }
  }

  async fixCode(code: string, error?: string): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Controlla se il risultato è nella cache
      const cacheKey = `fix_${this.hashString(code)}_${this.hashString(error || '')}`;
      if (this.config.useCache && this.cache.has(cacheKey)) {
        console.log('🔍 Risultato trovato nella cache');
        return this.cache.get(cacheKey);
      }
      
      // Simula la correzione del codice
      console.log('🔧 Correzione del codice in corso...');
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Genera una correzione basata sul codice e sull'errore
      const response = this.generateCodeFix(code, error);
      
      // Salva nella cache
      if (this.config.useCache) {
        this.cache.set(cacheKey, response);
      }
      
      // Salva nella cronologia
      if (this.config.useHistory) {
        this.history.push({
          type: 'code_fix',
          code,
          error,
          response,
          timestamp: new Date()
        });
      }
      
      return response;
    } catch (error) {
      console.error('❌ Errore nella correzione del codice:', error);
      return {
        text: 'Mi dispiace, si è verificato un errore durante la correzione del codice.',
        fixedCode: code,
        confidence: 0.5,
        source: 'local'
      };
    }
  }

  async generateSQL(description: string): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Controlla se il risultato è nella cache
      const cacheKey = `sql_${this.hashString(description)}`;
      if (this.config.useCache && this.cache.has(cacheKey)) {
        console.log('🔍 Risultato trovato nella cache');
        return this.cache.get(cacheKey);
      }
      
      // Simula la generazione del SQL
      console.log('🔧 Generazione SQL in corso...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Genera SQL basato sulla descrizione
      const response = this.generateSQLQuery(description);
      
      // Salva nella cache
      if (this.config.useCache) {
        this.cache.set(cacheKey, response);
      }
      
      // Salva nella cronologia
      if (this.config.useHistory) {
        this.history.push({
          type: 'sql_generation',
          description,
          response,
          timestamp: new Date()
        });
      }
      
      return response;
    } catch (error) {
      console.error('❌ Errore nella generazione SQL:', error);
      return {
        text: 'Mi dispiace, si è verificato un errore durante la generazione SQL.',
        sql: '',
        confidence: 0.5,
        source: 'local'
      };
    }
  }

  getHistory(): any[] {
    return this.history;
  }

  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Cache svuotata');
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  private generateCodeAnalysis(code: string, context?: any): any {
    // Analisi semplice del codice
    const isReact = code.includes('React') || code.includes('useState') || code.includes('useEffect');
    const isTypeScript = code.includes(': ') || code.includes('interface ') || code.includes('<');
    const hasAsync = code.includes('async') || code.includes('await');
    const hasImports = code.includes('import ');
    
    let analysis = '';
    
    if (isReact) {
      analysis += 'Il codice utilizza React. ';
      if (code.includes('useState')) {
        analysis += 'Utilizza gli hook useState per la gestione dello stato. ';
      }
      if (code.includes('useEffect')) {
        analysis += 'Utilizza useEffect per gli effetti collaterali. ';
      }
    }
    
    if (isTypeScript) {
      analysis += 'Il codice è scritto in TypeScript. ';
    } else {
      analysis += 'Il codice sembra essere JavaScript. ';
    }
    
    if (hasAsync) {
      analysis += 'Utilizza funzioni asincrone. ';
    }
    
    if (hasImports) {
      analysis += 'Importa moduli esterni. ';
    }
    
    // Suggerimenti
    let suggestions = '';
    
    if (isReact && !code.includes('useMemo') && !code.includes('useCallback')) {
      suggestions += '- Considera di utilizzare useMemo e useCallback per ottimizzare le performance.\n';
    }
    
    if (isReact && code.includes('useState') && code.includes('useEffect') && !code.includes('useReducer')) {
      suggestions += '- Per stati complessi, considera di utilizzare useReducer invece di useState.\n';
    }
    
    if (hasAsync && !code.includes('try') && !code.includes('catch')) {
      suggestions += '- Aggiungi gestione degli errori con try/catch per le operazioni asincrone.\n';
    }
    
    const fullText = `# Analisi del Codice

${analysis}

${suggestions ? `## Suggerimenti\n\n${suggestions}` : ''}

Il codice sembra ${code.length > 500 ? 'abbastanza complesso' : 'relativamente semplice'} e ${code.includes('function') || code.includes('=>') ? 'ben strutturato' : 'potrebbe beneficiare di una migliore strutturazione'}.`;
    
    return {
      text: fullText,
      confidence: 0.8,
      source: 'boltdiy'
    };
  }

  private generateChatResponse(message: string, context?: any): any {
    // Risposte predefinite basate su parole chiave
    if (message.toLowerCase().includes('errore')) {
      return {
        text: 'Per risolvere l\'errore, controlla innanzitutto i log della console. Spesso gli errori in JavaScript/TypeScript forniscono informazioni dettagliate sul problema. Se stai utilizzando React, verifica che tutti i componenti siano correttamente importati e che le props siano passate correttamente.',
        confidence: 0.85,
        source: 'boltdiy'
      };
    }
    
    if (message.toLowerCase().includes('supabase')) {
      return {
        text: 'Supabase è un\'alternativa open source a Firebase che offre database PostgreSQL, autenticazione, API istantanee, notifiche in tempo reale e storage. Per risolvere problemi con Supabase, verifica che le variabili d\'ambiente siano configurate correttamente e che le policy RLS (Row Level Security) siano impostate per consentire le operazioni necessarie.',
        confidence: 0.9,
        source: 'boltdiy'
      };
    }
    
    if (message.toLowerCase().includes('deploy')) {
      return {
        text: 'Per il deploy della tua applicazione, puoi utilizzare Vercel o Netlify. Entrambi offrono hosting gratuito per progetti personali e si integrano facilmente con GitHub. Assicurati di avere un file di configurazione appropriato (vercel.json o netlify.toml) e che tutte le variabili d\'ambiente necessarie siano configurate nel dashboard del provider.',
        confidence: 0.85,
        source: 'boltdiy'
      };
    }
    
    if (message.toLowerCase().includes('rls') || message.toLowerCase().includes('policy')) {
      return {
        text: 'Le policy RLS (Row Level Security) in Supabase ti permettono di controllare quali righe possono essere lette, inserite, aggiornate o eliminate dagli utenti. Per risolvere problemi di RLS, assicurati di aver abilitato RLS sulla tabella e di aver creato policy appropriate per le operazioni che desideri consentire. Ricorda che senza policy, nessun utente può accedere ai dati quando RLS è abilitato.',
        confidence: 0.95,
        source: 'boltdiy'
      };
    }
    
    // Risposta generica
    return {
      text: 'Posso aiutarti con analisi del codice, risoluzione di errori, configurazione di Supabase, ottimizzazione delle performance e molto altro. Fammi sapere su cosa stai lavorando e come posso esserti utile!',
      confidence: 0.7,
      source: 'boltdiy'
    };
  }

  private generateCodeFix(code: string, error?: string): any {
    // Correzioni comuni
    let fixedCode = code;
    let explanation = '';
    
    if (error?.includes('is not defined')) {
      const match = error.match(/'([^']+)' is not defined/);
      if (match && match[1]) {
        const variable = match[1];
        fixedCode = `const ${variable} = {};\n\n${code}`;
        explanation = `La variabile "${variable}" non è definita. Ho aggiunto una dichiarazione all'inizio del codice.`;
      }
    } else if (error?.includes('is not a function')) {
      const match = error.match(/'([^']+)' is not a function/);
      if (match && match[1]) {
        const func = match[1];
        fixedCode = code.replace(`${func}(`, `// ${func} non è una funzione\n// Sostituisci con una funzione valida\nconsole.log(`);
        explanation = `"${func}" non è una funzione. Ho commentato la chiamata e suggerito di sostituirla con una funzione valida.`;
      }
    } else if (code.includes('useState(') && !code.includes('import { useState }') && !code.includes('import React')) {
      fixedCode = `import { useState } from 'react';\n\n${code}`;
      explanation = 'Manca l\'import di useState da React. Ho aggiunto l\'import necessario.';
    } else if (code.includes('useEffect(') && !code.includes('import { useEffect }') && !code.includes('import React')) {
      fixedCode = `import { useEffect } from 'react';\n\n${code}`;
      explanation = 'Manca l\'import di useEffect da React. Ho aggiunto l\'import necessario.';
    } else if (code.includes('await') && !code.includes('async')) {
      fixedCode = code.replace('function', 'async function').replace('() =>', 'async () =>');
      explanation = 'Stai utilizzando await senza dichiarare la funzione come async. Ho aggiunto il modificatore async.';
    } else if (code.includes('supabase') && !code.includes('import { supabase }')) {
      fixedCode = `import { supabase } from '../lib/supabase';\n\n${code}`;
      explanation = 'Manca l\'import di supabase. Ho aggiunto l\'import necessario.';
    } else {
      explanation = 'Non ho trovato errori evidenti nel codice. Se stai riscontrando problemi specifici, fornisci maggiori dettagli sull\'errore.';
    }
    
    return {
      text: explanation,
      fixedCode,
      confidence: 0.75,
      source: 'boltdiy'
    };
  }

  private generateSQLQuery(description: string): any {
    let sql = '';
    let explanation = '';
    
    if (description.toLowerCase().includes('crea tabella') || description.toLowerCase().includes('create table')) {
      sql = `CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  created_at timestamptz DEFAULT now()
);

-- Abilita RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Crea policy per consentire agli utenti autenticati di leggere i propri dati
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Crea policy per consentire agli utenti autenticati di modificare i propri dati
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);`;
      
      explanation = 'Ho generato uno script SQL per creare una tabella users con RLS abilitato e policy appropriate per consentire agli utenti di accedere solo ai propri dati.';
    } else if (description.toLowerCase().includes('policy') || description.toLowerCase().includes('rls')) {
      sql = `-- Abilita RLS sulla tabella
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Policy per consentire agli utenti autenticati di leggere tutti i dati
CREATE POLICY "Authenticated users can read all data"
  ON table_name
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy per consentire agli utenti di modificare solo i propri dati
CREATE POLICY "Users can insert own data"
  ON table_name
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON table_name
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own data"
  ON table_name
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);`;
      
      explanation = 'Ho generato policy RLS per consentire agli utenti autenticati di leggere tutti i dati ma modificare solo i propri. Sostituisci "table_name" con il nome della tua tabella e "user_id" con il nome della colonna che contiene l\'ID utente.';
    } else if (description.toLowerCase().includes('join') || description.toLowerCase().includes('unione')) {
      sql = `SELECT
  u.id,
  u.email,
  u.name,
  p.title,
  p.content,
  p.created_at
FROM
  users u
JOIN
  posts p ON u.id = p.user_id
WHERE
  u.id = auth.uid()
ORDER BY
  p.created_at DESC;`;
      
      explanation = 'Ho generato una query SQL che unisce (JOIN) la tabella users con la tabella posts, filtrando per l\'utente corrente e ordinando per data di creazione.';
    } else {
      sql = `-- Esempio di query SQL
SELECT
  *
FROM
  table_name
WHERE
  condition = true
ORDER BY
  created_at DESC
LIMIT 10;`;
      
      explanation = 'Ho generato un esempio di query SQL. Per generare una query più specifica, fornisci dettagli sulle tabelle e sui dati che desideri recuperare.';
    }
    
    return {
      text: explanation,
      sql,
      confidence: 0.8,
      source: 'boltdiy'
    };
  }
}
