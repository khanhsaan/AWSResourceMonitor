#!/bin/bash

echo "=========================================="
echo "       STARTING AWS USAGE SCRIPT"
echo "=========================================="

# =============================
# INSTALL AWS CLI (if not found)
# =============================

echo "Checking for AWS CLI..."
if ! command -v aws &> /dev/null; then
    echo "AWS CLI not found. Installing..."
    
    # Detect OS and install accordingly
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo "Installing AWS CLI for macOS..."
        curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
        sudo installer -pkg AWSCLIV2.pkg -target /
        rm AWSCLIV2.pkg
    else
        # Linux
        echo "Installing AWS CLI for Linux..."
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
        unzip awscliv2.zip
        sudo ./aws/install
        rm -rf awscliv2.zip aws/
    fi
    
    echo "AWS CLI installation complete."
else
    echo "AWS CLI is already installed."
fi

# ===========================
# SETUP VENV AND DEPENDENCIES
# ===========================

echo "=== Setting up Python virtual environment ==="
cd AWSUsageScript

if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install "fastapi[standard]"
pip install -r requirements.txt

cd ..

# ===========================
# RUN BACKEND IN BACKGROUND
# ===========================
echo "=== Starting backend (FastAPI) ==="
cd AWSUsageScript
source venv/bin/activate

# Start backend in background
nohup fastapi dev usageScript.py --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"
echo $BACKEND_PID > ../backend.pid

cd ..

# Wait a moment for backend to start
sleep 3

# ===========================
# RUN FRONTEND IN BACKGROUND
# ===========================
echo "=== Starting frontend (React) ==="
cd AWSUsageScriptUI

# Install dependencies if needed
npm install

# Start frontend in background
nohup npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"
echo $FRONTEND_PID > ../frontend.pid

cd ..

echo "=========================================="
echo "  Both services are starting up..."
echo "  Backend: http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo "  "
echo "  Check logs:"
echo "  Backend: tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo "  "
echo "  To stop services: ./stop.sh"
echo "=========================================="