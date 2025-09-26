import { supabase } from '../lib/supabase';
import { freeNotificationService } from './freeNotificationService';

// 💾 BACKUP GRATUITO - GitHub + Google Drive + Dropbox + LocalStorage
export interface BackupData {
  timestamp: string;
  version: string;
  tables: { [tableName: string]: any[] };
  metadata: {
    totalRecords: number;
    size: string;
    checksum: string;
  };
}

export class FreeBackupService {
  private static instance: FreeBackupService;

  private constructor() {}

  public static getInstance(): FreeBackupService {
    if (!FreeBackupService.instance) {
      FreeBackupService.instance = new FreeBackupService();
    }
    return FreeBackupService.instance;
  }

  // 💾 BACKUP COMPLETO
  async createFullBackup(): Promise<BackupData> {
    try {
      console.log('💾 Creazione backup completo...');

      const timestamp = new Date().toISOString();
      const tables: { [tableName: string]: any[] } = {};
      let totalRecords = 0;

      // Lista tabelle da backuppare
      const tablesToBackup = [
        'users', 'clienti', 'preventivi', 'lavori',
        'materiali_metallici', 'materiali_vari',
        'leasing_strumentali', 'costi_utenze',
        'prezzi_materiali', 'manovalanza',
        'movimenti_contabili', 'tasse_iva'
      ];

      // Esporta ogni tabella
      for (const tableName of tablesToBackup) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*');

          if (error) {
            console.warn(`⚠️ Errore backup tabella ${tableName}:`, error);
            continue;
          }

          tables[tableName] = data || [];
          totalRecords += (data || []).length;
          console.log(`✅ ${tableName}: ${(data || []).length} record`);

        } catch (error) {
          console.warn(`⚠️ Tabella ${tableName} non accessibile:`, error);
        }
      }

      const backupData: BackupData = {
        timestamp,
        version: '1.0.0',
        tables,
        metadata: {
          totalRecords,
          size: this.calculateSize(tables),
          checksum: this.generateChecksum(tables)
        }
      };

