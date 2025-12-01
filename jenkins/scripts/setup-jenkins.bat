@echo off
REM Jenkins Setup Script for Windows

setlocal enabledelayedexpansion

cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   Jenkins Setup for Electronics Repair Shop            ║
echo ║              Windows Version                           ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if Docker is installed
echo [*] Checking prerequisites...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [X] Docker is not installed. Please install Docker Desktop for Windows.
    pause
    exit /b 1
)
echo [OK] Docker is installed

REM Check if Docker daemon is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [X] Docker daemon is not running. Please start Docker Desktop.
    pause
    exit /b 1
)
echo [OK] Docker daemon is running

REM Get project root
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR:~0,-8%"

echo.
echo [*] Starting Jenkins...
cd /d "%PROJECT_ROOT%"

REM Check if container is already running
docker ps | findstr "jenkins-master" >nul 2>&1
if not errorlevel 1 (
    echo [!] Jenkins is already running. Stopping it first...
    docker-compose -f jenkins/docker-compose-jenkins-simple.yml down
    timeout /t 2 /nobreak >nul
)

REM Start Jenkins
echo Starting Jenkins container...
docker-compose -f jenkins/docker-compose-jenkins-simple.yml up -d

if errorlevel 1 (
    echo [X] Failed to start Jenkins
    pause
    exit /b 1
)
echo [OK] Jenkins container started

REM Wait for Jenkins to be ready
echo.
echo [*] Waiting for Jenkins to start (this may take up to 60 seconds)...

set "attempts=0"
:wait_loop
if %attempts% geq 60 (
    echo.
    echo [!] Jenkins may still be starting. Check logs with:
    echo     docker logs jenkins-master
    goto skip_password
)

timeout /t 1 /nobreak >nul
curl -s http://localhost:8080 >nul 2>&1
if not errorlevel 1 (
    echo [OK] Jenkins is ready!
    goto get_password
)

set /a attempts=%attempts%+1
if %attempts% equ 30 (
    echo [*] Still waiting... this may take another 30 seconds
)
goto wait_loop

:get_password
REM Get initial admin password
echo.
echo [*] Getting Jenkins admin password...
timeout /t 2 /nobreak >nul

for /f "tokens=*" %%A in ('docker exec jenkins-master cat /var/jenkins_home/secrets/initialAdminPassword 2^>nul') do (
    set "JENKINS_PASSWORD=%%A"
)

if defined JENKINS_PASSWORD (
    echo [OK] Initial Admin Password: %JENKINS_PASSWORD%
) else (
    echo [!] Could not retrieve initial password. Jenkins may still be initializing.
    echo     Run this command to get the password:
    echo     docker exec jenkins-master cat /var/jenkins_home/secrets/initialAdminPassword
)

:skip_password
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║            Jenkins Setup Complete!                     ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo [*] Next Steps:
echo     1. Open Jenkins UI: http://localhost:8080
echo     2. Paste the admin password above
echo     3. Install suggested plugins
echo     4. Create admin user account
echo     5. Create new Pipeline job
echo.

echo [*] Useful Commands:
echo     View logs:              docker logs -f jenkins-master
echo     Check status:           docker-compose -f jenkins/docker-compose-jenkins-simple.yml ps
echo     Stop Jenkins:           docker-compose -f jenkins/docker-compose-jenkins-simple.yml down
echo     Stop and remove data:   docker-compose -f jenkins/docker-compose-jenkins-simple.yml down -v
echo.

echo [*] Important URLs:
echo     Jenkins:  http://localhost:8080
echo     Backend:  http://localhost:5062
echo     Frontend: http://localhost:5173
echo.

echo [OK] Setup complete!
echo.
pause
