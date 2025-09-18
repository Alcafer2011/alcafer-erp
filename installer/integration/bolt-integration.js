// Integrazione bolt.diy con Alcafer ERP
// Questo modulo gestisce la comunicazione tra i due sistemi

class BoltDiyIntegration {
  constructor() {
    this.boltUrl = 'http://localhost:5174';
    this.alcaferUrl = 'http://localhost:5173';
    this.isConnected = false;
    this.monitoringInterval = null;
    this.errorQueue = [];
  }

  // Inizializza l'integrazione
  async initialize() {
    console.log('🔗 Inizializzazione integrazione bolt.diy...');
    
    try {
      // Attendi che bolt.diy sia disponibile
      await this.waitForBoltDiy();
      
      // Configura il monitoraggio
      this.setupMonitoring();
      
      // Configura la comunicazione bidirezionale
      this.setupCommunication();
      
      // Registra event listeners
      this.setupEventListeners();
      
      this.isConnected = true;
      console.log('✅ Integrazione bolt.diy attiva');
      
      // Notifica a bolt.diy che Alcafer ERP è pronto
      this.notifyBoltDiy('alcafer_ready', {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        features: ['supabase', 'github', 'ai-monitoring']
      });
      
    } catch (error) {
      console.error('❌ Errore integrazione bolt.diy:', error);
    }
  }

