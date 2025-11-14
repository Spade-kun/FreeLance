@echo off
REM Install dependencies for all services on Windows
echo Installing dependencies for all LMS microservices...
echo.

set services=api-gateway auth-service user-service course-service content-service assessment-service report-service

for %%s in (%services%) do (
    echo ================================
    echo Installing %%s dependencies...
    echo ================================
    cd %%s
    call npm install
    cd ..
    echo.
)

echo.
echo ================================
echo All dependencies installed!
echo ================================
echo.
pause
