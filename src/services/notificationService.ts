import axios from 'axios';

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
    this.brevoApiKey = import.meta.env.VITE_BREVO_API_KEY;
    this.twilioAccountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
    this.twilioAuthToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
    this.twilioPhoneNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER;
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async sendEmail(notification: EmailNotification): Promise<boolean> {
    try {
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: {
            name: 'Alcafer ERP',
            email: 'noreply@alcafer.com'
          },
          to: [{ email: notification.to }],
          subject: notification.subject,
          htmlContent: notification.htmlContent,
          textContent: notification.textContent || notification.htmlContent.replace(/<[^>]*>/g, '')
        },
        {
          headers: {
            'api-key': this.brevoApiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.status === 201;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  async sendWhatsApp(notification: WhatsAppNotification): Promise<boolean> {
    try {
      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`,
        new URLSearchParams({
          From: `whatsapp:${this.twilioPhoneNumber}`,
          To: `whatsapp:${notification.to}`,
          Body: notification.message
        }),
        {
          auth: {
            username: this.twilioAccountSid,
            password: this.twilioAuthToken
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.status === 201;
    } catch (error) {
      console.error('WhatsApp sending error:', error);
      return false;
    }
  }

  async sendTaxReminder(ditta: string, importo: number, scadenza: string): Promise<void> {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const adminPhone = import.meta.env.VITE_ADMIN_PHONE;

    const emailContent = `
      <h2>Promemoria Scadenza Fiscale</h2>
      <p><strong>Ditta:</strong> ${ditta.toUpperCase()}</p>
      <p><strong>Importo da versare:</strong> €${importo.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
      <p><strong>Scadenza:</strong> ${scadenza}</p>
      <p>Ricordati di mettere da parte l'importo necessario.</p>
    `;

    const whatsappMessage = `🚨 PROMEMORIA FISCALE\n\nDitta: ${ditta.toUpperCase()}\nImporto: €${importo.toLocaleString('it-IT')}\nScadenza: ${scadenza}\n\nMetti da parte l'importo!`;

    await Promise.all([
      this.sendEmail({
        to: adminEmail,
        subject: `Scadenza Fiscale ${ditta.toUpperCase()} - €${importo.toLocaleString('it-IT')}`,
        htmlContent: emailContent
      }),
      this.sendWhatsApp({
        to: adminPhone,
        message: whatsappMessage
      })
    ]);
  }

  async sendPriceUpdateNotification(updates: Array<{ material: string; oldPrice: number; newPrice: number }>): Promise<void> {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const adminPhone = import.meta.env.VITE_ADMIN_PHONE;

    const emailContent = `
      <h2>Aggiornamento Prezzi Materiali</h2>
      <p>I seguenti prezzi sono stati aggiornati automaticamente:</p>
      <ul>
        ${updates.map(update => `
          <li>
            <strong>${update.material}:</strong> 
            €${update.oldPrice.toFixed(3)}/kg → €${update.newPrice.toFixed(3)}/kg
            ${update.newPrice > update.oldPrice ? '📈' : '📉'}
          </li>
        `).join('')}
      </ul>
      <p>Controlla i prezzi nella sezione Materiali Metallici se necessario.</p>
    `;

    const whatsappMessage = `📊 AGGIORNAMENTO PREZZI\n\n${updates.map(u => `${u.material}: €${u.oldPrice.toFixed(3)} → €${u.newPrice.toFixed(3)}`).join('\n')}\n\nControlla l'app per dettagli.`;

    await Promise.all([
      this.sendEmail({
        to: adminEmail,
        subject: 'Aggiornamento Automatico Prezzi Materiali',
        htmlContent: emailContent
      }),
      this.sendWhatsApp({
        to: adminPhone,
        message: whatsappMessage
      })
    ]);
  }

  async sendBackupNotification(success: boolean, details?: string): Promise<void> {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    
    const status = success ? '✅ COMPLETATO' : '❌ FALLITO';
    const emailContent = `
      <h2>Backup Automatico ${status}</h2>
      <p><strong>Data:</strong> ${new Date().toLocaleString('it-IT')}</p>
      ${details ? `<p><strong>Dettagli:</strong> ${details}</p>` : ''}
      ${!success ? '<p style="color: red;">Controlla il sistema e riprova il backup manualmente.</p>' : ''}
    `;

    await this.sendEmail({
      to: adminEmail,
      subject: `Backup Automatico ${status}`,
      htmlContent: emailContent
    });
  }
}

export const notificationService = NotificationService.getInstance();