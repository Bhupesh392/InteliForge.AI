@echo off
echo ========================================
echo   AI Code Platform Test Suite
echo ========================================
echo.

echo Testing Backend API...
cd backend
python -m pytest tests/ -v
if %errorlevel% neq 0 (
    echo Backend tests failed!
    pause
    exit /b 1
)

echo.
echo Testing Frontend...
cd ..\frontend
npm test -- --watchAll=false
if %errorlevel% neq 0 (
    echo Frontend tests failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   All Tests Passed! ✅
echo ========================================
pause