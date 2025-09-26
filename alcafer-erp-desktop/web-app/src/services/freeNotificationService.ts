// 🔔 NOTIFICHE GRATUITE - EmailJS + Telegram + Discord + WhatsApp Web
export interface NotificationChannel {
  type: 'email' | 'telegram' | 'discord' | 'whatsapp' | 'browser';
  enabled: boolean;
  config: any;
}

export class FreeNotificationService {
  private static instance: FreeNotificationService;
  private channels: Map<string, NotificationChannel> = new Map();

  private constructor() {
    this.initializeChannels();
  }

  public static getInstance(): FreeNotificationService {
    if (!FreeNotificationService.instance) {
      FreeNotificationService.instance = new FreeNotificationService();
    }
    return FreeNotificationService.instance;
  }

  // 🔧 INIZIALIZZAZIONE CANALI
  private initializeChannels(): void {
    // EmailJS (gratuito - 200 email/mese)
    this.channels.set('email', {
      type: 'email',
      enabled: true,
      config: {
        serviceId: 'service_alcafer',
        templateId: 'template_notification',
        publicKey: 'YOUR_EMAILJS_PUBLIC_KEY'
      }
    });

    // Telegram Bot (gratuito)
    this.channels.set('telegram', {
      type: 'telegram',
      enabled: true,
      config: {
        botToken: 'YOUR_TELEGRAM_BOT_TOKEN',
        chatId: 'YOUR_CHAT_ID'
      }
    });

    // Discord Webhook (gratuito)
    this.channels.set('discord', {
      type: 'discord',
      enabled: true,
      config: {
        webhookUrl: 'YOUR_DISCORD_WEBHOOK_URL'
      }
    });

    // Browser Notifications (gratuito)
    this.channels.set('browser', {
      type: 'browser',
      enabled: true,
      config: {}
    });
  }

