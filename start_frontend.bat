@echo off
echo ========================================
echo  System Resource Monitor - Frontend Start
echo ========================================

cd /d "%~dp0frontend"

echo.
echo [1/2] Installing dependencies...
call npm install

echo.
echo ========================================
echo  Starting Frontend Dev Server on port 5173
echo ========================================
echo.
npm run dev
