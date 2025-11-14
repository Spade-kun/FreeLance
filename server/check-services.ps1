# Check status of all LMS microservices on Windows (PowerShell)
Write-Host "🔍 Checking LMS Microservices Status..." -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{name="api-gateway"; port=1001},
    @{name="auth-service"; port=1002},
    @{name="user-service"; port=1003},
    @{name="course-service"; port=1004},
    @{name="content-service"; port=1005},
    @{name="assessment-service"; port=1006},
    @{name="report-service"; port=1007}
)

$runningCount = 0
$stoppedCount = 0

foreach ($service in $services) {
    $serviceName = $service.name
    $port = $service.port
    $pidFile = "logs\$serviceName.pid"
    
    if (Test-Path $pidFile) {
        $pid = Get-Content $pidFile
        
        try {
            $process = Get-Process -Id $pid -ErrorAction Stop
            
            # Check if port is responding
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:$port/health" -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop
                Write-Host "✅ $serviceName is running on port $port (PID: $pid)" -ForegroundColor Green
            } catch {
                Write-Host "⏳ $serviceName is starting on port $port (PID: $pid)" -ForegroundColor Yellow
            }
            $runningCount++
        } catch {
            Write-Host "❌ $serviceName is not running (stale PID: $pid)" -ForegroundColor Red
            $stoppedCount++
        }
    } else {
        Write-Host "❌ $serviceName is not running" -ForegroundColor Red
        $stoppedCount++
    }
}

Write-Host ""
Write-Host "📊 Summary: $runningCount running, $stoppedCount stopped" -ForegroundColor Cyan
Write-Host ""

if ($runningCount -eq 7) {
    Write-Host "✅ All services are running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 API Gateway: http://localhost:1001/api" -ForegroundColor Cyan
    Write-Host "📖 API Documentation: See API_DOCUMENTATION.md" -ForegroundColor Gray
    Write-Host "📝 View logs: Get-Content logs\<service-name>.log -Tail 20 -Wait" -ForegroundColor Gray
} elseif ($runningCount -gt 0) {
    Write-Host "⚠️  Some services are not running. Start them with: .\start-all.ps1" -ForegroundColor Yellow
} else {
    Write-Host "❌ No services are running. Start them with: .\start-all.ps1" -ForegroundColor Red
}
Write-Host ""
