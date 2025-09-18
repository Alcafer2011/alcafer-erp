@echo off
setlocal enabledelayedexpansion

:: Alcafer ERP Windows Installer
:: Versione 1.0.0 - Integrazione con bolt.diy

echo ========================================
echo    ALCAFER ERP - INSTALLER WINDOWS
echo ========================================
echo.
echo Installazione automatica con:
echo - Node.js e dipendenze
echo - Connessione Supabase
echo - Integrazione GitHub
echo - bolt.diy AI Assistant
echo - Configurazione Anthropic API
echo.

:: Controlla se è in esecuzione come amministratore
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERRORE: Esegui come Amministratore!
    echo Clicca destro su setup.bat e seleziona "Esegui come amministratore"
    pause
    exit /b 1
)

:: Crea directory di installazione
set INSTALL_DIR=%USERPROFILE%\AlcaferERP
echo Creazione directory: %INSTALL_DIR%
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
cd /d "%INSTALL_DIR%"

:: Controlla Node.js
echo.
echo [1/8] Controllo Node.js...
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Node.js non trovato. Scaricando...
    powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v18.18.0/node-v18.18.0-x64.msi' -OutFile 'nodejs-installer.msi'"
    echo Installando Node.js...
    msiexec /i nodejs-installer.msi /quiet /norestart
    echo Riavvia il computer e riesegui l'installer.
    pause
    exit /b 1
) else (
    echo ✓ Node.js trovato
)

:: Controlla Git
echo.
echo [2/8] Controllo Git...
git --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Git non trovato. Scaricando...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/download/v2.42.0.windows.2/Git-2.42.0.2-64-bit.exe' -OutFile 'git-installer.exe'"
    echo Installando Git...
    git-installer.exe /VERYSILENT /NORESTART
    echo Git installato. Riavvia il terminale.
    pause
) else (
    echo ✓ Git trovato
)

:: Clona repository principale
echo.
echo [3/8] Clonazione Alcafer ERP...
if exist "alcafer-erp" (
    echo Repository già presente, aggiornamento...
    cd alcafer-erp
    git pull origin main
    cd ..
) else (
    git clone https://github.com/YOUR_USERNAME/alcafer-erp.git
)

:: Clona bolt.diy
echo.
echo [4/8] Clonazione bolt.diy...
if exist "bolt.diy" (
    echo bolt.diy già presente, aggiornamento...
    cd bolt.diy
    git pull origin main
    cd ..
) else (
    git clone https://github.com/stackblitz-labs/bolt.diy.git
)

:: Installa dipendenze Alcafer ERP
echo.
echo [5/8] Installazione dipendenze Alcafer ERP...
cd alcafer-erp
call npm install
if %errorLevel% neq 0 (
    echo ERRORE: Installazione dipendenze fallita
    pause
    exit /b 1
)
cd ..

:: Installa dipendenze bolt.diy
echo.
echo [6/8] Installazione dipendenze bolt.diy...
cd bolt.diy
call npm install -g pnpm
call pnpm install
if %errorLevel% neq 0 (
    echo ERRORE: Installazione bolt.diy fallita
    pause
    exit /b 1
)
cd ..

:: Configurazione ambiente
echo.
echo [7/8] Configurazione ambiente...
call :setup_environment

:: Crea script di avvio
echo.
echo [8/8] Creazione script di avvio...
call :create_launcher

echo.
echo ========================================
echo    INSTALLAZIONE COMPLETATA!
echo ========================================
echo.
echo Per avviare l'applicazione:
echo 1. Esegui: start_alcafer_erp.bat
echo 2. Configura le API keys nell'interfaccia
echo 3. bolt.diy sarà disponibile su http://localhost:3001
echo.
echo Directory installazione: %INSTALL_DIR%
echo.
pause
exit /b 0

:setup_environment
echo Configurazione file .env...
cd alcafer-erp

:: Crea .env da .env.example se non esiste
if not exist ".env" (
    copy ".env.example" ".env"
)

:: Crea configurazione bolt.diy
cd ..\bolt.diy
if not exist ".env.local" (
    echo GROQ_API_KEY=>> .env.local
    echo OPENAI_API_KEY=>> .env.local
    echo ANTHROPIC_API_KEY=>> .env.local
    echo VITE_LOG_LEVEL=debug>> .env.local
    echo DEFAULT_NUM_CTX=32768>> .env.local
)

cd ..
goto :eof

:create_launcher
:: Crea script di avvio principale
(
echo @echo off
echo setlocal
echo.
echo :: Avvia Alcafer ERP con bolt.diy integrato
echo echo ========================================
echo echo    ALCAFER ERP - AVVIO SISTEMA
echo echo ========================================
echo echo.
echo echo Avvio Alcafer ERP...
echo cd /d "%INSTALL_DIR%\alcafer-erp"
echo start "Alcafer ERP" cmd /k "npm run dev"
echo.
echo echo Avvio bolt.diy AI Assistant...
echo cd /d "%INSTALL_DIR%\bolt.diy"
echo start "bolt.diy AI" cmd /k "pnpm run dev"
echo.
echo echo ========================================
echo echo    SISTEMA AVVIATO
echo echo ========================================
echo echo.
echo echo Alcafer ERP: http://localhost:5173
echo echo bolt.diy AI: http://localhost:5174
echo echo.
echo echo Premi un tasto per aprire l'applicazione...
echo pause ^>nul
echo start http://localhost:5173
echo.
echo echo Mantieni aperti entrambi i terminali per il funzionamento.
echo pause
) > start_alcafer_erp.bat

:: Crea script di configurazione API
(
echo @echo off
echo echo ========================================
echo echo    CONFIGURAZIONE API KEYS
echo echo ========================================
echo echo.
echo echo Configura le tue API keys:
echo echo.
echo set /p SUPABASE_URL="Supabase URL: "
echo set /p SUPABASE_KEY="Supabase Anon Key: "
echo set /p ANTHROPIC_KEY="Anthropic API Key: "
echo set /p GITHUB_TOKEN="GitHub Token (opzionale): "
echo.
echo echo Aggiornamento file .env...
echo.
echo :: Aggiorna Alcafer ERP
echo cd /d "%INSTALL_DIR%\alcafer-erp"
echo echo VITE_SUPABASE_URL=%%SUPABASE_URL%% ^> .env
echo echo VITE_SUPABASE_ANON_KEY=%%SUPABASE_KEY%% ^>^> .env
echo echo VITE_GITHUB_TOKEN=%%GITHUB_TOKEN%% ^>^> .env
echo.
echo :: Aggiorna bolt.diy
echo cd /d "%INSTALL_DIR%\bolt.diy"
echo echo ANTHROPIC_API_KEY=%%ANTHROPIC_KEY%% ^> .env.local
echo echo VITE_LOG_LEVEL=debug ^>^> .env.local
echo echo DEFAULT_NUM_CTX=32768 ^>^> .env.local
echo.
echo echo ✓ Configurazione completata!
echo pause
) > configure_apis.bat

:: Crea script di aggiornamento
(
echo @echo off
echo echo ========================================
echo echo    AGGIORNAMENTO ALCAFER ERP
echo echo ========================================
echo echo.
echo echo Aggiornamento repository...
echo cd /d "%INSTALL_DIR%\alcafer-erp"
echo git pull origin main
echo call npm install
echo.
echo cd /d "%INSTALL_DIR%\bolt.diy"
echo git pull origin main
echo call pnpm install
echo.
echo echo ✓ Aggiornamento completato!
echo pause
) > update_system.bat

goto :eof