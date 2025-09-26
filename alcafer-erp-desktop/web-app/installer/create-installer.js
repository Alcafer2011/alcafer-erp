// Script per creare l'installer Windows
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function createInstaller() {
  console.log('🔧 Creazione installer Windows...');
  
  const installerDir = path.join(__dirname);
  const outputPath = path.join(__dirname, '..', 'AlcaferERP-Installer.zip');
  
  // Crea l'archivio ZIP
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  output.on('close', () => {
    console.log(`✅ Installer creato: ${outputPath}`);
    console.log(`📦 Dimensione: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
    console.log('');
    console.log('🔗 Link per il download:');
    console.log(`file://${outputPath.replace(/\\/g, '/')}`);
  });
  
  archive.on('error', (err) => {
    throw err;
  });
  
  archive.pipe(output);
  
  // Aggiungi tutti i file dell'installer
  archive.file(path.join(installerDir, 'setup.bat'), { name: 'setup.bat' });
  archive.file(path.join(installerDir, 'install.ps1'), { name: 'install.ps1' });
  
  // Aggiungi file di integrazione
  archive.directory(path.join(installerDir, 'integration'), 'integration');
  
  // Aggiungi README
  const readme = `# Alcafer ERP - Installer Windows

## Installazione Rapida

1. **Estrai tutti i file** in una cartella temporanea
2. **Esegui come Amministratore**: \`setup.bat\`
3. **Segui le istruzioni** a schermo
4. **Configura le API**: esegui \`configure_apis.bat\`
5. **Avvia il sistema**: esegui \`start_alcafer_erp.bat\`

## Requisiti Sistema

- Windows 10/11 (64-bit)
- 4GB RAM minimo (8GB consigliato)
- 2GB spazio libero su disco
- Connessione internet per il download delle dipendenze

## Componenti Installati

### 🏭 Alcafer ERP
- Sistema di gestione aziendale completo
- Gestione clienti, preventivi, lavori
- Contabilità e analisi finanziarie
- Connessione Supabase per database cloud

### 🤖 bolt.diy AI Assistant
- Assistente AI integrato per sviluppo
- Monitoraggio automatico errori
- Correzioni automatiche del codice
- Integrazione con Anthropic Claude

### 🔗 Integrazioni
- **Supabase**: Database cloud PostgreSQL
- **GitHub**: Versionamento e backup codice
- **Anthropic**: AI per correzioni automatiche
- **Servizi gratuiti**: Analytics, notifiche, backup

## Configurazione API Keys

### Supabase (Obbligatorio)
1. Vai su https://supabase.com
2. Crea un nuovo progetto
3. Vai in Settings > API
4. Copia URL e Anon Key

### Anthropic (Obbligatorio per AI)
1. Vai su https://console.anthropic.com
2. Crea un account
3. Genera una API Key
4. Inserisci nel configuratore

### GitHub (Opzionale)
1. Vai su https://github.com/settings/tokens
2. Genera un Personal Access Token
3. Seleziona scope: repo, read:user

## Utilizzo

### Avvio Sistema
\`\`\`batch
start_alcafer_erp.bat
\`\`\`

### Configurazione API
\`\`\`batch
configure_apis.bat
\`\`\`

### Aggiornamento
\`\`\`batch
update_system.bat
\`\`\`

## URL Applicazioni

- **Alcafer ERP**: http://localhost:5173
- **bolt.diy AI**: http://localhost:5174

## Funzionalità bolt.diy

### 🔍 Monitoraggio Automatico
- Rileva errori JavaScript in tempo reale
- Monitora performance dell'applicazione
- Controlla connessione database
- Verifica integrità del codice

### 🔧 Correzioni Automatiche
- Suggerisce fix per errori comuni
- Corregge problemi di sintassi
- Ottimizza query database
- Aggiorna dipendenze obsolete

### 🤖 AI Assistant
- Chat integrata con Claude
- Analisi codice avanzata
- Generazione automatica di codice
- Debugging intelligente

## Risoluzione Problemi

### Errore "command not found"
- Riavvia il terminale
- Controlla che Node.js sia nel PATH
- Riesegui l'installer come amministratore

### Errore connessione Supabase
- Verifica URL e API Key
- Controlla connessione internet
- Riesegui configure_apis.bat

### bolt.diy non si avvia
- Controlla che pnpm sia installato
- Verifica API Key Anthropic
- Controlla porta 5174 libera

### Errori di permessi
- Esegui sempre come Amministratore
- Disabilita temporaneamente antivirus
- Controlla Windows Defender

## Supporto

Per supporto tecnico:
- Email: assistenza.alcafer@gmail.com
- Telefono: +39 339 123 1150

## Licenza

MIT License - Uso libero per scopi commerciali e personali.

---

© 2025 Alcafer & Gabifer - Sistema ERP Integrato
`;
  
  archive.append(readme, { name: 'README.md' });
  
  // Aggiungi script di post-installazione
  const postInstall = `@echo off
echo.
echo ========================================
echo    POST-INSTALLAZIONE
echo ========================================
echo.
echo Creazione collegamenti desktop...

:: Crea collegamento desktop per Alcafer ERP
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\\Desktop\\Alcafer ERP.lnk'); $Shortcut.TargetPath = '%USERPROFILE%\\AlcaferERP\\start_alcafer_erp.bat'; $Shortcut.IconLocation = '%USERPROFILE%\\AlcaferERP\\alcafer-erp\\public\\favicon.ico'; $Shortcut.Save()"

:: Crea collegamento nel menu Start
if not exist "%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Alcafer ERP" mkdir "%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Alcafer ERP"
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Alcafer ERP\\Alcafer ERP.lnk'); $Shortcut.TargetPath = '%USERPROFILE%\\AlcaferERP\\start_alcafer_erp.bat'; $Shortcut.Save()"

:: Registra nel registro di Windows per disinstallazione
reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AlcaferERP" /v "DisplayName" /t REG_SZ /d "Alcafer ERP" /f
reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AlcaferERP" /v "DisplayVersion" /t REG_SZ /d "1.0.0" /f
reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AlcaferERP" /v "Publisher" /t REG_SZ /d "Alcafer & Gabifer" /f
reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AlcaferERP" /v "UninstallString" /t REG_SZ /d "%USERPROFILE%\\AlcaferERP\\uninstall.bat" /f

echo ✅ Collegamenti creati
echo ✅ Registrazione sistema completata
echo.
echo L'applicazione è ora disponibile nel menu Start e sul desktop.
echo.
pause
`;
  
  archive.append(postInstall, { name: 'post-install.bat' });
  
  // Aggiungi script di disinstallazione
  const uninstall = `@echo off
echo ========================================
echo    DISINSTALLAZIONE ALCAFER ERP
echo ========================================
echo.
echo Questa operazione rimuoverà completamente Alcafer ERP dal sistema.
echo.
set /p confirm="Sei sicuro? (S/N): "
if /i not "%confirm%"=="S" (
    echo Disinstallazione annullata.
    pause
    exit /b 0
)

echo.
echo Arresto servizi...
taskkill /f /im node.exe 2>nul

echo Rimozione file...
cd /d "%USERPROFILE%"
rmdir /s /q "AlcaferERP" 2>nul

echo Rimozione collegamenti...
del "%USERPROFILE%\\Desktop\\Alcafer ERP.lnk" 2>nul
rmdir /s /q "%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Alcafer ERP" 2>nul

echo Rimozione registro...
reg delete "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AlcaferERP" /f 2>nul

echo.
echo ✅ Disinstallazione completata!
echo.
pause
`;
  
  archive.append(uninstall, { name: 'uninstall.bat' });
  
  await archive.finalize();
  
  return outputPath;
}

// Esegui se chiamato direttamente
if (require.main === module) {
  createInstaller().catch(console.error);
}

module.exports = { createInstaller };
