@echo off
echo ===================================================
echo Starting TrustHire Backend (FastAPI + Uvicorn)...
echo ===================================================
cd /d "%~dp0backend"
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
