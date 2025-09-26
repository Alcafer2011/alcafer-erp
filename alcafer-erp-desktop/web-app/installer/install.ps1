# Alcafer ERP PowerShell Installer
# Versione avanzata con controlli di sicurezza

param(
    [string]$InstallPath = "$env:USERPROFILE\AlcaferERP",
    [switch]$SkipNodeJS,
    [switch]$SkipGit,
    [string]$SupabaseUrl,
    [string]$SupabaseKey,
    [string]$AnthropicKey
)

# Funzione per scrivere log colorati
function Write-ColorLog {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

# Controllo privilegi amministratore
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Installazione Node.js
function Install-NodeJS {
    Write-ColorLog "🔧 Installazione Node.js..." "Yellow"
    
    $nodeUrl = "https://nodejs.org/dist/v18.18.0/node-v18.18.0-x64.msi"
    $nodeInstaller = "$env:TEMP\nodejs-installer.msi"
    
    try {
        Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller -UseBasicParsing
        Start-Process msiexec.exe -ArgumentList "/i `"$nodeInstaller`" /quiet /norestart" -Wait
        Write-ColorLog "✅ Node.js installato con successo" "Green"
        
        # Aggiorna PATH
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
    }
    catch {
        Write-ColorLog "❌ Errore installazione Node.js: $_" "Red"
        throw
    }
}

# Installazione Git
function Install-Git {
    Write-ColorLog "🔧 Installazione Git..." "Yellow"
    
    $gitUrl = "https://github.com/git-for-windows/git/releases/download/v2.42.0.windows.2/Git-2.42.0.2-64-bit.exe"
    $gitInstaller = "$env:TEMP\git-installer.exe"
    
    try {
        Invoke-WebRequest -Uri $gitUrl -OutFile $gitInstaller -UseBasicParsing
        Start-Process $gitInstaller -ArgumentList "/VERYSILENT /NORESTART" -Wait
        Write-ColorLog "✅ Git installato con successo" "Green"
    }
    catch {
        Write-ColorLog "❌ Errore installazione Git: $_" "Red"
        throw
    }
}

# Clonazione repository
function Clone-Repositories {
    param([string]$InstallPath)
    
    Write-ColorLog "📦 Clonazione repository..." "Yellow"
    
    if (!(Test-Path $InstallPath)) {
        New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
    }
    
    Set-Location $InstallPath
    
    # Clona Alcafer ERP
    if (Test-Path "alcafer-erp") {
        Write-ColorLog "🔄 Aggiornamento Alcafer ERP..." "Cyan"
        Set-Location "alcafer-erp"
        git pull origin main
        Set-Location ..
    } else {
        Write-ColorLog "📥 Clonazione Alcafer ERP..." "Cyan"
        git clone https://github.com/YOUR_USERNAME/alcafer-erp.git
    }
    
    # Clona bolt.diy
    if (Test-Path "bolt.diy") {
        Write-ColorLog "🔄 Aggiornamento bolt.diy..." "Cyan"
        Set-Location "bolt.diy"
        git pull origin main
        Set-Location ..
    } else {
        Write-ColorLog "📥 Clonazione bolt.diy..." "Cyan"
        git clone https://github.com/stackblitz-labs/bolt.diy.git
    }
}

# Installazione dipendenze
function Install-Dependencies {
    param([string]$InstallPath)
    
    Write-ColorLog "📦 Installazione dipendenze..." "Yellow"
    
    # Installa dipendenze Alcafer ERP
    Set-Location "$InstallPath\alcafer-erp"
    Write-ColorLog "📦 Installazione dipendenze Alcafer ERP..." "Cyan"
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Errore installazione dipendenze Alcafer ERP"
    }
    
    # Installa pnpm globalmente
    Write-ColorLog "📦 Installazione pnpm..." "Cyan"
    npm install -g pnpm
    
    # Installa dipendenze bolt.diy
    Set-Location "$InstallPath\bolt.diy"
    Write-ColorLog "📦 Installazione dipendenze bolt.diy..." "Cyan"
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        throw "Errore installazione dipendenze bolt.diy"
    }
    
    Set-Location $InstallPath
}

# Configurazione ambiente
function Setup-Environment {
    param([string]$InstallPath, [string]$SupabaseUrl, [string]$SupabaseKey, [string]$AnthropicKey)
    
    Write-ColorLog "⚙️ Configurazione ambiente..." "Yellow"
    
    # Configura Alcafer ERP
    $alcaferEnv = "$InstallPath\alcafer-erp\.env"
    if (!(Test-Path $alcaferEnv)) {
        Copy-Item "$InstallPath\alcafer-erp\.env.example" $alcaferEnv
    }
    
    if ($SupabaseUrl -and $SupabaseKey) {
        (Get-Content $alcaferEnv) -replace 'VITE_SUPABASE_URL=.*', "VITE_SUPABASE_URL=$SupabaseUrl" | Set-Content $alcaferEnv
        (Get-Content $alcaferEnv) -replace 'VITE_SUPABASE_ANON_KEY=.*', "VITE_SUPABASE_ANON_KEY=$SupabaseKey" | Set-Content $alcaferEnv
    }
    
    # Configura bolt.diy
    $boltEnv = "$InstallPath\bolt.diy\.env.local"
    @"
ANTHROPIC_API_KEY=$AnthropicKey
VITE_LOG_LEVEL=debug
DEFAULT_NUM_CTX=32768
RUNNING_IN_DOCKER=false
"@ | Out-File -FilePath $boltEnv -Encoding UTF8
    
    Write-ColorLog "✅ Ambiente configurato" "Green"
}

# Crea script di avvio
function Create-LaunchScripts {
    param([string]$InstallPath)
    
    Write-ColorLog "🚀 Creazione script di avvio..." "Yellow"
    
    # Script principale
    $launchScript = @"
@echo off
title Alcafer ERP - Sistema Integrato

echo ========================================
echo    ALCAFER ERP - SISTEMA INTEGRATO
echo ========================================
echo.
echo Avvio componenti del sistema...
echo.

:: Avvia Alcafer ERP
echo [1/2] Avvio Alcafer ERP...
cd /d "$InstallPath\alcafer-erp"
start "Alcafer ERP" cmd /k "npm run dev"

:: Attendi 3 secondi
timeout /t 3 /nobreak >nul

:: Avvia bolt.diy AI Assistant
echo [2/2] Avvio bolt.diy AI Assistant...
cd /d "$InstallPath\bolt.diy"
start "bolt.diy AI" cmd /k "pnpm run dev"

echo.
echo ========================================
echo    SISTEMA AVVIATO CORRETTAMENTE
echo ========================================
echo.
echo 🌐 Alcafer ERP:     http://localhost:5173
echo 🤖 bolt.diy AI:    http://localhost:5174
echo.
echo ⚠️  IMPORTANTE:
echo - Mantieni aperti entrambi i terminali
echo - Configura le API keys nell'interfaccia
echo - bolt.diy monitora automaticamente l'applicazione
echo.

:: Attendi 5 secondi e apri l'applicazione
echo Apertura automatica in 5 secondi...
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo Premi un tasto per chiudere questo terminale...
pause >nul
"@
    
    $launchScript | Out-File -FilePath "$InstallPath\start_alcafer_erp.bat" -Encoding ASCII
    
    # Script di configurazione API
    $configScript = @"
@echo off
title Configurazione API Keys

echo ========================================
echo    CONFIGURAZIONE API KEYS
echo ========================================
echo.

set /p SUPABASE_URL="Inserisci Supabase URL: "
set /p SUPABASE_KEY="Inserisci Supabase Anon Key: "
set /p ANTHROPIC_KEY="Inserisci Anthropic API Key: "
set /p GITHUB_TOKEN="Inserisci GitHub Token (opzionale): "

echo.
echo Aggiornamento configurazioni...

:: Aggiorna Alcafer ERP
cd /d "$InstallPath\alcafer-erp"
powershell -Command "(Get-Content .env) -replace 'VITE_SUPABASE_URL=.*', 'VITE_SUPABASE_URL=%SUPABASE_URL%' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'VITE_SUPABASE_ANON_KEY=.*', 'VITE_SUPABASE_ANON_KEY=%SUPABASE_KEY%' | Set-Content .env"

:: Aggiorna bolt.diy
cd /d "$InstallPath\bolt.diy"
echo ANTHROPIC_API_KEY=%ANTHROPIC_KEY% > .env.local
echo VITE_LOG_LEVEL=debug >> .env.local
echo DEFAULT_NUM_CTX=32768 >> .env.local

echo.
echo ✅ Configurazione completata!
echo.
echo Ora puoi avviare il sistema con: start_alcafer_erp.bat
echo.
pause
"@
    
    $configScript | Out-File -FilePath "$InstallPath\configure_apis.bat" -Encoding ASCII
    
    # Script di aggiornamento
    $updateScript = @"
@echo off
title Aggiornamento Sistema

echo ========================================
echo    AGGIORNAMENTO ALCAFER ERP
echo ========================================
echo.

echo [1/4] Aggiornamento Alcafer ERP...
cd /d "$InstallPath\alcafer-erp"
git pull origin main
call npm install

echo.
echo [2/4] Aggiornamento bolt.diy...
cd /d "$InstallPath\bolt.diy"
git pull origin main
call pnpm install

echo.
echo [3/4] Pulizia cache...
call npm cache clean --force
call pnpm store prune

echo.
echo [4/4] Riavvio servizi...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo ✅ Aggiornamento completato!
echo.
echo Avvia il sistema con: start_alcafer_erp.bat
echo.
pause
"@
    
    $updateScript | Out-File -FilePath "$InstallPath\update_system.bat" -Encoding ASCII
    
    Write-ColorLog "✅ Script di avvio creati" "Green"
}

# MAIN EXECUTION
try {
    Write-ColorLog "🚀 ALCAFER ERP INSTALLER - AVVIO" "Cyan"
    Write-ColorLog "======================================" "Cyan"
    
    # Controllo privilegi
    if (!(Test-Administrator)) {
        Write-ColorLog "❌ ERRORE: Esegui PowerShell come Amministratore!" "Red"
        Write-ColorLog "Clicca destro su PowerShell e seleziona 'Esegui come amministratore'" "Yellow"
        Read-Host "Premi Enter per uscire"
        exit 1
    }
    
    # Controllo Node.js
    if (!$SkipNodeJS) {
        try {
            $nodeVersion = node --version 2>$null
            Write-ColorLog "✅ Node.js trovato: $nodeVersion" "Green"
        }
        catch {
            Install-NodeJS
        }
    }
    
    # Controllo Git
    if (!$SkipGit) {
        try {
            $gitVersion = git --version 2>$null
            Write-ColorLog "✅ Git trovato: $gitVersion" "Green"
        }
        catch {
            Install-Git
        }
    }
    
    # Clonazione repository
    Clone-Repositories -InstallPath $InstallPath
    
    # Installazione dipendenze
    Install-Dependencies -InstallPath $InstallPath
    
    # Configurazione ambiente
    Setup-Environment -InstallPath $InstallPath -SupabaseUrl $SupabaseUrl -SupabaseKey $SupabaseKey -AnthropicKey $AnthropicKey
    
    # Creazione script
    Create-LaunchScripts -InstallPath $InstallPath
    
    Write-ColorLog "======================================" "Green"
    Write-ColorLog "🎉 INSTALLAZIONE COMPLETATA!" "Green"
    Write-ColorLog "======================================" "Green"
    Write-ColorLog ""
    Write-ColorLog "📁 Directory: $InstallPath" "Cyan"
    Write-ColorLog "🚀 Avvio: start_alcafer_erp.bat" "Cyan"
    Write-ColorLog "⚙️ Config: configure_apis.bat" "Cyan"
    Write-ColorLog "🔄 Update: update_system.bat" "Cyan"
    Write-ColorLog ""
    Write-ColorLog "Prossimi passi:" "Yellow"
    Write-ColorLog "1. Esegui configure_apis.bat per configurare le API" "White"
    Write-ColorLog "2. Esegui start_alcafer_erp.bat per avviare il sistema" "White"
    Write-ColorLog "3. Apri http://localhost:5173 per Alcafer ERP" "White"
    Write-ColorLog "4. Apri http://localhost:5174 per bolt.diy AI" "White"
    
}
catch {
    Write-ColorLog "❌ ERRORE DURANTE L'INSTALLAZIONE: $_" "Red"
    Read-Host "Premi Enter per uscire"
    exit 1
}

Read-Host "Premi Enter per continuare"