  // Attende che bolt.diy sia disponibile
  async waitForBoltDiy(maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`${this.boltUrl}/api/health`);
        if (response.ok) {
          console.log('✅ bolt.diy disponibile');
          return true;
        }
      } catch (error) {
        console.log(`⏳ Attendo bolt.diy... (${i + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    throw new Error('bolt.diy non disponibile dopo 60 secondi');
  }

  // Configura il monitoraggio automatico
  setupMonitoring() {
    console.log('👁️ Configurazione monitoraggio automatico...');
    
    // Monitora errori JavaScript
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Monitora errori di rete
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'promise_rejection',
        message: event.reason?.message || 'Promise rejection',
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Monitora performance
    this.monitoringInterval = setInterval(() => {
      this.checkPerformance();
    }, 30000); // Ogni 30 secondi

    // Monitora connessione Supabase
    this.monitorSupabaseConnection();
  }

  // Gestisce gli errori rilevati
  async handleError(error) {
    console.warn('⚠️ Errore rilevato:', error);
    
    this.errorQueue.push(error);
    
    // Invia a bolt.diy per analisi e correzione
    try {
      await this.sendToBoltDiy('error_detected', {
        error,
        context: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          appState: this.getAppState()
        }
      });
    } catch (err) {
      console.error('❌ Errore invio a bolt.diy:', err);
    }
  }

  // Monitora le performance
  checkPerformance() {
    const performance = {
      memory: this.getMemoryUsage(),
      timing: this.getPageTiming(),
      errors: this.errorQueue.length,
      timestamp: new Date().toISOString()
    };

    // Invia dati performance a bolt.diy
    this.sendToBoltDiy('performance_data', performance);

    // Pulisci la coda errori se troppo piena
    if (this.errorQueue.length > 50) {
      this.errorQueue = this.errorQueue.slice(-25);
    }
  }

  // Monitora connessione Supabase
  async monitorSupabaseConnection() {
    try {
      // Testa la connessione ogni 5 minuti
      setInterval(async () => {
        try {
          const response = await fetch('/api/health/supabase');
          if (!response.ok) {
            this.handleError({
              type: 'supabase_connection',
              message: 'Connessione Supabase persa',
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          this.handleError({
            type: 'supabase_connection',
            message: 'Errore connessione Supabase',
            details: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }, 300000); // 5 minuti
    } catch (error) {
      console.error('❌ Errore setup monitoraggio Supabase:', error);
    }
  }

  // Invia dati a bolt.diy
  async sendToBoltDiy(event, data) {
    try {
      const response = await fetch(`${this.boltUrl}/api/alcafer-integration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'alcafer-erp'
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

      const result = await response.json();
      
      // Se bolt.diy ha una correzione, applicala
      if (result.fix) {
        await this.applyFix(result.fix);
      }

      return result;
    } catch (error) {
      console.warn('⚠️ Comunicazione bolt.diy fallita:', error);
    }
  }

  // Notifica eventi a bolt.diy
  async notifyBoltDiy(event, data) {
    return this.sendToBoltDiy(event, data);
  }

  // Applica correzioni suggerite da bolt.diy
  async applyFix(fix) {
    console.log('🔧 Applicazione correzione bolt.diy:', fix);
    
    try {
      switch (fix.type) {
        case 'code_update':
          await this.updateCode(fix.file, fix.content);
          break;
        case 'config_update':
          await this.updateConfig(fix.config);
          break;
        case 'dependency_update':
          await this.updateDependencies(fix.dependencies);
          break;
        case 'database_fix':
          await this.fixDatabase(fix.sql);
          break;
        default:
          console.warn('⚠️ Tipo correzione non supportato:', fix.type);
      }
    } catch (error) {
      console.error('❌ Errore applicazione correzione:', error);
    }
  }

  // Aggiorna codice tramite GitHub API
  async updateCode(filePath, content) {
    try {
      // In un ambiente reale, questo userebbe l'API GitHub
      console.log(`📝 Aggiornamento file: ${filePath}`);
      
      // Simula l'aggiornamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ricarica la pagina se necessario
      if (filePath.includes('.tsx') || filePath.includes('.ts')) {
        console.log('🔄 Ricaricamento applicazione...');
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ Errore aggiornamento codice:', error);
    }
  }

  // Aggiorna configurazione
  async updateConfig(config) {
    try {
      console.log('⚙️ Aggiornamento configurazione:', config);
      
      // Applica le modifiche alla configurazione
      Object.entries(config).forEach(([key, value]) => {
        localStorage.setItem(`config_${key}`, JSON.stringify(value));
      });
      
    } catch (error) {
      console.error('❌ Errore aggiornamento config:', error);
    }
  }

  // Aggiorna dipendenze
  async updateDependencies(dependencies) {
    try {
      console.log('📦 Aggiornamento dipendenze:', dependencies);
      
      // In un ambiente reale, questo triggererebbe npm install
      this.notifyBoltDiy('dependency_update_needed', { dependencies });
      
    } catch (error) {
      console.error('❌ Errore aggiornamento dipendenze:', error);
    }
  }

  // Corregge problemi database
  async fixDatabase(sql) {
    try {
      console.log('🗄️ Correzione database:', sql);
      
      // Invia SQL a bolt.diy per esecuzione sicura
      await this.sendToBoltDiy('execute_sql', { sql });
      
    } catch (error) {
      console.error('❌ Errore correzione database:', error);
    }
  }

  // Configura comunicazione bidirezionale
  setupCommunication() {
    // WebSocket per comunicazione real-time
    try {
      const ws = new WebSocket(`ws://localhost:5174/ws/alcafer`);
      
      ws.onopen = () => {
        console.log('🔗 WebSocket connesso a bolt.diy');
      };
      
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleBoltDiyMessage(message);
      };
      
      ws.onerror = (error) => {
        console.warn('⚠️ Errore WebSocket:', error);
      };
      
      this.ws = ws;
    } catch (error) {
      console.warn('⚠️ WebSocket non disponibile, uso polling');
      this.setupPolling();
    }
  }

  // Setup polling come fallback
  setupPolling() {
    setInterval(async () => {
      try {
        const response = await fetch(`${this.boltUrl}/api/alcafer-messages`);
        if (response.ok) {
          const messages = await response.json();
          messages.forEach(message => this.handleBoltDiyMessage(message));
        }
      } catch (error) {
        // Silenzioso - bolt.diy potrebbe non essere disponibile
      }
    }, 5000); // Ogni 5 secondi
  }

  // Gestisce messaggi da bolt.diy
  handleBoltDiyMessage(message) {
    console.log('📨 Messaggio da bolt.diy:', message);
    
    switch (message.type) {
      case 'fix_suggestion':
        this.showFixSuggestion(message.data);
        break;
      case 'performance_warning':
        this.showPerformanceWarning(message.data);
        break;
      case 'security_alert':
        this.showSecurityAlert(message.data);
        break;
      case 'update_available':
        this.showUpdateNotification(message.data);
        break;
    }
  }

  // Mostra suggerimenti di correzione
  showFixSuggestion(data) {
    const notification = document.createElement('div');
    notification.className = 'bolt-notification bolt-fix-suggestion';
    notification.innerHTML = `
      <div class="bolt-notification-content">
        <h4>🔧 Correzione Suggerita da bolt.diy</h4>
        <p>${data.description}</p>
        <div class="bolt-notification-actions">
          <button onclick="boltIntegration.applyFix(${JSON.stringify(data.fix).replace(/"/g, '&quot;')})">
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

  // Utility functions
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }

  getPageTiming() {
    const timing = performance.timing;
    return {
      loadTime: timing.loadEventEnd - timing.navigationStart,
      domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
      firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
    };
  }

  getAppState() {
    return {
      url: window.location.href,
      title: document.title,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      localStorage: Object.keys(localStorage).length,
      sessionStorage: Object.keys(sessionStorage).length
    };
  }

  setupEventListeners() {
    // Monitora navigazione
    window.addEventListener('popstate', () => {
      this.notifyBoltDiy('navigation', {
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
    });

    // Monitora form submissions
    document.addEventListener('submit', (event) => {
      this.notifyBoltDiy('form_submit', {
        form: event.target.id || event.target.className,
        timestamp: new Date().toISOString()
      });
    });

    // Monitora errori di rete
    window.addEventListener('online', () => {
      this.notifyBoltDiy('network_online', { timestamp: new Date().toISOString() });
    });

    window.addEventListener('offline', () => {
      this.notifyBoltDiy('network_offline', { timestamp: new Date().toISOString() });
    });
  }

  // Cleanup
  destroy() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    if (this.ws) {
      this.ws.close();
    }
    
    this.isConnected = false;
    console.log('🔌 Integrazione bolt.diy disconnessa');
  }
}

// Inizializza l'integrazione quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  window.boltIntegration = new BoltDiyIntegration();
  window.boltIntegration.initialize();
});

// Cleanup quando la pagina viene chiusa
window.addEventListener('beforeunload', () => {
  if (window.boltIntegration) {
    window.boltIntegration.destroy();
  }
});

// Esporta per uso globale
window.BoltDiyIntegration = BoltDiyIntegration;