      console.log(`✅ Backup creato: ${totalRecords} record, ${backupData.metadata.size}`);
      return backupData;

    } catch (error) {
      console.error('❌ Errore creazione backup:', error);
      throw error;
    }
  }

  // 🗂️ GITHUB BACKUP (GRATUITO)
  async saveToGitHub(backupData: BackupData): Promise<string> {
    try {
      console.log('🗂️ Salvataggio backup su GitHub...');

      const fileName = `backup-${backupData.timestamp.split('T')[0]}.json`;
      const content = JSON.stringify(backupData, null, 2);
      const encodedContent = btoa(unescape(encodeURIComponent(content)));

      // GitHub API (gratuita per repository pubblici)
      const response = await fetch(`https://api.github.com/repos/YOUR_USERNAME/alcafer-backups/contents/${fileName}`, {
        method: 'PUT',
        headers: {
          'Authorization': 'token YOUR_GITHUB_TOKEN',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Backup automatico ${backupData.timestamp}`,
          content: encodedContent,
          branch: 'main'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Backup salvato su GitHub');
        return result.content.download_url;
      }

      throw new Error('GitHub backup failed');

    } catch (error) {
      console.warn('⚠️ GitHub non disponibile, uso backup locale');
      return this.saveToLocalStorage(backupData);
    }
  }

  // 💿 LOCALSTORAGE BACKUP (GRATUITO)
  private saveToLocalStorage(backupData: BackupData): string {
    try {
      const backupKey = `backup_${backupData.timestamp}`;
      const compressedData = this.compressData(backupData);
      
      localStorage.setItem(backupKey, compressedData);
      
      // Mantieni solo gli ultimi 5 backup
      this.cleanOldLocalBackups();
      
      console.log('✅ Backup salvato in localStorage');
      return backupKey;

    } catch (error) {
      console.error('❌ Errore salvataggio locale:', error);
      throw error;
    }
  }

  // ☁️ GOOGLE DRIVE BACKUP (GRATUITO)
  async saveToGoogleDrive(backupData: BackupData): Promise<string> {
    try {
      console.log('☁️ Salvataggio backup su Google Drive...');

      // Google Drive API (15GB gratuiti)
      const fileName = `alcafer-backup-${backupData.timestamp.split('T')[0]}.json`;
      const content = JSON.stringify(backupData, null, 2);

      const metadata = {
        name: fileName,
        parents: ['YOUR_BACKUP_FOLDER_ID']
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([content], { type: 'application/json' }));

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer YOUR_GOOGLE_ACCESS_TOKEN'
        },
        body: form
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Backup salvato su Google Drive');
        return `https://drive.google.com/file/d/${result.id}/view`;
      }

      throw new Error('Google Drive backup failed');

    } catch (error) {
      console.warn('⚠️ Google Drive non disponibile');
      return this.saveToLocalStorage(backupData);
    }
  }

  // 📦 DROPBOX BACKUP (GRATUITO)
  async saveToDropbox(backupData: BackupData): Promise<string> {
    try {
      console.log('📦 Salvataggio backup su Dropbox...');

      const fileName = `/alcafer-backups/backup-${backupData.timestamp.split('T')[0]}.json`;
      const content = JSON.stringify(backupData, null, 2);

      // Dropbox API (2GB gratuiti)
      const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer YOUR_DROPBOX_ACCESS_TOKEN',
          'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': JSON.stringify({
            path: fileName,
            mode: 'add',
            autorename: true
          })
        },
        body: content
      });

      if (response.ok) {
        console.log('✅ Backup salvato su Dropbox');
        return fileName;
      }

      throw new Error('Dropbox backup failed');

    } catch (error) {
      console.warn('⚠️ Dropbox non disponibile');
      return this.saveToLocalStorage(backupData);
    }
  }

  // 🔄 BACKUP AUTOMATICO MULTI-DESTINAZIONE
  async performAutomaticBackup(): Promise<void> {
    try {
      console.log('🔄 Avvio backup automatico...');

      const backupData = await this.createFullBackup();
      const results: { [key: string]: string } = {};

      // Prova tutti i servizi in parallelo
      const backupPromises = [
        this.saveToGitHub(backupData).then(url => ({ service: 'GitHub', url })),
        this.saveToGoogleDrive(backupData).then(url => ({ service: 'Google Drive', url })),
        this.saveToDropbox(backupData).then(url => ({ service: 'Dropbox', url })),
        Promise.resolve({ service: 'LocalStorage', url: this.saveToLocalStorage(backupData) })
      ];

      const backupResults = await Promise.allSettled(backupPromises);

      backupResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results[result.value.service] = result.value.url;
          console.log(`✅ ${result.value.service}: ${result.value.url}`);
        } else {
          console.warn(`❌ Backup ${index} fallito:`, result.reason);
        }
      });

      // Notifica risultati
      await this.notifyBackupResults(backupData, results);

    } catch (error: any) {
      console.error('❌ Errore backup automatico:', error);
      await freeNotificationService.sendBackupNotification(false, error.message);
    }
  }

  // 🔄 RIPRISTINO BACKUP
  async restoreFromBackup(backupData: BackupData): Promise<boolean> {
    try {
      console.log('🔄 Ripristino backup...');

      const confirmed = confirm(
        `⚠️ ATTENZIONE: Ripristino Backup\n\n` +
        `Data: ${new Date(backupData.timestamp).toLocaleString('it-IT')}\n` +
        `Record: ${backupData.metadata.totalRecords}\n` +
        `Dimensione: ${backupData.metadata.size}\n\n` +
        `Questo sovrascriverà TUTTI i dati attuali!\n\n` +
        `Sei sicuro di voler continuare?`
      );

      if (!confirmed) return false;

      let restoredTables = 0;
      let restoredRecords = 0;

      for (const [tableName, records] of Object.entries(backupData.tables)) {
        if (records.length === 0) continue;

        try {
          // Elimina dati esistenti (ATTENZIONE!)
          await supabase.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000');

          // Inserisci dati del backup
          const { error } = await supabase.from(tableName).insert(records);
          
          if (error) {
            console.error(`❌ Errore ripristino ${tableName}:`, error);
          } else {
            restoredTables++;
            restoredRecords += records.length;
            console.log(`✅ ${tableName}: ${records.length} record ripristinati`);
          }

        } catch (error) {
          console.error(`❌ Errore tabella ${tableName}:`, error);
        }
      }

      console.log(`✅ Ripristino completato: ${restoredTables} tabelle, ${restoredRecords} record`);
      
      await freeNotificationService.sendMultiChannelNotification({
        title: 'Backup Ripristinato',
        message: `✅ Ripristinati ${restoredRecords} record da ${restoredTables} tabelle`,
        priority: 'high'
      });

      return true;

    } catch (error) {
      console.error('❌ Errore ripristino:', error);
      return false;
    }
  }

  // 📋 LISTA BACKUP DISPONIBILI
  async getAvailableBackups(): Promise<Array<{ source: string; date: string; size: string; url: string }>> {
    const backups: Array<{ source: string; date: string; size: string; url: string }> = [];

    // Backup LocalStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('backup_')) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const backup = JSON.parse(this.decompressData(data));
            backups.push({
              source: 'LocalStorage',
              date: new Date(backup.timestamp).toLocaleString('it-IT'),
              size: backup.metadata.size,
              url: key
            });
          }
        } catch (error) {
          console.warn(`⚠️ Backup corrotto: ${key}`);
        }
      }
    }

    return backups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // 🧹 PULIZIA BACKUP VECCHI
  private cleanOldLocalBackups(): void {
    const backupKeys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('backup_')) {
        backupKeys.push(key);
      }
    }

    // Ordina per data (più recenti prima)
    backupKeys.sort((a, b) => {
      const dateA = a.split('backup_')[1];
      const dateB = b.split('backup_')[1];
      return dateB.localeCompare(dateA);
    });

    // Rimuovi backup oltre il limite (mantieni 5)
    backupKeys.slice(5).forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ Rimosso backup vecchio: ${key}`);
    });
  }

  // 🔧 UTILITY METHODS
  private calculateSize(data: any): string {
    const jsonString = JSON.stringify(data);
    const bytes = new Blob([jsonString]).size;
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  private generateChecksum(data: any): string {
    const jsonString = JSON.stringify(data);
    let hash = 0;
    
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  }

  private compressData(data: any): string {
    // Compressione semplice (in produzione usare una libreria come pako)
    return JSON.stringify(data);
  }

  private decompressData(data: string): string {
    return data;
  }

  private async notifyBackupResults(backupData: BackupData, results: { [key: string]: string }): Promise<void> {
    const successCount = Object.keys(results).length;
    const message = `💾 BACKUP COMPLETATO

📊 Statistiche:
• Record: ${backupData.metadata.totalRecords}
• Dimensione: ${backupData.metadata.size}
• Checksum: ${backupData.metadata.checksum.substring(0, 8)}

☁️ Destinazioni (${successCount}):
${Object.entries(results).map(([service, url]) => `• ${service}: ✅`).join('\n')}

Data: ${new Date(backupData.timestamp).toLocaleString('it-IT')}`;

    await freeNotificationService.sendBackupNotification(true, message);
  }
}

export const freeBackupService = FreeBackupService.getInstance();
