@echo off
setlocal

cd /d "%~dp0"

echo Building frontend and starting WorkZen production server...
echo App URL: http://localhost:4000
echo.

call npm run build
if errorlevel 1 (
  echo Build failed.
  exit /b 1
)

call npm start

endlocal
