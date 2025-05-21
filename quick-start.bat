@echo off
echo ====================================================
echo ENSEK-SAS Quick Setup and Start
echo ====================================================

echo Creating test users...
cd server && npm run create-test-user
echo Test users created!

echo.
echo Starting Backend Server...
start cmd /k npm start
echo Backend server started!

echo.
echo Starting Frontend Development Server...
cd ..
start cmd /k npm run dev
echo Frontend development server started!

echo.
echo ====================================================
echo ENSEK-SAS Environment Ready!
echo ====================================================
echo.
echo Backend running at: http://localhost:5000
echo Frontend running at: http://localhost:5173
echo.
echo LOGIN CREDENTIALS:
echo - User: email=user@test.com, password=user123
echo - Admin: email=admin@test.com, password=admin123
echo.
echo Press any key to exit this script (servers will continue running)...
pause