  // 📧 EMAILJS (GRATUITO)
  async sendEmailNotification(to: string, subject: string, message: string): Promise<boolean> {
    try {
      const emailChannel = this.channels.get('email');
      if (!emailChannel?.enabled) return false;

      // EmailJS - 200 email gratuite al mese
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: emailChannel.config.serviceId,
          template_id: emailChannel.config.templateId,
          user_id: emailChannel.config.publicKey,
          template_params: {
            to_email: to,
            subject: subject,
            message: message,
            from_name: 'Alcafer & Gabifer ERP'
          }
        })
      });

      if (response.ok) {
        console.log('✅ Email inviata via EmailJS');
        return true;
      }

      throw new Error('EmailJS failed');

    } catch (error) {
      console.warn('⚠️ EmailJS non disponibile, uso email locale');
      return this.sendLocalEmail(to, subject, message);
    }
  }

  // 🤖 TELEGRAM BOT (GRATUITO)
  async sendTelegramNotification(message: string): Promise<boolean> {
    try {
      const telegramChannel = this.channels.get('telegram');
      if (!telegramChannel?.enabled) return false;

      const response = await fetch(`https://api.telegram.org/bot${telegramChannel.config.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChannel.config.chatId,
          text: `🏭 *Alcafer & Gabifer ERP*\n\n${message}`,
          parse_mode: 'Markdown'
        })
      });

      if (response.ok) {
        console.log('✅ Messaggio Telegram inviato');
        return true;
      }

      throw new Error('Telegram failed');

    } catch (error) {
      console.warn('⚠️ Telegram non disponibile');
      return false;
    }
  }

  // 💬 DISCORD WEBHOOK (GRATUITO)
  async sendDiscordNotification(message: string, color: number = 0x0099ff): Promise<boolean> {
    try {
      const discordChannel = this.channels.get('discord');
      if (!discordChannel?.enabled) return false;

      const embed = {
        title: '🏭 Alcafer & Gabifer ERP',
        description: message,
        color: color,
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Sistema di Gestione Aziendale'
        }
      };

      const response = await fetch(discordChannel.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
      });

      if (response.ok) {
        console.log('✅ Messaggio Discord inviato');
        return true;
      }

      throw new Error('Discord failed');

    } catch (error) {
      console.warn('⚠️ Discord non disponibile');
      return false;
    }
  }

  // 🌐 BROWSER NOTIFICATIONS (GRATUITO)
  async sendBrowserNotification(title: string, message: string, icon?: string): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        console.warn('⚠️ Browser notifications non supportate');
        return false;
      }

      let permission = Notification.permission;

      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: icon || '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'alcafer-erp',
          requireInteraction: true
        });

        console.log('✅ Notifica browser inviata');
        return true;
      }

      return false;

    } catch (error) {
      console.warn('⚠️ Errore notifica browser:', error);
      return false;
    }
  }

  // 📱 WHATSAPP WEB API (GRATUITO)
  async sendWhatsAppNotification(phone: string, message: string): Promise<boolean> {
    try {
      // WhatsApp Web API gratuita (limitata)
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
      
      // Apre WhatsApp Web in una nuova finestra
      window.open(whatsappUrl, '_blank');
      
      console.log('✅ WhatsApp Web aperto');
      return true;

    } catch (error) {
      console.warn('⚠️ WhatsApp Web non disponibile');
      return false;
    }
  }

  // 🔔 NOTIFICA MULTI-CANALE
  async sendMultiChannelNotification(notification: {
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
    channels?: string[];
  }): Promise<void> {
    const { title, message, priority, channels } = notification;
    
    // Determina canali in base alla priorità
    const targetChannels = channels || this.getChannelsByPriority(priority);
    
    const promises = targetChannels.map(async (channel) => {
      switch (channel) {
        case 'email':
          return this.sendEmailNotification('admin@alcafer.com', title, message);
        case 'telegram':
          return this.sendTelegramNotification(`${title}\n\n${message}`);
        case 'discord':
          return this.sendDiscordNotification(`**${title}**\n${message}`, this.getColorByPriority(priority));
        case 'browser':
          return this.sendBrowserNotification(title, message);
        case 'whatsapp':
          return this.sendWhatsAppNotification('393391231150', `${title}\n\n${message}`);
        default:
          return false;
      }
    });

    await Promise.all(promises);
  }

  // 🚨 NOTIFICHE BUSINESS SPECIFICHE
  async sendTaxReminder(ditta: string, importo: number, scadenza: string): Promise<void> {
    const message = `🚨 PROMEMORIA FISCALE

Ditta: ${ditta.toUpperCase()}
Importo: €${importo.toLocaleString('it-IT')}
Scadenza: ${scadenza}

⚠️ Ricordati di mettere da parte l'importo!`;

    await this.sendMultiChannelNotification({
      title: `Scadenza Fiscale ${ditta.toUpperCase()}`,
      message,
      priority: 'high',
      channels: ['telegram', 'discord', 'browser']
    });
  }

  async sendPriceUpdateNotification(updates: Array<{ material: string; oldPrice: number; newPrice: number }>): Promise<void> {
    const message = `📊 AGGIORNAMENTO PREZZI MATERIALI

${updates.map(u => 
  `${u.material}: €${u.oldPrice.toFixed(3)} → €${u.newPrice.toFixed(3)} ${u.newPrice > u.oldPrice ? '📈' : '📉'}`
).join('\n')}

Controlla l'app per i dettagli completi.`;

    await this.sendMultiChannelNotification({
      title: 'Aggiornamento Prezzi Materiali',
      message,
      priority: 'medium',
      channels: ['telegram', 'discord']
    });
  }

  async sendBackupNotification(success: boolean, details?: string): Promise<void> {
    const status = success ? '✅ COMPLETATO' : '❌ FALLITO';
    const message = `💾 BACKUP AUTOMATICO ${status}

Data: ${new Date().toLocaleString('it-IT')}
${details ? `Dettagli: ${details}` : ''}

${success ? '✅ Tutti i dati sono stati salvati.' : '⚠️ Controlla il sistema!'}`;

    await this.sendMultiChannelNotification({
      title: `Backup ${success ? 'Completato' : 'Fallito'}`,
      message,
      priority: success ? 'low' : 'high',
      channels: success ? ['telegram'] : ['telegram', 'discord', 'browser']
    });
  }

  // 📧 EMAIL LOCALE (FALLBACK)
  private async sendLocalEmail(to: string, subject: string, message: string): Promise<boolean> {
    try {
      // Crea un mailto link come fallback
      const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      
      // Salva in localStorage per review
      const emails = JSON.parse(localStorage.getItem('pending_emails') || '[]');
      emails.push({
        to,
        subject,
        message,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('pending_emails', JSON.stringify(emails));

      console.log('📧 Email salvata localmente:', { to, subject });
      return true;

    } catch (error) {
      console.error('❌ Errore email locale:', error);
      return false;
    }
  }

  // 🔧 UTILITY METHODS
  private getChannelsByPriority(priority: string): string[] {
    switch (priority) {
      case 'high':
        return ['telegram', 'discord', 'browser', 'email'];
      case 'medium':
        return ['telegram', 'discord'];
      case 'low':
        return ['telegram'];
      default:
        return ['browser'];
    }
  }

  private getColorByPriority(priority: string): number {
    switch (priority) {
      case 'high': return 0xff0000; // Rosso
      case 'medium': return 0xffa500; // Arancione
      case 'low': return 0x00ff00; // Verde
      default: return 0x0099ff; // Blu
    }
  }

  // 🧪 TEST NOTIFICHE
  async testAllChannels(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};

    results.email = await this.sendEmailNotification(
      'test@alcafer.com',
      '🧪 Test Email Alcafer ERP',
      'Questo è un test delle notifiche email.'
    );

    results.telegram = await this.sendTelegramNotification(
      '🧪 Test Telegram\n\nLe notifiche Telegram funzionano correttamente!'
    );

    results.discord = await this.sendDiscordNotification(
      '🧪 **Test Discord**\n\nLe notifiche Discord funzionano correttamente!',
      0x00ff00
    );

    results.browser = await this.sendBrowserNotification(
      '🧪 Test Browser',
      'Le notifiche browser funzionano correttamente!'
    );

    console.log('🧪 Risultati test notifiche:', results);
    return results;
  }
}

export const freeNotificationService = FreeNotificationService.getInstance();
