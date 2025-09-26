import { freeBackupService } from './freeBackupService';

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
    // Converte il formato di backup da freeBackupService al formato richiesto
    const freeBackup = await freeBackupService.createFullBackup();
    
    return {
      timestamp: freeBackup.timestamp,
      tables: freeBackup.tables,
      metadata: {
        version: freeBackup.version,
        totalRecords: freeBackup.metadata.totalRecords,
        size: freeBackup.metadata.size
      }
    };
  }

  async performAutomaticBackup(): Promise<void> {
    await freeBackupService.performAutomaticBackup();
  }

  async getBackupHistory(): Promise<Array<{ url: string; date: string; size: string }>> {
    return await freeBackupService.getAvailableBackups();
  }
}

export const backupService = BackupService.getInstance();
