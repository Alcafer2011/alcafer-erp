import { supabase } from '../lib/supabase';
import { cloudinaryService } from './cloudinaryService';
import { notificationService } from './notificationService';

export interface BackupData {
  timestamp: string;
  tables: {
    [tableName: string]: any[];
  };
  metadata: {
    version: string;
    totalRecords: number;
    size: string;
  };
}

export class BackupService {
  private static instance: BackupService;

  private constructor() {}

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  async createBackup(): Promise<BackupData> {
    try {
      const timestamp = new Date().toISOString();
      const tables: { [tableName: string]: any[] } = {};
      let totalRecords = 0;

      // Lista delle tabelle da includere nel backup
      const tablesToBackup = [
        'users',
        'clienti',
        'preventivi',
        'lavori',
        'materiali_metallici',
        'materiali_vari',
        'leasing_strumentali',
        'costi_utenze',
        'prezzi_materiali',
        'manovalanza',
        'movimenti_contabili',
        'tasse_iva'
      ];

      // Esporta ogni tabella
      for (const tableName of tablesToBackup) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*');

          if (error) {
            console.warn(`Errore nell'esportazione della tabella ${tableName}:`, error);
            continue;
          }

          tables[tableName] = data || [];
          totalRecords += (data || []).length;
        } catch (error) {
          console.warn(`Errore nell'accesso alla tabella ${tableName}:`, error);
        }
      }

      const backupData: BackupData = {
        timestamp,
        tables,
        metadata: {
          version: '1.0.0',
          totalRecords,
          size: this.calculateSize(tables)
        }
      };

      return backupData;
    } catch (error) {
      console.error('Errore nella creazione del backup:', error);
      throw error;
    }
  }

  async saveBackupToCloud(backupData: BackupData): Promise<string> {
    try {
      const backupJson = JSON.stringify(backupData, null, 2);
      const backupBlob = new Blob([backupJson], { type: 'application/json' });
      const backupFile = new File([backupBlob], `backup-${backupData.timestamp}.json`, {
        type: 'application/json'
      });

      const uploadResult = await cloudinaryService.uploadFile(backupFile, 'backups');
      return uploadResult.secure_url;
    } catch (error) {
      console.error('Errore nel salvataggio del backup:', error);
      throw error;
    }
  }

  async restoreFromBackup(backupUrl: string): Promise<boolean> {
    try {
      // Scarica il backup
      const response = await fetch(backupUrl);
      const backupData: BackupData = await response.json();

      // Conferma prima del restore
      const confirmed = confirm(
        `Sei sicuro di voler ripristinare il backup del ${new Date(backupData.timestamp).toLocaleString('it-IT')}?\n\n` +
        `Questo sovrascriverà tutti i dati attuali!\n\n` +
        `Records totali: ${backupData.metadata.totalRecords}`
      );

      if (!confirmed) {
        return false;
      }

      // Ripristina ogni tabella
      for (const [tableName, records] of Object.entries(backupData.tables)) {
        if (records.length === 0) continue;

        try {
          // Elimina i dati esistenti (attenzione!)
          await supabase.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000');

          // Inserisci i dati del backup
          const { error } = await supabase.from(tableName).insert(records);
          
          if (error) {
            console.error(`Errore nel ripristino della tabella ${tableName}:`, error);
          }
        } catch (error) {
          console.error(`Errore nell'accesso alla tabella ${tableName} durante il ripristino:`, error);
        }
      }

      return true;
    } catch (error) {
      console.error('Errore nel ripristino del backup:', error);
      return false;
    }
  }

  async performAutomaticBackup(): Promise<void> {
    try {
      const backupData = await this.createBackup();
      const backupUrl = await this.saveBackupToCloud(backupData);
      
      await notificationService.sendBackupNotification(true, `Backup salvato: ${backupUrl}`);
    } catch (error) {
      await notificationService.sendBackupNotification(false, error.message);
      throw error;
    }
  }

  async getBackupHistory(): Promise<Array<{ url: string; date: string; size: string }>> {
    try {
      // Implementazione per recuperare la lista dei backup da Cloudinary
      // Per ora ritorniamo un array vuoto
      return [];
    } catch (error) {
      console.error('Errore nel recupero della cronologia backup:', error);
      return [];
    }
  }

  private calculateSize(data: any): string {
    const jsonString = JSON.stringify(data);
    const bytes = new Blob([jsonString]).size;
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

export const backupService = BackupService.getInstance();