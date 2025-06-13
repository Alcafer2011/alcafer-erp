import { materialPricesService } from './materialPricesService';
import { backupService } from './backupService';
import { taxService } from './taxService';

export class CronJobService {
  private static instance: CronJobService;
  private apiKey: string;
  private baseUrl = 'https://api.cron-job.org/v1';

  private constructor() {
    this.apiKey = import.meta.env.VITE_CRON_JOB_API_KEY as string;
  }

  public static getInstance(): CronJobService {
    if (!CronJobService.instance) {
      CronJobService.instance = new CronJobService();
    }
    return CronJobService.instance;
  }

  async setupCronJobs(): Promise<void> {
    try {
      // Job settimanale per aggiornamento prezzi materiali (ogni lunedì alle 6:00)
      await this.createCronJob({
        title: 'Aggiornamento Prezzi Materiali',
        url: `${import.meta.env.VITE_APP_URL as string}/api/cron/update-prices`,
        schedule: '0 6 * * 1', // Ogni lunedì alle 6:00
        enabled: true
      });

      // Job giornaliero per controllo scadenze (ogni giorno alle 8:00)
      await this.createCronJob({
        title: 'Controllo Scadenze Fiscali',
        url: `${import.meta.env.VITE_APP_URL as string}/api/cron/check-deadlines`,
        schedule: '0 8 * * *', // Ogni giorno alle 8:00
        enabled: true
      });

      // Job giornaliero per backup (ogni giorno alle 2:00)
      await this.createCronJob({
        title: 'Backup Automatico',
        url: `${import.meta.env.VITE_APP_URL as string}/api/cron/backup`,
        schedule: '0 2 * * *', // Ogni giorno alle 2:00
        enabled: true
      });

      console.log('Cron jobs configurati con successo');
    } catch (error) {
      console.error('Errore nella configurazione dei cron jobs:', error);
    }
  }

  private async createCronJob(job: {
    title: string;
    url: string;
    schedule: string;
    enabled: boolean;
  }): Promise<void> {
    try {
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      };

      const body = {
        job: {
          title: job.title,
          url: job.url,
          schedule: {
            timezone: 'Europe/Rome',
            expiresAt: 0,
            hours: [-1],
            mdays: [-1],
            minutes: [-1],
            months: [-1],
            wdays: [-1]
          },
          requestMethod: 1, // GET
          enabled: job.enabled
        }
      };

      // In a real implementation, this would use fetch or axios
      console.log('Would create cron job:', { job, headers, body });
    } catch (error) {
      console.error(`Errore nella creazione del cron job ${job.title}:`, error);
    }
  }

  // Endpoint handlers per i cron jobs
  static async handlePriceUpdate(): Promise<void> {
    try {
      await materialPricesService.updateDatabasePrices();
      await materialPricesService.updateUtilityCosts();
    } catch (error) {
      console.error('Errore nell\'aggiornamento prezzi:', error);
    }
  }

  static async handleDeadlineCheck(): Promise<void> {
    try {
      await taxService.checkUpcomingDeadlines();
    } catch (error) {
      console.error('Errore nel controllo scadenze:', error);
    }
  }

  static async handleBackup(): Promise<void> {
    try {
      await backupService.performAutomaticBackup();
    } catch (error) {
      console.error('Errore nel backup automatico:', error);
    }
  }
}

export const cronJobService = CronJobService.getInstance();