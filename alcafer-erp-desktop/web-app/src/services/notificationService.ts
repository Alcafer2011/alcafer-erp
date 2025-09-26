import { freeNotificationService } from './freeNotificationService';

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

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async sendTaxReminder(ditta: string, importo: number, scadenza: string): Promise<void> {
    await freeNotificationService.sendTaxReminder(ditta, importo, scadenza);
  }

  async sendPriceUpdateNotification(updates: Array<{ material: string; oldPrice: number; newPrice: number }>): Promise<void> {
    await freeNotificationService.sendPriceUpdateNotification(updates);
  }

  async sendBackupNotification(success: boolean, details?: string): Promise<void> {
    await freeNotificationService.sendBackupNotification(success, details);
  }
}

export const notificationService = NotificationService.getInstance();
