import { aiService } from './aiService';

export interface BoltDiyMessage {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  timestamp: Date;
  context?: any;
  suggestions?: string[];
}

export interface BoltDiyResponse {
  success: boolean;
  message: string;
  suggestions?: string[];
  autoFix?: {
    type: 'reload' | 'clear_cache' | 'restart' | 'none';
    description: string;
  };
}

class BoltDiyService {
  private static instance: BoltDiyService;
  private messages: BoltDiyMessage[] = [];
  private isConnected = false;
  private listeners: ((message: BoltDiyMessage) => void)[] = [];

  private constructor() {
    this.initialize();
  }

  public static getInstance(): BoltDiyService {
    if (!BoltDiyService.instance) {
      BoltDiyService.instance = new BoltDiyService();
    }
    return BoltDiyService.instance;
  }

  private async initialize() {
    try {
      // Simula connessione a bolt.diy
      await this.checkHealth();
      this.isConnected = true;
      console.log('Bolt.diy Service: Connesso e attivo');
    } catch (error) {
      console.error('Bolt.diy Service: Errore inizializzazione', error);
      this.isConnected = false;
    }
  }

  public async checkHealth(): Promise<boolean> {
    try {
      // Simula controllo salute
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    } catch (error) {
      return false;
    }
  }

  public async analyzeError(error: Error, context?: any): Promise<BoltDiyResponse> {
    const message: BoltDiyMessage = {
      id: Date.now().toString(),
      type: 'error',
      message: error.message,
      timestamp: new Date(),
      context: {
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context
      }
    };

    this.addMessage(message);

    try {
      // Usa AI Service per analizzare l'errore
      const analysis = await aiService.analyzeError({
        message: error.message,
        stack: error.stack || '',
        timestamp: new Date().toISOString(),
        url: window.location.href
      }, context);

      return {
        success: true,
        message: 'Errore analizzato con successo',
        suggestions: analysis.recommendations || ['Controlla la console per dettagli'],
        autoFix: analysis.autoFix || { type: 'none', description: 'Nessuna correzione automatica disponibile' }
      };
    } catch (aiError) {
      return {
        success: false,
        message: 'Errore durante l\'analisi AI',
        suggestions: ['Riprova più tardi', 'Controlla la connessione']
      };
    }
  }

  public async requestFix(description: string, context?: any): Promise<BoltDiyResponse> {
    try {
      const analysis = await aiService.requestFix(description, context);
      
      const message: BoltDiyMessage = {
        id: Date.now().toString(),
        type: 'info',
        message: `Richiesta correzione: ${description}`,
        timestamp: new Date(),
        context,
        suggestions: analysis.recommendations
      };

      this.addMessage(message);

      return {
        success: true,
        message: 'Richiesta elaborata',
        suggestions: analysis.recommendations,
        autoFix: analysis.autoFix
      };
    } catch (error) {
      return {
        success: false,
        message: 'Errore durante l\'elaborazione della richiesta'
      };
    }
  }

  public async sendMessage(message: string, context?: any): Promise<BoltDiyResponse> {
    try {
      const response = await aiService.chatWithAI(message, context);
      
      const boltMessage: BoltDiyMessage = {
        id: Date.now().toString(),
        type: 'info',
        message: `Chat: ${message}`,
        timestamp: new Date(),
        context,
        suggestions: [response]
      };

      this.addMessage(boltMessage);

      return {
        success: true,
        message: response,
        suggestions: [response]
      };
    } catch (error) {
      return {
        success: false,
        message: 'Errore durante l\'invio del messaggio'
      };
    }
  }

  private addMessage(message: BoltDiyMessage) {
    this.messages.unshift(message);
    if (this.messages.length > 50) {
      this.messages = this.messages.slice(0, 50);
    }
    
    // Notifica i listener
    this.listeners.forEach(listener => listener(message));
  }

  public getMessages(): BoltDiyMessage[] {
    return [...this.messages];
  }

  public addListener(listener: (message: BoltDiyMessage) => void) {
    this.listeners.push(listener);
  }

  public removeListener(listener: (message: BoltDiyMessage) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  public isHealthy(): boolean {
    return this.isConnected;
  }

  public async performAutoFix(fix: { type: string; description: string }): Promise<boolean> {
    try {
      switch (fix.type) {
        case 'reload':
          window.location.reload();
          return true;
        case 'clear_cache':
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
          }
          return true;
        case 'restart':
          // Simula riavvio
          await new Promise(resolve => setTimeout(resolve, 1000));
          return true;
        default:
          return false;
      }
    } catch (error) {
      console.error('Errore durante auto-fix:', error);
      return false;
    }
  }
}

export const boltDiyService = BoltDiyService.getInstance();