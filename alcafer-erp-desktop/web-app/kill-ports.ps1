# Script PowerShell per liberare le porte utilizzate dall'applicazione
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "   LIBERAZIONE PORTE ALCAFER ERP" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$ports = @(5173, 5174, 5175, 5176, 5177)

foreach ($port in $ports) {
    Write-Host "Controllo porta $port..." -ForegroundColor Yellow
    
    # Trova i processi che utilizzano la porta
    $connections = netstat -ano | Select-String ":$port "
    
    if ($connections) {
        foreach ($connection in $connections) {
            $parts = $connection.ToString().Trim() -split "\s+"
            $processId = $parts[-1]
            
            if ($processId -match '^[0-9]+$') {
                try {
                    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "Terminando processo $processId ($($process.ProcessName)) sulla porta $port" -ForegroundColor Red
                        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    }
                } catch {
                    Write-Host "Errore nel terminare il processo $processId" -ForegroundColor Red
                }
            }
        }
    } else {
        Write-Host "Porta $port libera" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Liberazione porte completata!" -ForegroundColor Green
Write-Host "Premi un tasto per continuare..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
