@echo off
ECHO =====================================================
ECHO ENSEK-SAS Authentication Test and Troubleshooting
ECHO =====================================================

ECHO.
ECHO This script will:
ECHO 1. Run backend API authentication test
ECHO 2. Configure redirect testing
ECHO 3. Open browser to our debug utilities
ECHO.

cd server

ECHO Running Auth API Tests...
node testEndToEnd.js

ECHO.
ECHO =====================================================
ECHO Opening Authentication Debug Utilities
ECHO =====================================================
ECHO.

start "" "http://localhost:5173/auth-debug"

ECHO.
ECHO After server responds, try these tests:
ECHO 1. Login with regular user: user@test.com / user123
ECHO   - Should redirect to /cliente
ECHO.
ECHO 2. Login with admin user: admin@test.com / admin123
ECHO   - Should redirect to /admin/dashboard
ECHO.
ECHO If you experience issues:
ECHO - Open /auth-debug.html for diagnostics
ECHO - Check browser console for error messages
ECHO - Use AuthDebug component in bottom right corner
ECHO.

pause
