export interface EmailNotification {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export interface WhatsAppNotification {
  to: string;
  message: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private brevoApiKey: string;
  private twilioAccountSid: string;
  private twilioAuthToken: string;
  private twilioPhoneNumber: string;

  private constructor() {
    this.brevoApiKey = import.meta.env.VITE_BREVO_API_KEY as string;
    this.twilioAccountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID as string;
    this.twilioAuthToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN as string;
    this.twilioPhoneNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER as string;

    if (!this.brevoApiKey) {
      console.warn('Brevo non configurato. Le notifiche email potrebbero non funzionare.');
    }

    if (!this.twilioAccountSid || !this.twilioAuthToken || !this.twilioPhoneNumber) {
      console.warn('Twilio non configurato. Le notifiche WhatsApp potrebbero non funzionare.');
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async sendEmail(notification: EmailNotification): Promise<boolean> {
    if (!this.brevoApiKey) {
      console.warn('Brevo non configurato, email non inviata');
      return false;
    }

    try {
      // In a real implementation, this would use fetch or axios
      console.log('Would send email:', notification);
      return true;
    } catch (error) {
      console.error('Errore invio email:', error);
      return false;
    }
  }

  async sendWhatsApp(notification: WhatsAppNotification): Promise<boolean> {
    if (!this.twilioAccountSid || !this.twilioAuthToken || !this.twilioPhoneNumber) {
      console.warn('Twilio non configurato, WhatsApp non inviato');
      return false;
    }

    try {
      // In a real implementation, this would use fetch or axios
      console.log('Would send WhatsApp:', notification);
      return true;
    } catch (error) {
      console.error('Errore invio WhatsApp:', error);
      return false;
    }
  }

  async sendTaxReminder(ditta: string, importo: number, scadenza: string): Promise<void> {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL as string;
    const adminPhone = import.meta.env.VITE_ADMIN_PHONE as string;

    const emailContent = `
      <h2>🚨 Promemoria Scadenza Fiscale</h2>
      <p><strong>Ditta:</strong> ${ditta.toUpperCase()}</p>
      <p><strong>Importo da versare:</strong> €${importo.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
      <p><strong>Scadenza:</strong> ${scadenza}</p>
      <p>Ricordati di mettere da parte l'importo necessario.</p>
      <hr>
      <p><small>Messaggio automatico da Alcafer & Gabifer ERP</small></p>
    `;

    const whatsappMessage = `🚨 PROMEMORIA FISCALE\n\nDitta: ${ditta.toUpperCase()}\nImporto: €${importo.toLocaleString('it-IT')}\nScadenza: ${scadenza}\n\nMetti da parte l'importo!\n\n- Alcafer & Gabifer ERP`;

    await Promise.all([
      this.sendEmail({
        to: adminEmail,
        subject: `🚨 Scadenza Fiscale ${ditta.toUpperCase()} - €${importo.toLocaleString('it-IT')}`,
        htmlContent: emailContent
      }),
      this.sendWhatsApp({
        to: adminPhone,
        message: whatsappMessage
      })
    ]);
  }

  async sendPriceUpdateNotification(updates: Array<{ material: string; oldPrice: number; newPrice: number }>): Promise<void> {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL as string;
    const adminPhone = import.meta.env.VITE_ADMIN_PHONE as string;

    const emailContent = `
      <h2>📊 Aggiornamento Prezzi Materiali</h2>
      <p>I seguenti prezzi sono stati aggiornati automaticamente:</p>
      <ul>
        ${updates.map(update => `
          <li>
            <strong>${update.material}:</strong> 
            €${update.oldPrice.toFixed(3)}/kg → €${update.newPrice.toFixed(3)}/kg
            ${update.newPrice > update.oldPrice ? '📈 (+' + ((update.newPrice - update.oldPrice) / update.oldPrice * 100).toFixed(1) + '%)' : '📉 (' + ((update.newPrice - update.oldPrice) / update.oldPrice * 100).toFixed(1) + '%)'}
          </li>
        `).join('')}
      </ul>
      <p>Controlla i prezzi nella sezione Materiali Metallici se necessario.</p>
      <hr>
      <p><small>Aggiornamento automatico da Alcafer & Gabifer ERP</small></p>
    `;

    const whatsappMessage = `📊 AGGIORNAMENTO PREZZI\n\n${updates.map(u => `${u.material}: €${u.oldPrice.toFixed(3)} → €${u.newPrice.toFixed(3)}`).join('\n')}\n\nControlla l'app per dettagli.\n\n- Alcafer & Gabifer ERP`;

    await Promise.all([
      this.sendEmail({
        to: adminEmail,
        subject: '📊 Aggiornamento Automatico Prezzi Materiali',
        htmlContent: emailContent
      }),
      this.sendWhatsApp({
        to: adminPhone,
        message: whatsappMessage
      })
    ]);
  }

  async sendBackupNotification(success: boolean, details?: string): Promise<void> {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL as string;
    
    const status = success ? '✅ COMPLETATO' : '❌ FALLITO';
    const emailContent = `
      <h2>💾 Backup Automatico ${status}</h2>
      <p><strong>Data:</strong> ${new Date().toLocaleString('it-IT')}</p>
      ${details ? `<p><strong>Dettagli:</strong> ${details}</p>` : ''}
      ${!success ? '<p style="color: red;">⚠️ Controlla il sistema e riprova il backup manualmente.</p>' : '<p style="color: green;">✅ Tutti i dati sono stati salvati correttamente.</p>'}
      <hr>
      <p><small>Notifica automatica da Alcafer & Gabifer ERP</small></p>
    `;

    await this.sendEmail({
      to: adminEmail,
      subject: `💾 Backup Automatico ${status}`,
      htmlContent: emailContent
    });
  }

  // Test delle notifiche
  async testNotifications(): Promise<{ email: boolean; whatsapp: boolean }> {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL as string;
    const adminPhone = import.meta.env.VITE_ADMIN_PHONE as string;

    const emailResult = await this.sendEmail({
      to: adminEmail,
      subject: '🧪 Test Notifiche Alcafer & Gabifer ERP',
      htmlContent: `
        <h2>🧪 Test Notifiche</h2>
        <p>Questo è un messaggio di test per verificare che le notifiche email funzionino correttamente.</p>
        <p><strong>Data test:</strong> ${new Date().toLocaleString('it-IT')}</p>
        <p>✅ Se ricevi questo messaggio, le notifiche email sono configurate correttamente!</p>
        <hr>
        <p><small>Test automatico da Alcafer & Gabifer ERP</small></p>
      `
    });

    const whatsappResult = await this.sendWhatsApp({
      to: adminPhone,
      message: `🧪 TEST NOTIFICHE\n\nQuesto è un messaggio di test per verificare che WhatsApp funzioni correttamente.\n\nData: ${new Date().toLocaleString('it-IT')}\n\n✅ Se ricevi questo messaggio, tutto funziona!\n\n- Alcafer & Gabifer ERP`
    });

    return {
      email: emailResult,
      whatsapp: whatsappResult
    };
  }
}

export const notificationService = NotificationService.getInstance();