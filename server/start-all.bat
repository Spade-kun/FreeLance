@echo off
REM Start all LMS microservices on Windows
echo Starting LMS Microservices...
echo.

REM Array of services
set services=api-gateway auth-service user-service course-service content-service assessment-service report-service
set ports=1001 1002 1003 1004 1005 1006 1007

REM Create logs directory if it doesn't exist
if not exist logs mkdir logs

REM Stop any existing services
echo Stopping existing services...
for %%s in (%services%) do (
    if exist logs\%%s.pid (
        for /f %%p in (logs\%%s.pid) do (
            taskkill /PID %%p /F >nul 2>&1
        )
        del logs\%%s.pid
    )
)
echo.

REM Start all services
echo Starting services...
set /a index=0
for %%s in (%services%) do (
    set /a index+=1
    call :start_service %%s !index!
)

echo.
echo ================================
echo All services started!
echo ================================
echo.
echo Service URLs:
echo   API Gateway:        http://localhost:1001
echo   Auth Service:       http://localhost:1002
echo   User Service:       http://localhost:1003
echo   Course Service:     http://localhost:1004
echo   Content Service:    http://localhost:1005
echo   Assessment Service: http://localhost:1006
echo   Report Service:     http://localhost:1007
echo.
echo Logs are in: .\logs\
echo.
echo Check service status: check-services.bat
echo Stop all services: stop-all.bat
echo.
pause
exit /b

:start_service
set service_name=%1
set index=%2
for /f "tokens=%index%" %%p in ("%ports%") do set port=%%p

cd %service_name%
start /B cmd /c "npm run dev > ..\logs\%service_name%.log 2>&1"
timeout /t 1 >nul

REM Get the PID (Windows doesn't make this easy, so we'll use netstat)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%port%" ^| findstr "LISTENING"') do (
    echo %%a > ..\logs\%service_name%.pid
    echo [OK] %service_name% started on port %port% (PID: %%a^)
    goto :found_pid
)
:found_pid

cd ..
exit /b
