# Start all LMS microservices on Windows (PowerShell)
Write-Host "🚀 Starting LMS Microservices..." -ForegroundColor Cyan
Write-Host ""

# Array of services
$services = @(
    @{name="api-gateway"; port=1001},
    @{name="auth-service"; port=1002},
    @{name="user-service"; port=1003},
    @{name="course-service"; port=1004},
    @{name="content-service"; port=1005},
    @{name="assessment-service"; port=1006},
    @{name="report-service"; port=1007}
)

# Create logs directory if it doesn't exist
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

# Stop any existing services
Write-Host "🛑 Stopping existing services..." -ForegroundColor Yellow
Get-ChildItem "logs\*.pid" -ErrorAction SilentlyContinue | ForEach-Object {
    $pid = Get-Content $_.FullName
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Remove-Item $_.FullName
}
Write-Host ""

# Start all services
foreach ($service in $services) {
    $serviceName = $service.name
    $port = $service.port
    
    Set-Location $serviceName
    
    # Start the service in background
    $process = Start-Process -FilePath "npm" -ArgumentList "run", "dev" `
        -RedirectStandardOutput "..\logs\$serviceName.log" `
        -RedirectStandardError "..\logs\$serviceName.error.log" `
        -PassThru -WindowStyle Hidden
    
    # Save PID
    $process.Id | Out-File -FilePath "..\logs\$serviceName.pid"
    
    Write-Host "✅ $serviceName started on port $port (PID: $($process.Id))" -ForegroundColor Green
    
    Set-Location ..
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
Write-Host "  API Gateway:        http://localhost:1001"
Write-Host "  Auth Service:       http://localhost:1002"
Write-Host "  User Service:       http://localhost:1003"
Write-Host "  Course Service:     http://localhost:1004"
Write-Host "  Content Service:    http://localhost:1005"
Write-Host "  Assessment Service: http://localhost:1006"
Write-Host "  Report Service:     http://localhost:1007"
Write-Host ""
Write-Host "📝 Logs are in: .\logs\" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔍 Check service status: .\check-services.ps1" -ForegroundColor Cyan
Write-Host "🛑 Stop all services: .\stop-all.ps1" -ForegroundColor Cyan
Write-Host ""

# Wait and test services
Start-Sleep -Seconds 3
Write-Host "🧪 Testing services..." -ForegroundColor Cyan
foreach ($service in $services) {
    $port = $service.port
    $serviceName = $service.name
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        Write-Host "  ✅ Port $port is responding" -ForegroundColor Green
    } catch {
        Write-Host "  ⏳ Port $port is starting..." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✨ All done! Services are running in background." -ForegroundColor Green
Write-Host "   View logs: Get-Content logs\<service-name>.log -Tail 20 -Wait" -ForegroundColor Gray
Write-Host ""
