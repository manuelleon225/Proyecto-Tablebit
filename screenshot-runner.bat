@echo off
cd /d "C:\Users\Manuel\Proyecto tableBit\tablebit-backend"
echo Starting Laravel server...
start /B php artisan serve --port=8000 > nul 2>&1
ping -n 6 127.0.0.1 > nul
echo Server started, testing health...
curl -s http://localhost:8000/api/health
echo.
echo Running Playwright screenshots...
cd /d "C:\Users\Manuel\Proyecto tableBit\tablebit-frontend"
node take-screenshots.cjs
echo Screenshots captured!
taskkill /f /im php.exe > nul 2>&1
echo Done!
