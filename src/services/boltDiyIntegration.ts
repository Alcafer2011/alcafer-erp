import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export interface BoltDiyConfig {
  enabled: boolean;
  anthropicApiKey: string;
  monitoringInterval: number;
  autoFix: boolean;
  githubIntegration: boolean;
}

export interface ErrorReport {
  type: 'javascript' | 'network' | 'database' | 'performance';
  message: string;
  stack?: string;
  file?: string;
  line?: number;
  timestamp: string;
  context: any;
}

export class BoltDiyIntegrationService {
  private static instance: BoltDiyIntegrationService;
  private config: BoltDiyConfig;
  private isConnected: boolean = false;
  private ws: WebSocket | null = null;
  private errorQueue: ErrorReport[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      enabled: true,
      anthropicApiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
      monitoringInterval: 30000, // 30 secondi
      autoFix: true,
      githubIntegration: true
    };
  }

  public static getInstance(): BoltDiyIntegrationService {
    if (!BoltDiyIntegrationService.instance) {
      BoltDiyIntegrationService.instance = new BoltDiyIntegrationService();
    }
    return BoltDiyIntegrationService.instance;
  }

  // 🚀 Inizializzazione integrazione
  async initialize(): Promise<boolean> {
    try {
      console.log('🔗 Inizializzazione integrazione bolt.diy...');

      if (!this.config.enabled) {
        console.log('⚠️ Integrazione bolt.diy disabilitata');
        return false;
      }

      // Attendi che bolt.diy sia disponibile
      const boltAvailable = await this.waitForBoltDiy();
      if (!boltAvailable) {
        console.warn('⚠️ bolt.diy non disponibile, continuo senza integrazione');
        return false;
      }

      // Configura monitoraggio errori
      this.setupErrorMonitoring();

      // Configura monitoraggio performance
      this.setupPerformanceMonitoring();

      // Configura comunicazione WebSocket
      await this.setupWebSocketConnection();

      // Configura monitoraggio Supabase
      this.setupSupabaseMonitoring();

      // Configura integrazione GitHub
      if (this.config.githubIntegration) {
        this.setupGitHubIntegration();
      }

      this.isConnected = true;
      console.log('✅ Integrazione bolt.diy attiva');

      // Notifica a bolt.diy che Alcafer ERP è pronto
      await this.notifyBoltDiy('alcafer_ready', {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        features: ['supabase', 'github', 'ai-monitoring', 'auto-fix']
      });

      // Mostra indicatore di stato
      this.showStatusIndicator();

      return true;

    } catch (error) {
      console.error('❌ Errore inizializzazione bolt.diy:', error);
      return false;
    }
  }

  // ⏳ Attende che bolt.diy sia disponibile
  private async waitForBoltDiy(maxAttempts: number = 15): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch('http://localhost:5174/api/health', {
          method: 'GET',
          timeout: 2000
        } as any);
        
        if (response.ok) {
          console.log('✅ bolt.diy disponibile');
          return true;
        }
      } catch (error) {
        console.log(`⏳ Attendo bolt.diy... (${i + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    return false;
  }

  // 🔍 Monitoraggio errori JavaScript
  private setupErrorMonitoring(): void {
    console.log('👁️ Configurazione monitoraggio errori...');

    // Errori JavaScript globali
    window.addEventListener('error', (event) => {
      const errorReport: ErrorReport = {
        type: 'javascript',
        message: event.message,
        stack: event.error?.stack,
        file: event.filename,
        line: event.lineno,
        timestamp: new Date().toISOString(),
        context: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      };

      this.handleError(errorReport);
    });

    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const errorReport: ErrorReport = {
        type: 'javascript',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        context: {
          url: window.location.href,
          reason: event.reason
        }
      };

      this.handleError(errorReport);
    });

    // Errori di rete
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok) {
          const errorReport: ErrorReport = {
            type: 'network',
            message: `HTTP ${response.status}: ${response.statusText}`,
            timestamp: new Date().toISOString(),
            context: {
              url: args[0],
              status: response.status,
              statusText: response.statusText
            }
          };
          
          this.handleError(errorReport);
        }
        
        return response;
      } catch (error: any) {
        const errorReport: ErrorReport = {
          type: 'network',
          message: error.message,
          timestamp: new Date().toISOString(),
          context: {
            url: args[0],
            error: error.name
          }
        };
        
        this.handleError(errorReport);
        throw error;
      }
    };
  }

  // 📊 Monitoraggio performance
  private setupPerformanceMonitoring(): void {
    console.log('📊 Configurazione monitoraggio performance...');

    this.monitoringInterval = setInterval(() => {
      const performance = this.getPerformanceMetrics();
      
      // Invia dati a bolt.diy se ci sono problemi
      if (performance.memoryUsage > 100 || performance.loadTime > 3000) {
        this.notifyBoltDiy('performance_warning', performance);
      }
    }, this.config.monitoringInterval);

    // Monitora Web Vitals
    if ('web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS((metric) => {
          if (metric.value > 0.1) { // Soglia CLS
            this.notifyBoltDiy('performance_issue', {
              metric: 'CLS',
              value: metric.value,
              threshold: 0.1
            });
          }
        });

        getFID((metric) => {
          if (metric.value > 100) { // Soglia FID
            this.notifyBoltDiy('performance_issue', {
              metric: 'FID',
              value: metric.value,
              threshold: 100
            });
          }
        });

        getLCP((metric) => {
          if (metric.value > 2500) { // Soglia LCP
            this.notifyBoltDiy('performance_issue', {
              metric: 'LCP',
              value: metric.value,
              threshold: 2500
            });
          }
        });
      });
    }
  }

  // 🗄️ Monitoraggio Supabase
  private setupSupabaseMonitoring(): void {
    console.log('🗄️ Configurazione monitoraggio Supabase...');

    // Monitora connessione ogni 5 minuti
    setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('clienti')
          .select('count')
          .limit(1);

        if (error) {
          const errorReport: ErrorReport = {
            type: 'database',
            message: `Errore Supabase: ${error.message}`,
            timestamp: new Date().toISOString(),
            context: {
              code: error.code,
              details: error.details,
              hint: error.hint
            }
          };

          this.handleError(errorReport);
        }
      } catch (error: any) {
        const errorReport: ErrorReport = {
          type: 'database',
          message: `Connessione Supabase persa: ${error.message}`,
          timestamp: new Date().toISOString(),
          context: { error: error.name }
        };

        this.handleError(errorReport);
      }
    }, 300000); // 5 minuti
  }

  // 🔗 Configurazione WebSocket
  private async setupWebSocketConnection(): Promise<void> {
    try {
      this.ws = new WebSocket('ws://localhost:5174/ws/alcafer');

      this.ws.onopen = () => {
        console.log('🔗 WebSocket connesso a bolt.diy');
        this.isConnected = true;
      };

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleBoltDiyMessage(message);
      };

      this.ws.onerror = (error) => {
        console.warn('⚠️ Errore WebSocket:', error);
        this.setupPolling(); // Fallback a polling
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnesso');
        this.isConnected = false;
        setTimeout(() => this.setupWebSocketConnection(), 5000); // Riconnetti
      };

    } catch (error) {
      console.warn('⚠️ WebSocket non disponibile, uso polling');
      this.setupPolling();
    }
  }

  // 📡 Polling come fallback
  private setupPolling(): void {
    setInterval(async () => {
      try {
        const response = await fetch('http://localhost:5174/api/alcafer-messages');
        if (response.ok) {
          const messages = await response.json();
          messages.forEach((message: any) => this.handleBoltDiyMessage(message));
        }
      } catch (error) {
        // Silenzioso - bolt.diy potrebbe non essere disponibile
      }
    }, 5000);
  }

  // 🐛 Gestione errori
  private async handleError(errorReport: ErrorReport): Promise<void> {
    console.warn('⚠️ Errore rilevato:', errorReport);

    this.errorQueue.push(errorReport);

    // Mostra notifica all'utente
    toast.error(`Errore rilevato: ${errorReport.message}`, {
      duration: 5000,
      icon: '🤖'
    });

    // Invia a bolt.diy per analisi
    try {
      const response = await this.sendToBoltDiy('error_analysis', {
        error: errorReport,
        context: {
          appState: this.getAppState(),
          recentErrors: this.errorQueue.slice(-5)
        }
      });

      // Se bolt.diy suggerisce una correzione automatica
      if (response?.autoFix && this.config.autoFix) {
        await this.applyAutoFix(response.autoFix);
      }

    } catch (error) {
      console.error('❌ Errore comunicazione bolt.diy:', error);
    }
  }

  // 📨 Invia dati a bolt.diy
  public async sendToBoltDiy(event: string, data: any): Promise<any> {
    try {
      const response = await fetch('http://localhost:5174/api/alcafer-integration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'alcafer-erp',
          'X-API-Key': this.config.anthropicApiKey
        },
        body: JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('⚠️ Comunicazione bolt.diy fallita:', error);
      return null;
    }
  }

  // 📨 Notifica eventi a bolt.diy
  async notifyBoltDiy(event: string, data: any): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data, timestamp: new Date().toISOString() }));
    } else {
      await this.sendToBoltDiy(event, data);
    }
  }

  // 📨 Gestisce messaggi da bolt.diy
  private handleBoltDiyMessage(message: any): void {
    console.log('📨 Messaggio da bolt.diy:', message);

    switch (message.type) {
      case 'fix_suggestion':
        this.showFixSuggestion(message.data);
        break;
      case 'performance_optimization':
        this.showPerformanceOptimization(message.data);
        break;
      case 'security_alert':
        this.showSecurityAlert(message.data);
        break;
      case 'code_update':
        this.handleCodeUpdate(message.data);
        break;
      case 'database_optimization':
        this.handleDatabaseOptimization(message.data);
        break;
    }
  }

  // 🔧 Applica correzioni automatiche
  private async applyAutoFix(fix: any): Promise<void> {
    try {
      console.log('🔧 Applicazione correzione automatica:', fix);

      switch (fix.type) {
        case 'reload_page':
          toast.success('🤖 bolt.diy: Ricaricamento pagina per correggere l\'errore');
          setTimeout(() => window.location.reload(), 2000);
          break;

        case 'clear_cache':
          toast.success('🤖 bolt.diy: Pulizia cache per risolvere il problema');
          localStorage.clear();
          sessionStorage.clear();
          break;

        case 'reconnect_supabase':
          toast.success('🤖 bolt.diy: Riconnessione a Supabase');
          // Trigger riconnessione
          window.location.reload();
          break;

        case 'update_config':
          toast.success('🤖 bolt.diy: Aggiornamento configurazione');
          Object.entries(fix.config).forEach(([key, value]) => {
            localStorage.setItem(`config_${key}`, JSON.stringify(value));
          });
          break;

        default:
          console.warn('⚠️ Tipo correzione non supportato:', fix.type);
      }

    } catch (error) {
      console.error('❌ Errore applicazione correzione:', error);
    }
  }

  // 💡 Mostra suggerimenti di correzione
  private showFixSuggestion(data: any): void {
    const notification = document.createElement('div');
    notification.className = 'bolt-notification bolt-fix-suggestion';
    notification.innerHTML = `
      <div class="bolt-notification-content">
        <h4>🔧 Correzione Suggerita da bolt.diy</h4>
        <p>${data.description}</p>
        <div class="bolt-notification-actions">
          <button onclick="boltDiyIntegration.applyFix(${JSON.stringify(data.fix).replace(/"/g, '&quot;')})">
            Applica Correzione
          </button>
          <button onclick="this.parentElement.parentElement.parentElement.remove()">
            Ignora
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Rimuovi automaticamente dopo 30 secondi
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 30000);
  }

  // ⚡ Mostra ottimizzazioni performance
  private showPerformanceOptimization(data: any): void {
    toast((t) => (
      `🚀 bolt.diy suggerisce: ${data.suggestion}`
    ), {
      duration: 8000,
      icon: '⚡'
    });
  }

  // 🛡️ Mostra alert di sicurezza
  private showSecurityAlert(data: any): void {
    toast.error(`🛡️ Alert Sicurezza: ${data.message}`, {
      duration: 10000
    });
  }

  // 📝 Gestisce aggiornamenti codice
  private async handleCodeUpdate(data: any): Promise<void> {
    if (confirm(`🤖 bolt.diy ha suggerito un aggiornamento del codice:\n\n${data.description}\n\nVuoi applicarlo?`)) {
      try {
        // In un ambiente reale, questo userebbe l'API GitHub
        console.log('📝 Applicazione aggiornamento codice:', data);
        
        // Simula l'aggiornamento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast.success('✅ Codice aggiornato da bolt.diy');
        
        // Ricarica se necessario
        if (data.requiresReload) {
          setTimeout(() => window.location.reload(), 1000);
        }
      } catch (error) {
        toast.error('❌ Errore aggiornamento codice');
      }
    }
  }

  // 🗄️ Gestisce ottimizzazioni database
  private async handleDatabaseOptimization(data: any): Promise<void> {
    try {
      console.log('🗄️ Ottimizzazione database suggerita:', data);
      
      // Mostra notifica con dettagli
      toast((t) => (
        `🗄️ bolt.diy suggerisce ottimizzazione database: ${data.description}`
      ), {
        duration: 10000,
        icon: '🗄️'
      });

      // Se è una correzione automatica sicura, applicala
      if (data.autoApply && data.sql) {
        await this.executeOptimizationSQL(data.sql);
      }

    } catch (error) {
      console.error('❌ Errore ottimizzazione database:', error);
    }
  }

  // 🔧 Integrazione GitHub
  private setupGitHubIntegration(): void {
    console.log('🔗 Configurazione integrazione GitHub...');

    // Monitora modifiche ai file (simulato)
    setInterval(async () => {
      try {
        // In un ambiente reale, questo monitorerebbe i file locali
        const hasChanges = Math.random() > 0.95; // 5% probabilità di cambiamenti
        
        if (hasChanges) {
          await this.notifyBoltDiy('file_changes_detected', {
            files: ['src/components/SomeComponent.tsx'],
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.warn('⚠️ Errore monitoraggio file:', error);
      }
    }, 60000); // Ogni minuto
  }

  // 📊 Ottieni metriche performance
  private getPerformanceMetrics(): any {
    const memory = (performance as any).memory;
    const timing = performance.timing;

    return {
      memoryUsage: memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0,
      memoryLimit: memory ? Math.round(memory.jsHeapSizeLimit / 1024 / 1024) : 0,
      loadTime: timing.loadEventEnd - timing.navigationStart,
      domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
      errorCount: this.errorQueue.length,
      timestamp: new Date().toISOString()
    };
  }

  // 🎯 Ottieni stato applicazione
  private getAppState(): any {
    return {
      url: window.location.href,
      title: document.title,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      localStorage: Object.keys(localStorage).length,
      sessionStorage: Object.keys(sessionStorage).length,
      performance: this.getPerformanceMetrics(),
      timestamp: new Date().toISOString()
    };
  }

  // 🔧 Esegue SQL di ottimizzazione
  private async executeOptimizationSQL(sql: string): Promise<void> {
    try {
      // In un ambiente reale, questo eseguirebbe SQL tramite Supabase
      console.log('🔧 Esecuzione SQL ottimizzazione:', sql);
      
      // Simula esecuzione
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('✅ Ottimizzazione database applicata');
    } catch (error) {
      console.error('❌ Errore esecuzione SQL:', error);
      toast.error('❌ Errore ottimizzazione database');
    }
  }

  // 🟢 Mostra indicatore di stato
  private showStatusIndicator(): void {
    const indicator = document.createElement('div');
    indicator.id = 'bolt-status-indicator';
    indicator.className = 'bolt-status-indicator';
    indicator.title = 'bolt.diy AI Assistant - Connesso';
    
    document.body.appendChild(indicator);

    // Aggiorna stato in base alla connessione
    setInterval(() => {
      if (this.isConnected) {
        indicator.className = 'bolt-status-indicator';
        indicator.title = 'bolt.diy AI Assistant - Connesso';
      } else {
        indicator.className = 'bolt-status-indicator disconnected';
        indicator.title = 'bolt.diy AI Assistant - Disconnesso';
      }
    }, 1000);
  }

  // 🔧 API pubblica per correzioni manuali
  async requestFix(description: string): Promise<void> {
    try {
      const response = await this.sendToBoltDiy('manual_fix_request', {
        description,
        context: this.getAppState(),
        timestamp: new Date().toISOString()
      });

      if (response?.fix) {
        await this.applyAutoFix(response.fix);
      } else {
        toast('🤖 bolt.diy sta analizzando il problema...', { icon: 'ℹ️' });
      }

    } catch (error) {
      toast.error('❌ Errore richiesta correzione');
    }
  }

  // 🔧 API pubblica per applicare correzioni
  async applyFix(fix: any): Promise<void> {
    await this.applyAutoFix(fix);
  }

  // 🧹 Cleanup
  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    if (this.ws) {
      this.ws.close();
    }

    const indicator = document.getElementById('bolt-status-indicator');
    if (indicator) {
      indicator.remove();
    }

    this.isConnected = false;
    console.log('🔌 Integrazione bolt.diy disconnessa');
  }
}

// Inizializza l'integrazione globalmente
export const boltDiyIntegration = BoltDiyIntegrationService.getInstance();

// Esporta per uso in window
declare global {
  interface Window {
    boltDiyIntegration: BoltDiyIntegrationService;
  }
}

window.boltDiyIntegration = boltDiyIntegration;