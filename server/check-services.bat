@echo off
REM Check status of all LMS microservices on Windows
echo Checking LMS Microservices Status...
echo.

set services=api-gateway auth-service user-service course-service content-service assessment-service report-service
set ports=1001 1002 1003 1004 1005 1006 1007
set /a running=0
set /a stopped=0

set /a index=0
for %%s in (%services%) do (
    set /a index+=1
    call :check_service %%s !index!
)

echo.
echo Summary: %running% running, %stopped% stopped
echo.

if %running%==7 (
    echo [OK] All services are running!
    echo.
    echo API Gateway: http://localhost:1001/api
    echo View logs: type logs\^<service-name^>.log
) else if %running% gtr 0 (
    echo [!] Some services are not running. Start them with: start-all.bat
) else (
    echo [X] No services are running. Start them with: start-all.bat
)
echo.
pause
exit /b

:check_service
set service_name=%1
set index=%2
for /f "tokens=%index%" %%p in ("%ports%") do set port=%%p

if exist logs\%service_name%.pid (
    for /f %%i in (logs\%service_name%.pid) do (
        tasklist /FI "PID eq %%i" 2>nul | find /i "node.exe" >nul
        if not errorlevel 1 (
            echo [OK] %service_name% is running on port %port% (PID: %%i^)
            set /a running+=1
        ) else (
            echo [X] %service_name% is not running (stale PID: %%i^)
            set /a stopped+=1
        )
    )
) else (
    echo [X] %service_name% is not running
    set /a stopped+=1
)
exit /b
