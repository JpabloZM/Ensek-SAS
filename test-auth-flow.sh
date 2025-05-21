#!/bin/bash

# Script to test the complete authentication flow

echo "===================================================="
echo "ENSEK-SAS Authentication Flow Test"
echo "===================================================="

# Step 1: Start servers
echo "Step 1: Starting MongoDB, Server and Client..."
echo "----------------------------------------------------"

# Check if servers are already running
server_pid=$(pgrep -f "node server/index.js")
client_pid=$(pgrep -f "npm run dev")

if [ ! -z "$server_pid" ]; then
  echo "Server is already running (PID: $server_pid)"
else
  echo "Starting server..."
  cd server && npm start &
  server_pid=$!
  echo "Server started with PID: $server_pid"
  # Give server time to start
  sleep 5
fi

echo "----------------------------------------------------"
echo "Step 2: Testing API endpoints..."
echo "----------------------------------------------------"

# Test API health endpoint
echo "Testing API health..."
health_response=$(curl -s http://localhost:5000/api/health)
echo "Health response: $health_response"

# Test user registration
echo -e "\nTesting user registration..."
register_response=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Flow User",
    "email": "testflow@example.com",
    "password": "password123",
    "role": "user",
    "phone": "123-456-7890",
    "address": "123 Test St"
  }')
echo "Registration response: $register_response"

# Test user login
echo -e "\nTesting user login..."
login_response=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testflow@example.com",
    "password": "password123"
  }')
echo "Login response: $login_response"

# Extract token from login response
token=$(echo $login_response | grep -o '"token":"[^"]*' | sed 's/"token":"//')

# Test profile endpoint with token
if [ ! -z "$token" ]; then
  echo -e "\nTesting profile endpoint with token..."
  profile_response=$(curl -s http://localhost:5000/api/auth/profile \
    -H "Authorization: Bearer $token")
  echo "Profile response: $profile_response"
else
  echo "Failed to extract token from login response"
fi

echo "----------------------------------------------------"
echo "Authentication flow test completed!"
echo "----------------------------------------------------"

# Clean up - uncomment these lines if you want to stop the servers after the test
# echo "Stopping servers..."
# if [ ! -z "$server_pid" ]; then
#   kill $server_pid
# fi
# if [ ! -z "$client_pid" ]; then
#   kill $client_pid
# fi

echo "Done!"
