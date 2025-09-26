// 🔗 INTEGRAZIONI GRATUITE - Zapier + IFTTT + Webhooks + APIs
export interface Integration {
  name: string;
  type: 'webhook' | 'api' | 'automation';
  enabled: boolean;
  config: any;
}

export interface WebhookEvent {
  event: string;
  data: any;
  timestamp: string;
}

export class FreeIntegrationsService {
  private static instance: FreeIntegrationsService;
  private integrations: Map<string, Integration> = new Map();
  private webhookQueue: WebhookEvent[] = [];

  private constructor() {
    this.initializeIntegrations();
  }

  public static getInstance(): FreeIntegrationsService {
    if (!FreeIntegrationsService.instance) {
      FreeIntegrationsService.instance = new FreeIntegrationsService();
    }
    return FreeIntegrationsService.instance;
  }

  // 🔧 INIZIALIZZAZIONE INTEGRAZIONI
  private initializeIntegrations(): void {
    // Zapier (gratuito - 100 task/mese)
    this.integrations.set('zapier', {
      name: 'Zapier',
      type: 'webhook',
      enabled: true,
      config: {
        webhookUrl: 'https://hooks.zapier.com/hooks/catch/YOUR_ZAPIER_WEBHOOK',
        events: ['preventivo_created', 'lavoro_completed', 'cliente_added']
      }
    });

    // IFTTT (gratuito - 3 applet)
    this.integrations.set('ifttt', {
      name: 'IFTTT',
      type: 'webhook',
      enabled: true,
      config: {
        webhookUrl: 'https://maker.ifttt.com/trigger/alcafer_event/with/key/YOUR_IFTTT_KEY',
        events: ['backup_completed', 'tax_reminder', 'price_update']
      }
    });

    // Google Sheets (gratuito)
    this.integrations.set('google_sheets', {
      name: 'Google Sheets',
      type: 'api',
      enabled: true,
      config: {
        spreadsheetId: 'YOUR_SPREADSHEET_ID',
        apiKey: 'YOUR_GOOGLE_API_KEY',
        sheetName: 'Alcafer_Data'
      }
    });

    // Slack (gratuito)
    this.integrations.set('slack', {
      name: 'Slack',
      type: 'webhook',
      enabled: true,
      config: {
        webhookUrl: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
        channel: '#alcafer-erp'
      }
    });

    // Microsoft Teams (gratuito)
    this.integrations.set('teams', {
      name: 'Microsoft Teams',
      type: 'webhook',
      enabled: true,
      config: {
        webhookUrl: 'https://outlook.office.com/webhook/YOUR_TEAMS_WEBHOOK'
      }
    });
  }

  // 🔗 ZAPIER INTEGRATION (GRATUITO)
  async sendToZapier(event: string, data: any): Promise<boolean> {
    try {
      const zapier = this.integrations.get('zapier');
      if (!zapier?.enabled || !zapier.config.events.includes(event)) return false;

      const payload = {
        event,
        data,
        timestamp: new Date().toISOString(),
        source: 'Alcafer & Gabifer ERP'
      };

      const response = await fetch(zapier.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('✅ Evento inviato a Zapier:', event);
        return true;
      }

      throw new Error('Zapier webhook failed');

    } catch (error) {
      console.warn('⚠️ Zapier non disponibile:', error);
      return false;
    }
  }

  // 🤖 IFTTT INTEGRATION (GRATUITO)
  async sendToIFTTT(event: string, value1?: string, value2?: string, value3?: string): Promise<boolean> {
    try {
      const ifttt = this.integrations.get('ifttt');
      if (!ifttt?.enabled) return false;

      const payload = {
        value1: value1 || '',
        value2: value2 || '',
        value3: value3 || ''
      };

      const response = await fetch(ifttt.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('✅ Evento inviato a IFTTT:', event);
        return true;
      }

      throw new Error('IFTTT webhook failed');

    } catch (error) {
      console.warn('⚠️ IFTTT non disponibile:', error);
      return false;
    }
  }

