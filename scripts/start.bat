@echo off
echo Starting ENSEK-SAS application...

cd ..\server
start cmd /k npm run dev

cd ..
start cmd /k npm run dev

echo Both frontend and backend servers are running.
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000
