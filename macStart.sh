#!/bin/bash

# =============================
# INSTALL AWS CLI (if not found)
# =============================

echo "Checking for AWS CLI..."
if ! command -v aws &> /dev/null; then
    echo "AWS CLI not found. Installing via Homebrew..."
    if ! command -v brew &> /dev/null; then
        echo "Homebrew not found. Please install Homebrew first:"
        echo '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
        exit 1
    fi
    brew install awscli
else
    echo "AWS CLI is already installed."
fi

# ===========================
# SETUP VENV AND DEPENDENCIES
# ===========================

echo "=== Setting up Python virtual environment ==="
cd AWSUsageScript || exit

if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install "fastapi[standard]"
pip install -r requirements.txt

cd ..

# ===========================
# RUN BACKEND IN NEW TERMINAL
# ===========================
echo "=== Starting backend (FastAPI) in new terminal ==="
osascript -e 'tell app "Terminal" to do script "cd \"'"$(pwd)/AWSUsageScript"'\" && source venv/bin/activate && python usageScript.py"'

# ===========================
# RUN FRONTEND IN NEW TERMINAL
# ===========================
echo "=== Starting frontend (React) in new terminal ==="
osascript -e 'tell app "Terminal" to do script "cd \"'"$(pwd)/AWSUsageScriptUI"'\" && npm install && npm start"'
