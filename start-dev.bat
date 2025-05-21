@echo off
echo ====================================================
echo ENSEK-SAS Development Environment Startup
echo ====================================================

echo Starting Backend Server...
cd server && start /B npm start
echo Backend server started!

echo.
echo Starting Frontend Development Server...
cd ..
start /B npm run dev
echo Frontend development server started!

echo.
echo ====================================================
echo ENSEK-SAS Environment Ready!
echo ====================================================
echo.
echo Backend running at: http://localhost:5000
echo Frontend running at: http://localhost:5173
echo.
echo Press any key to stop all servers...

pause
taskkill /f /im node.exe
