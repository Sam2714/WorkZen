@echo off
setlocal

cd /d "%~dp0"

echo Building WorkZen side panel extension...
call npm --prefix frontend run build
if errorlevel 1 (
  echo.
  echo Build failed.
  exit /b 1
)

echo.
echo Extension build is ready in:
echo %~dp0frontend\dist
echo.
echo Next:
echo 1. Open chrome://extensions or edge://extensions
echo 2. Turn on Developer mode
echo 3. Click Load unpacked
echo 4. Select the frontend\dist folder

endlocal
