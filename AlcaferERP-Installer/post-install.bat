@echo off
echo.
echo ========================================
echo    POST-INSTALLAZIONE
echo ========================================
echo.
echo Creazione collegamenti desktop...

:: Crea collegamento desktop per Alcafer ERP
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Alcafer ERP.lnk'); $Shortcut.TargetPath = '%USERPROFILE%\AlcaferERP\start_alcafer_erp.bat'; $Shortcut.IconLocation = '%USERPROFILE%\AlcaferERP\alcafer-erp\public\favicon.ico'; $Shortcut.Save()"

:: Crea collegamento nel menu Start
if not exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Alcafer ERP" mkdir "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Alcafer ERP"
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%APPDATA%\Microsoft\Windows\Start Menu\Programs\Alcafer ERP\Alcafer ERP.lnk'); $Shortcut.TargetPath = '%USERPROFILE%\AlcaferERP\start_alcafer_erp.bat'; $Shortcut.Save()"

:: Registra nel registro di Windows per disinstallazione
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\AlcaferERP" /v "DisplayName" /t REG_SZ /d "Alcafer ERP" /f
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\AlcaferERP" /v "DisplayVersion" /t REG_SZ /d "1.0.0" /f
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\AlcaferERP" /v "Publisher" /t REG_SZ /d "Alcafer & Gabifer" /f
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\AlcaferERP" /v "UninstallString" /t REG_SZ /d "%USERPROFILE%\AlcaferERP\uninstall.bat" /f

echo ✅ Collegamenti creati
echo ✅ Registrazione sistema completata
echo.
echo L'applicazione è ora disponibile nel menu Start e sul desktop.
echo.
pause
