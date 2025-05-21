#!/bin/bash
# start.sh - Script to start both frontend and backend together

echo "Starting ENSEK-SAS application..."

# Start the backend server
cd ./server && npm start &
SERVER_PID=$!

# Wait a moment for the server to initialize
sleep 2

# Start the frontend
cd .. && npm run dev &
FRONTEND_PID=$!

# Function to handle process termination
cleanup() {
  echo "Stopping services..."
  kill $SERVER_PID
  kill $FRONTEND_PID
  exit 0
}

# Register the cleanup function for termination signals
trap cleanup SIGINT SIGTERM

# Keep the script running
wait
