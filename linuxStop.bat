#!/bin/bash

echo "========================================="
echo "        STOPPING AWS USAGE SCRIPT"
echo "========================================="

# Kill backend process
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    echo "=== Stopping backend (PID: $BACKEND_PID) ==="
    if ps -p $BACKEND_PID > /dev/null; then
        kill $BACKEND_PID
        echo "Backend process killed."
    else
        echo "Backend process not running."
    fi
    rm backend.pid
fi

# Kill frontend process
if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    echo "=== Stopping frontend (PID: $FRONTEND_PID) ==="
    if ps -p $FRONTEND_PID > /dev/null; then
        kill $FRONTEND_PID
        echo "Frontend process killed."
    else
        echo "Frontend process not running."
    fi
    rm frontend.pid
fi

# Kill any remaining processes on ports 8000 and 3000
echo "=== Cleaning up processes on ports 8000 and 3000 ==="

# Kill processes on port 8000 (backend)
BACKEND_PIDS=$(lsof -ti:8000 2>/dev/null)
if [ ! -z "$BACKEND_PIDS" ]; then
    echo "Killing processes on port 8000: $BACKEND_PIDS"
    kill $BACKEND_PIDS 2>/dev/null
fi

# Kill processes on port 3000 (frontend)
FRONTEND_PIDS=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$FRONTEND_PIDS" ]; then
    echo "Killing processes on port 3000: $FRONTEND_PIDS"
    kill $FRONTEND_PIDS 2>/dev/null
fi

# Clean up log files (optional)
echo "=== Cleaning up log files ==="
rm -f backend.log frontend.log

echo "=== Cleanup complete ==="
echo "All frontend and backend services have been stopped."
echo "========================================="