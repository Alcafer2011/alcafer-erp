@echo off
title Alcafer ERP - Avvio Applicazione
echo =================================
echo    AVVIO ALCAFER ERP
echo =================================
echo.
echo Applicazione in avvio su http://localhost:5173
echo.
echo Per fermare il server, premi CTRL+C
echo.
echo Verifica che Node.js e npm siano installati...
echo.

REM Trova il percorso del progetto automaticamente
set "PROJECT_PATH=%~dp0"
if "%PROJECT_PATH%"=="%~dp0" (
    echo Errore: Esegui questo file dalla cartella del progetto
    pause
    exit /b 1
)

cd /d "%PROJECT_PATH%"

REM Verifica se package.json esiste
if not exist "package.json" (
    echo Errore: package.json non trovato. Assicurati di essere nella cartella corretta.
    pause
    exit /b 1
)

REM Verifica se node_modules esiste
if not exist "node_modules" (
    echo Installazione dipendenze...
    call npm install
    if errorlevel 1 (
        echo Errore durante l'installazione delle dipendenze
        pause
        exit /b 1
    )
)

REM Libera le porte se occupate
echo Liberazione porte...
if exist "kill-ports.ps1" (
    powershell -ExecutionPolicy Bypass -File "kill-ports.ps1"
) else (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
        echo Terminando processo %%a sulla porta 5173...
        taskkill /PID %%a /F >nul 2>&1
    )
)

REM Avvia l'applicazione
echo Avvio applicazione...
call npm run dev

if errorlevel 1 (
    echo Errore durante l'avvio dell'applicazione
    pause
    exit /b 1
)

pause




