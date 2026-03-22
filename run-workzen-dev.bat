@echo off
setlocal

cd /d "%~dp0"

echo Starting WorkZen development servers...
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:5173
echo.

start "WorkZen Backend" cmd /k "cd /d %~dp0 && npm run dev:backend"
start "WorkZen Frontend" cmd /k "cd /d %~dp0 && npm run dev:frontend"

endlocal