  // 📊 GOOGLE SHEETS INTEGRATION (GRATUITO)
  async syncToGoogleSheets(data: any[], sheetName?: string): Promise<boolean> {
    try {
      const sheets = this.integrations.get('google_sheets');
      if (!sheets?.enabled) return false;

      const targetSheet = sheetName || sheets.config.sheetName;
      
      // Google Sheets API v4 (gratuita)
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheets.config.spreadsheetId}/values/${targetSheet}:append?valueInputOption=RAW&key=${sheets.config.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            values: data
          })
        }
      );

      if (response.ok) {
        console.log('✅ Dati sincronizzati con Google Sheets');
        return true;
      }

      throw new Error('Google Sheets sync failed');

    } catch (error) {
      console.warn('⚠️ Google Sheets non disponibile:', error);
      return false;
    }
  }

  // 💬 SLACK INTEGRATION (GRATUITO)
  async sendToSlack(message: string, channel?: string): Promise<boolean> {
    try {
      const slack = this.integrations.get('slack');
      if (!slack?.enabled) return false;

      const payload = {
        text: message,
        channel: channel || slack.config.channel,
        username: 'Alcafer ERP Bot',
        icon_emoji: ':factory:'
      };

      const response = await fetch(slack.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('✅ Messaggio inviato a Slack');
        return true;
      }

      throw new Error('Slack webhook failed');

    } catch (error) {
      console.warn('⚠️ Slack non disponibile:', error);
      return false;
    }
  }

  // 👥 MICROSOFT TEAMS INTEGRATION (GRATUITO)
  async sendToTeams(title: string, message: string, color?: string): Promise<boolean> {
    try {
      const teams = this.integrations.get('teams');
      if (!teams?.enabled) return false;

      const payload = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": color || "0076D7",
        "summary": title,
        "sections": [{
          "activityTitle": "🏭 Alcafer & Gabifer ERP",
          "activitySubtitle": title,
          "text": message,
          "markdown": true
        }]
      };

      const response = await fetch(teams.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('✅ Messaggio inviato a Teams');
        return true;
      }

      throw new Error('Teams webhook failed');

    } catch (error) {
      console.warn('⚠️ Teams non disponibile:', error);
      return false;
    }
  }

  // 🔄 AUTOMAZIONI BUSINESS
  async triggerBusinessAutomation(event: string, data: any): Promise<void> {
    console.log(`🔄 Triggering automation: ${event}`);

    switch (event) {
      case 'preventivo_created':
        await this.handlePreventivoCreated(data);
        break;
      
      case 'lavoro_completed':
        await this.handleLavoroCompleted(data);
        break;
      
      case 'cliente_added':
        await this.handleClienteAdded(data);
        break;
      
      case 'price_update':
        await this.handlePriceUpdate(data);
        break;
      
      case 'tax_reminder':
        await this.handleTaxReminder(data);
        break;
      
      case 'backup_completed':
        await this.handleBackupCompleted(data);
        break;
    }
  }

  // 📋 GESTORI EVENTI SPECIFICI
  private async handlePreventivoCreated(data: any): Promise<void> {
    const message = `📋 **Nuovo Preventivo Creato**

Cliente: ${data.cliente_nome}
Numero: ${data.numero_preventivo}
Importo: €${data.importo?.toLocaleString('it-IT') || 'N/A'}
Ditta: ${data.ditta?.toUpperCase()}

Creato: ${new Date().toLocaleString('it-IT')}`;

    await Promise.all([
      this.sendToZapier('preventivo_created', data),
      this.sendToSlack(message),
      this.sendToTeams('Nuovo Preventivo', message, '0078D4'),
      this.syncToGoogleSheets([[
        new Date().toISOString(),
        'Preventivo Creato',
        data.numero_preventivo,
        data.cliente_nome,
        data.importo || 0,
        data.ditta
      ]], 'Preventivi')
    ]);
  }

  private async handleLavoroCompleted(data: any): Promise<void> {
    const message = `✅ **Lavoro Completato**

Numero: ${data.numero_lavoro}
Descrizione: ${data.descrizione}
Importo: €${data.importo_totale?.toLocaleString('it-IT')}
Durata: ${data.ore_lavoro || 'N/A'} ore

Completato: ${new Date().toLocaleString('it-IT')}`;

    await Promise.all([
      this.sendToZapier('lavoro_completed', data),
      this.sendToSlack(message),
      this.sendToTeams('Lavoro Completato', message, '00FF00'),
      this.sendToIFTTT('lavoro_completed', data.numero_lavoro, data.importo_totale?.toString(), data.ditta)
    ]);
  }

  private async handleClienteAdded(data: any): Promise<void> {
    const message = `👤 **Nuovo Cliente Aggiunto**

Nome: ${data.nome}
Email: ${data.email}
Telefono: ${data.telefono || 'N/A'}

Aggiunto: ${new Date().toLocaleString('it-IT')}`;

    await Promise.all([
      this.sendToZapier('cliente_added', data),
      this.sendToSlack(message),
      this.syncToGoogleSheets([[
        new Date().toISOString(),
        'Cliente Aggiunto',
        data.nome,
        data.email,
        data.telefono || '',
        data.indirizzo || ''
      ]], 'Clienti')
    ]);
  }

  private async handlePriceUpdate(data: any): Promise<void> {
    const message = `📊 **Aggiornamento Prezzi**

Materiali aggiornati: ${data.updates?.length || 0}
${data.updates?.slice(0, 3).map((u: any) => 
  `• ${u.material}: €${u.oldPrice.toFixed(3)} → €${u.newPrice.toFixed(3)}`
).join('\n') || ''}

Aggiornato: ${new Date().toLocaleString('it-IT')}`;

    await Promise.all([
      this.sendToIFTTT('price_update', data.updates?.length?.toString(), 'Prezzi Materiali', 'Aggiornamento'),
      this.sendToSlack(message),
      this.sendToTeams('Aggiornamento Prezzi', message, 'FFA500')
    ]);
  }

  private async handleTaxReminder(data: any): Promise<void> {
    const message = `🚨 **Promemoria Fiscale**

Ditta: ${data.ditta?.toUpperCase()}
Importo: €${data.importo?.toLocaleString('it-IT')}
Scadenza: ${data.scadenza}

⚠️ Azione richiesta!`;

    await Promise.all([
      this.sendToIFTTT('tax_reminder', data.ditta, data.importo?.toString(), data.scadenza),
      this.sendToSlack(message),
      this.sendToTeams('Promemoria Fiscale', message, 'FF0000')
    ]);
  }

  private async handleBackupCompleted(data: any): Promise<void> {
    const message = `💾 **Backup Completato**

Record: ${data.totalRecords}
Dimensione: ${data.size}
Destinazioni: ${data.destinations?.join(', ')}

Completato: ${new Date().toLocaleString('it-IT')}`;

    await Promise.all([
      this.sendToIFTTT('backup_completed', data.totalRecords?.toString(), data.size, 'Success'),
      this.sendToSlack(message)
    ]);
  }

  // 🔧 GESTIONE INTEGRAZIONI
  async enableIntegration(name: string): Promise<boolean> {
    const integration = this.integrations.get(name);
    if (integration) {
      integration.enabled = true;
      console.log(`✅ Integrazione ${name} abilitata`);
      return true;
    }
    return false;
  }

  async disableIntegration(name: string): Promise<boolean> {
    const integration = this.integrations.get(name);
    if (integration) {
      integration.enabled = false;
      console.log(`❌ Integrazione ${name} disabilitata`);
      return true;
    }
    return false;
  }

  getIntegrationStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    this.integrations.forEach((integration, name) => {
      status[name] = integration.enabled;
    });
    return status;
  }

  // 🧪 TEST INTEGRAZIONI
  async testAllIntegrations(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};

    results.zapier = await this.sendToZapier('test_event', { message: 'Test Zapier integration' });
    results.ifttt = await this.sendToIFTTT('test_event', 'Test', 'IFTTT', 'Integration');
    results.slack = await this.sendToSlack('🧪 Test integrazione Slack da Alcafer ERP');
    results.teams = await this.sendToTeams('Test Teams', '🧪 Test integrazione Microsoft Teams da Alcafer ERP', '00FF00');
    results.google_sheets = await this.syncToGoogleSheets([['Test', new Date().toISOString(), 'Integration Test']], 'Test');

    console.log('🧪 Risultati test integrazioni:', results);
    return results;
  }
}

export const freeIntegrationsService = FreeIntegrationsService.getInstance();
