# Stop all LMS microservices on Windows (PowerShell)
Write-Host "🛑 Stopping LMS Microservices..." -ForegroundColor Yellow
Write-Host ""

$services = @("api-gateway", "auth-service", "user-service", "course-service", 
              "content-service", "assessment-service", "report-service")

$stoppedCount = 0

foreach ($serviceName in $services) {
    $pidFile = "logs\$serviceName.pid"
    
    if (Test-Path $pidFile) {
        $pid = Get-Content $pidFile
        
        try {
            $process = Get-Process -Id $pid -ErrorAction Stop
            Stop-Process -Id $pid -Force
            Write-Host "✅ Stopped $serviceName (PID: $pid)" -ForegroundColor Green
            $stoppedCount++
        } catch {
            Write-Host "⚠️  $serviceName was not running" -ForegroundColor Yellow
        }
        
        Remove-Item $pidFile
    } else {
        Write-Host "⚠️  $serviceName was not running" -ForegroundColor Yellow
    }
}

Write-Host ""
if ($stoppedCount -gt 0) {
    Write-Host "✅ Stopped $stoppedCount service(s)" -ForegroundColor Green
} else {
    Write-Host "⚠️  No services were running" -ForegroundColor Yellow
}
Write-Host ""
