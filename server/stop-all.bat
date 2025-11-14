@echo off
REM Stop all LMS microservices on Windows
echo Stopping LMS Microservices...
echo.

set services=api-gateway auth-service user-service course-service content-service assessment-service report-service
set /a stopped=0

for %%s in (%services%) do (
    if exist logs\%%s.pid (
        for /f %%p in (logs\%%s.pid) do (
            taskkill /PID %%p /F >nul 2>&1
            if not errorlevel 1 (
                echo [OK] Stopped %%s (PID: %%p^)
                set /a stopped+=1
            ) else (
                echo [!] %%s was not running
            )
        )
        del logs\%%s.pid
    ) else (
        echo [!] %%s was not running
    )
)

echo.
if %stopped% gtr 0 (
    echo Stopped %stopped% service(s^)
) else (
    echo No services were running
)
echo.
pause
