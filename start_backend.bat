@echo off
echo ========================================
echo  System Resource Monitor - Backend Start
echo ========================================

cd /d "%~dp0backend"

echo.
echo [1/2] Creating virtual environment...
if not exist "venv" (
    python -m venv venv
)

echo.
echo [2/2] Installing dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo.
echo ========================================
echo  Starting Backend Server on port 8000
echo ========================================
echo.
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
