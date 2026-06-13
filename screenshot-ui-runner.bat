@echo off
cd /d "C:\Users\Manuel\Proyecto tableBit\tablebit-backend"
echo Starting Laravel backend...
start /B php artisan serve --port=8000 > nul 2>&1

cd /d "C:\Users\Manuel\Proyecto tableBit\tablebit-frontend"
echo Starting Vite frontend...
start /B cmd.exe /c "npm run dev -- --port=5173" > nul 2>&1

echo Waiting for servers...
ping -n 10 127.0.0.1 > nul

echo Both servers should be ready now
echo.
echo Running UI screenshot script...
node take-ui-screenshots.cjs
echo.
echo Done! Cleaning up...
taskkill /f /im php.exe > nul 2>&1
taskkill /f /im node.exe > nul 2>&1
