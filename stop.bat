@echo off
echo ========================================
echo        STOPPING AWS USAGE SCRIPT
echo ========================================

REM Kill processes by port numbers
echo === Stopping backend (FastAPI on port 8000) ===
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    echo Killing process with PID %%a
    taskkill /f /pid %%a 2>nul
)

echo === Stopping frontend (React dev server on port 3000) ===
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo Killing process with PID %%a
    taskkill /f /pid %%a 2>nul
)

REM Kill any remaining Node.js processes (React development server)
echo === Cleaning up Node.js processes ===
taskkill /f /im node.exe 2>nul
if %errorlevel% equ 0 (
    echo Node.js processes terminated.
) else (
    echo No Node.js processes found.
)

REM Kill any Python processes that might be running the FastAPI server
echo === Cleaning up Python processes ===
taskkill /f /im python.exe 2>nul
if %errorlevel% equ 0 (
    echo Python processes terminated.
) else (
    echo No Python processes found.
)

REM Kill any FastAPI specific processes
echo === Cleaning up FastAPI processes ===
for /f "tokens=2" %%a in ('tasklist /fi "imagename eq python.exe" /fo table /nh 2^>nul') do (
    taskkill /f /pid %%a 2>nul
)

echo === Cleanup complete ===
echo All frontend and backend services have been stopped.
echo ========================================
pause