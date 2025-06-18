#!/bin/bash
echo "Stopping any running node processes..."
pkill -f "node.*server/index.js" || true

echo "Installing dependencies..."
npm install

echo "Starting server..."
node index.js
