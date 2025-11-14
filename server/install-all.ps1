# Install dependencies for all services on Windows (PowerShell)
Write-Host "📦 Installing dependencies for all LMS microservices..." -ForegroundColor Cyan
Write-Host ""

$services = @("api-gateway", "auth-service", "user-service", "course-service", 
              "content-service", "assessment-service", "report-service")

$totalPackages = 0

foreach ($serviceName in $services) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "📦 Installing $serviceName dependencies..." -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    
    Set-Location $serviceName
    
    # Run npm install and capture output
    $output = npm install 2>&1
    Write-Host $output
    
    # Count packages
    if (Test-Path "node_modules") {
        $packageCount = (Get-ChildItem "node_modules" -Directory).Count
        Write-Host "✅ Installed $packageCount packages for $serviceName" -ForegroundColor Green
        $totalPackages += $packageCount
    }
    
    Set-Location ..
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ All dependencies installed!" -ForegroundColor Green
Write-Host "📊 Total packages: $totalPackages" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Make sure .env files are configured" -ForegroundColor Gray
Write-Host "  2. Run: .\start-all.ps1" -ForegroundColor Gray
Write-Host ""
