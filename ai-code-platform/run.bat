@echo off
echo ========================================
echo   AI Code Platform Quick Start
echo ========================================
echo.

echo Starting Backend...
start cmd /k "cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend...
start cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo   Services Starting...
echo ========================================
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo ========================================

pause