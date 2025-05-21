@echo off
REM start-app.bat - Script to start both frontend and backend together

echo Starting ENSEK-SAS application...

REM Start the backend server in a new window
start cmd /k "cd server && npm start"

REM Wait a moment for the server to initialize
timeout /t 2 /nobreak >nul

REM Start the frontend in a new window
start cmd /k "npm run dev"

echo Application started. Close this window to stop all processes.
pause
