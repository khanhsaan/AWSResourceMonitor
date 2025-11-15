@echo off
REM ==============================
REM INSTALL AWS CLI (if not found)
REM ==============================

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

IF EXIST venv (
    rmdir /s /q venv
)

python -m venv venv

call venv\Scripts\activate
pip install "fastapi[standard]"
pip install -r requirements.txt

echo === Starting backend (FastAPI) in new terminal ===
start cmd /k "cd AWSUsageScript && call venv\Scripts\activate && fastapi dev usageScript.py"