$ports = 5173..5177
foreach ($p in $ports) {
  $conns = netstat -ano | Select-String ":$p "
  foreach ($c in $conns) {
    $parts = $c.ToString().Trim() -split "\s+"
    $procId = $parts[-1]
    if ($procId -match '^[0-9]+$') {
      try { taskkill /PID $procId /F | Out-Null } catch {}
    }
  }
}
