import axios from 'axios';

export interface EmailTemplate {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export class EmailService {
  private static instance: EmailService;
  private brevoApiKey: string;

  private constructor() {
    this.brevoApiKey = import.meta.env.VITE_BREVO_API_KEY;
    
    if (!this.brevoApiKey) {
      console.error('❌ Brevo API Key non configurata. Le email non verranno inviate.');
    } else {
      console.log('✅ Brevo configurato correttamente con API key:', this.brevoApiKey.substring(0, 20) + '...');
    }
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(template: EmailTemplate): Promise<boolean> {
    if (!this.brevoApiKey) {
      console.error('❌ Brevo non configurato - email non inviata');
      return false;
    }

    try {
      console.log('📧 Tentativo invio email a:', template.to);
      
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: {
            name: 'Alcafer ERP',
            email: 'noreply@alcafer.com'
          },
          to: [{ email: template.to }],
          subject: template.subject,
          htmlContent: template.htmlContent,
          textContent: template.textContent || template.htmlContent.replace(/<[^>]*>/g, '')
        },
        {
          headers: {
            'api-key': this.brevoApiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Email inviata con successo via Brevo:', response.status);
      return response.status === 201;
    } catch (error: any) {
      console.error('❌ Errore invio email Brevo:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return false;
    }
  }

  async sendConfirmationEmail(email: string, nome: string, confirmationToken: string): Promise<boolean> {
    const confirmationUrl = `${window.location.origin}?token=${confirmationToken}&email=${encodeURIComponent(email)}`;
    
    console.log('🔗 URL di conferma generato:', confirmationUrl);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Conferma il tuo account - Alcafer ERP</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: #1d4ed8; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .url-box { word-break: break-all; background: #e5e7eb; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Benvenuto in Alcafer ERP</h1>
            <p>Sistema di Gestione Aziendale</p>
          </div>
          
          <div class="content">
            <h2>Ciao ${nome}! 👋</h2>
            
            <p>Grazie per esserti registrato su <strong>Alcafer ERP</strong>. Per completare la registrazione e accedere al sistema, devi confermare il tuo indirizzo email.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" class="button">
                ✅ Conferma il tuo Account
              </a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong> Questo link è valido per 24 ore. Se non confermi entro questo tempo, dovrai registrarti nuovamente.
            </div>
            
            <p><strong>Se il pulsante non funziona</strong>, copia e incolla questo link nel tuo browser:</p>
            <div class="url-box">
              ${confirmationUrl}
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <h3>🔐 Accesso Sicuro</h3>
            <p>Il tuo account è protetto e solo tu puoi accedere ai dati aziendali. Dopo la conferma potrai:</p>
            <ul>
              <li>✅ Gestire clienti e preventivi</li>
              <li>✅ Monitorare lavori e materiali</li>
              <li>✅ Accedere ai dati finanziari</li>
              <li>✅ Ricevere notifiche automatiche</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>Se non hai richiesto questa registrazione, ignora questa email.</p>
            <p><strong>Alcafer ERP</strong> - Sistema di Gestione Aziendale</p>
            <p>📧 ${import.meta.env.VITE_ADMIN_EMAIL} | 📱 ${import.meta.env.VITE_ADMIN_PHONE}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await this.sendEmail({
      to: email,
      subject: '🚀 Conferma il tuo account - Alcafer ERP',
      htmlContent,
      textContent: `
        Benvenuto in Alcafer ERP!
        
        Ciao ${nome},
        
        Per completare la registrazione, conferma il tuo account cliccando su questo link:
        ${confirmationUrl}
        
        Il link è valido per 24 ore.
        
        Se non hai richiesto questa registrazione, ignora questa email.
        
        Alcafer ERP - Sistema di Gestione Aziendale
      `
    });

    if (result) {
      console.log('✅ Email di conferma inviata con successo a:', email);
    } else {
      console.error('❌ Fallito invio email di conferma a:', email);
    }

    return result;
  }

  async sendWelcomeEmail(email: string, nome: string): Promise<boolean> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Benvenuto in Alcafer ERP!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f0fdf4; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Account Confermato!</h1>
            <p>Benvenuto in Alcafer ERP</p>
          </div>
          
          <div class="content">
            <h2>Ciao ${nome}! 🚀</h2>
            
            <p>Il tuo account è stato confermato con successo! Ora puoi accedere a tutte le funzionalità di <strong>Alcafer ERP</strong>.</p>
            
            <h3>🔧 Cosa puoi fare ora:</h3>
            
            <div class="feature">
              <strong>👥 Gestione Clienti</strong><br>
              Aggiungi e gestisci i tuoi clienti con informazioni complete
            </div>
            
            <div class="feature">
              <strong>📋 Preventivi e Lavori</strong><br>
              Crea preventivi professionali e monitora i lavori in corso
            </div>
            
            <div class="feature">
              <strong>📊 Analisi Finanziarie</strong><br>
              Accedi a dashboard avanzate e analisi secondo il metodo Gasparotto
            </div>
            
            <div class="feature">
              <strong>🔔 Notifiche Automatiche</strong><br>
              Ricevi promemoria per scadenze fiscali e aggiornamenti importanti
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${window.location.origin}" class="button">
                🚀 Accedi ad Alcafer ERP
              </a>
            </p>
            
            <p><strong>💡 Suggerimento:</strong> Inizia aggiungendo i tuoi primi clienti nella sezione "Clienti" per sfruttare al massimo il sistema.</p>
          </div>
          
          <div class="footer">
            <p>Hai domande? Contattaci!</p>
            <p><strong>Alcafer ERP</strong> - Sistema di Gestione Aziendale</p>
            <p>📧 ${import.meta.env.VITE_ADMIN_EMAIL} | 📱 ${import.meta.env.VITE_ADMIN_PHONE}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '🎉 Benvenuto in Alcafer ERP - Account Confermato!',
      htmlContent,
      textContent: `
        Account Confermato!
        
        Ciao ${nome},
        
        Il tuo account Alcafer ERP è stato confermato con successo!
        
        Ora puoi accedere a tutte le funzionalità:
        - Gestione Clienti
        - Preventivi e Lavori  
        - Analisi Finanziarie
        - Notifiche Automatiche
        
        Accedi ora: ${window.location.origin}
        
        Alcafer ERP - Sistema di Gestione Aziendale
      `
    });
  }

  async testBrevoConnection(): Promise<boolean> {
    if (!this.brevoApiKey) {
      console.error('❌ Brevo API Key non configurata');
      return false;
    }

    try {
      console.log('🧪 Test connessione Brevo...');
      
      const response = await axios.get(
        'https://api.brevo.com/v3/account',
        {
          headers: {
            'api-key': this.brevoApiKey
          }
        }
      );

      console.log('✅ Connessione Brevo OK:', response.data.email);
      return true;
    } catch (error: any) {
      console.error('❌ Errore connessione Brevo:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return false;
    }
  }
}

export const emailService = EmailService.getInstance();