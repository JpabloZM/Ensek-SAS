@echo off
echo ===================================================
echo ENSEK-SAS End-to-End Authentication Flow Test
echo ===================================================

echo.
echo Checking if backend is running...
curl -s http://localhost:5000/api/health > nul
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Backend is not running! Please start the backend first.
    echo.
    echo You can use "npm run dev" in the server directory to start the backend.
    pause
    exit /b 1
)

echo Backend is running!
echo.

cd server

echo Starting Authentication API test...
node testEndToEnd.js

echo.
echo ===================================================
echo FRONTEND REDIRECTION TEST INSTRUCTIONS
echo ===================================================
echo.
echo After the API tests complete, manually test the frontend:
echo.
echo 1. Open your browser to http://localhost:5173
echo 2. Click "Login" and use credentials:
echo    - Email: e2etest@example.com
echo    - Password: password123
echo.
echo 3. Observe redirection after login - should go to /cliente
echo 4. Check the AuthDebug panel to verify authentication
echo 5. Use the logout button in the AuthDebug panel
echo.
echo 6. Now try admin login:
echo    - Email: e2eadmin@example.com
echo    - Password: admin123
echo.
echo 7. Observe redirection after login - should go to /admin/dashboard
echo ===================================================
echo.

pause
