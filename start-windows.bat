@echo off
title OrbitApply
color 0A
echo.
echo  =====================================================
echo    OrbitApply — AI Job Search Assistant
echo  =====================================================
echo.

cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js is not installed.
    echo.
    echo  Please download and install Node.js from:
    echo  https://nodejs.org
    echo.
    echo  After installing, double-click this file again.
    echo.
    pause
    exit /b 1
)

where pnpm >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] pnpm is not installed.
    echo.
    echo  Open a Command Prompt and run:
    echo  npm install -g pnpm
    echo.
    echo  Then double-click this file again.
    echo.
    pause
    exit /b 1
)

if not exist ".env" (
    echo  [ERROR] .env file not found.
    echo.
    echo  You need to create a .env file with your API keys.
    echo  Please follow the setup guide: OrbitApplySetup.md
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo  Installing app components for the first time...
    echo  This may take 1-3 minutes. Please wait.
    echo.
    pnpm install
    echo.
)

echo  Starting OrbitApply...
echo  Opening your browser in 4 seconds...
echo.
echo  To stop the app: close this window or press Ctrl+C
echo.

start /b "" cmd /c "timeout /t 4 /nobreak >nul && start http://localhost:3000"

node index.js

echo.
echo  OrbitApply has stopped.
pause
