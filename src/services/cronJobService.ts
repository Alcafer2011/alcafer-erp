import { materialPricesService } from './materialPricesService';
import { backupService } from './backupService';
import { taxService } from './taxService';

export class CronJobService {
  private static instance: CronJobService;

  private constructor() {}

  public static getInstance(): CronJobService {
    if (!CronJobService.instance) {
      CronJobService.instance = new CronJobService();
    }
    return CronJobService.instance;
  }

  // 🇮🇹 AGGIORNAMENTI AUTOMATICI ITALIANI
  async setupItalianAutomation(): Promise<void> {
    try {
      console.log('🇮🇹 Configurazione automazioni italiane...');

      // Simula cron jobs con setTimeout per demo
      // In produzione useresti veri cron jobs o Vercel Cron

      // Aggiornamento prezzi ogni lunedì alle 6:00
      this.scheduleWeeklyPriceUpdate();

      // Controllo scadenze ogni giorno alle 8:00
      this.scheduleDailyDeadlineCheck();

      // Backup ogni giorno alle 2:00
      this.scheduleDailyBackup();

      console.log('✅ Automazioni configurate');

    } catch (error) {
      console.error('❌ Errore configurazione automazioni:', error);
    }
  }

  private scheduleWeeklyPriceUpdate(): void {
    // Aggiornamento settimanale prezzi materiali
    setInterval(async () => {
      const now = new Date();
      if (now.getDay() === 1 && now.getHours() === 6) { // Lunedì alle 6:00
        await materialPricesService.updateItalianMaterialPrices();
        await materialPricesService.updateItalianUtilityCosts();
      }
    }, 60 * 60 * 1000); // Controlla ogni ora
  }

  private scheduleDailyDeadlineCheck(): void {
    // Controllo scadenze giornaliero
    setInterval(async () => {
      const now = new Date();
      if (now.getHours() === 8 && now.getMinutes() === 0) { // Alle 8:00
        await taxService.checkUpcomingDeadlines();
      }
    }, 60 * 1000); // Controlla ogni minuto
  }

  private scheduleDailyBackup(): void {
    // Backup giornaliero
    setInterval(async () => {
      const now = new Date();
      if (now.getHours() === 2 && now.getMinutes() === 0) { // Alle 2:00
        await backupService.performAutomaticBackup();
      }
    }, 60 * 1000); // Controlla ogni minuto
  }

  // 🔧 TRIGGER MANUALI
  static async triggerPriceUpdate(): Promise<void> {
    console.log('🔧 Aggiornamento prezzi manuale...');
    await materialPricesService.updateItalianMaterialPrices();
    await materialPricesService.updateItalianUtilityCosts();
  }

  static async triggerDeadlineCheck(): Promise<void> {
    console.log('🔧 Controllo scadenze manuale...');
    await taxService.checkUpcomingDeadlines();
  }

  static async triggerBackup(): Promise<void> {
    console.log('🔧 Backup manuale...');
    await backupService.performAutomaticBackup();
  }
}

export const cronJobService = CronJobService.getInstance();
