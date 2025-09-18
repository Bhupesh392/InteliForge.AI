@echo off
echo ========================================
echo   AI Code Platform Manual Testing
echo ========================================
echo.

echo Starting services for manual testing...
echo.

echo 1. Starting Backend...
start "Backend" cmd /k "cd backend && python -m uvicorn app.main:app --reload"

timeout /t 3 /nobreak > nul

echo 2. Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo   Manual Test Checklist:
echo ========================================
echo.
echo ✅ 1. Open http://localhost:3000
echo ✅ 2. Check dashboard loads
echo ✅ 3. Test navigation menu
echo ✅ 4. Try code generation:
echo      - Input: "create a hello world function"
echo      - Language: Python
echo ✅ 5. Test mobile view (resize browser)
echo ✅ 6. Check API docs: http://localhost:8000/docs
echo.
echo Press any key when testing is complete...
pause

echo.
echo Stopping services...
taskkill /f /im python.exe 2>nul
taskkill /f /im node.exe 2>nul
echo Services stopped.