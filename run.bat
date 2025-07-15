@echo off
REM =============================
REM INSTALL AWS CLI (if not found)
REM =============================

echo Checking for AWS CLI...
where aws >nul 2>&1

IF %ERRORLEVEL% NEQ 0 (
    echo AWS CLI not found. Installing from official source...
    msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi /qn
    echo AWS CLI installation triggered. Waiting for setup to complete...
    timeout /t 10 >nul
) ELSE (
    echo AWS CLI is already installed.
)

REM ===========================
REM SETUP VENV AND DEPENDENCIES
REM ===========================

echo === Setting up Python virtual environment ===
cd AWSUsageScript

IF NOT EXIST venv (
    python -m venv venv
)

call venv\Scripts\activate
pip install "fastapi[standard]"
pip install -r requirements.txt

cd ..

REM ===========================
REM RUN BACKEND IN NEW TERMINAL
REM ===========================
echo === Starting backend (FastAPI) in new terminal ===
start cmd /k "cd AWSUsageScript && call venv\Scripts\activate && fastapi dev usageScript.py --port 8000"

REM ===========================
REM RUN FRONTEND IN NEW TERMINAL
REM ===========================
echo === Starting frontend (React) in new terminal ===
start cmd /k "cd AWSUsageScriptUI && npm install && npm start"
