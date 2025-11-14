bash
#!/usr/bin/env bash

echo "========================================"
echo "       STOPPING AWS USAGE SCRIPT"
echo "========================================"

# Stop backend (FastAPI on port 8000)
echo "=== Stopping backend (FastAPI on port 8000) ==="
PIDS_8000=$(lsof -ti tcp:8000)
if [ -n "$PIDS_8000" ]; then
  echo "Killing processes on port 8000: $PIDS_8000"
  kill -9 $PIDS_8000 2>/dev/null
else
  echo "No processes found on port 8000."
fi

# Stop frontend (React dev server on port 3000)
echo "=== Stopping frontend (React dev server on port 3000) ==="
PIDS_3000=$(lsof -ti tcp:3000)
if [ -n "$PIDS_3000" ]; then
  echo "Killing processes on port 3000: $PIDS_3000"
  kill -9 $PIDS_3000 2>/dev/null
else
  echo "No processes found on port 3000."
fi

# Kill any remaining Node.js processes (React development server)
echo "=== Cleaning up Node.js processes ==="
NODE_PIDS=$(pgrep node)
if [ -n "$NODE_PIDS" ]; then
  echo "Killing node processes: $NODE_PIDS"
  kill -9 $NODE_PIDS 2>/dev/null
  echo "Node.js processes terminated."
else
  echo "No Node.js processes found."
fi

# Kill any Python processes that might be running the FastAPI server
echo "=== Cleaning up Python processes ==="
PY_PIDS=$(pgrep python)
if [ -n "$PY_PIDS" ]; then
  echo "Killing python processes: $PY_PIDS"
  kill -9 $PY_PIDS 2>/dev/null
  echo "Python processes terminated."
else
  echo "No Python processes found."
fi

echo "=== Cleanup complete ==="
echo "All frontend and backend services have been stopped."
echo "========================================"
