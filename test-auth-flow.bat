@echo off
echo ====================================================
echo ENSEK-SAS Authentication Flow Test
echo ====================================================

rem Step 1: Start servers
echo Step 1: Starting Server...
echo ----------------------------------------------------

cd server
start /B npm start
timeout /t 5

echo ----------------------------------------------------
echo Step 2: Testing API endpoints...
echo ----------------------------------------------------

rem Test health endpoint
echo Testing API health...
curl -s http://localhost:5000/api/health

rem Test user registration
echo.
echo Testing user registration...
curl -s -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Flow User\",\"email\":\"testflow@example.com\",\"password\":\"password123\",\"role\":\"user\",\"phone\":\"123-456-7890\",\"address\":\"123 Test St\"}"

rem Test user login
echo.
echo Testing user login...
curl -s -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"testflow@example.com\",\"password\":\"password123\"}"

echo.
echo ----------------------------------------------------
echo Authentication flow test completed!
echo ----------------------------------------------------

cd ..
echo Done!
