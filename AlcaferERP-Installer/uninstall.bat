@echo off
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
del "%USERPROFILE%\Desktop\Alcafer ERP.lnk" 2>nul
rmdir /s /q "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Alcafer ERP" 2>nul

echo Rimozione registro...
reg delete "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\AlcaferERP" /f 2>nul

echo.
echo ✅ Disinstallazione completata!
echo.
pause
