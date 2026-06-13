@echo off
cd /d "C:\Users\Manuel\Proyecto tableBit\tablebit-backend"
echo Starting Laravel server...
start /B php artisan serve --port=8000 > nul 2>&1
ping -n 7 127.0.0.1 > nul

echo.
echo Running reservation test...
cd /d "C:\Users\Manuel\Proyecto tableBit"
php create-reservation.php

echo.
taskkill /f /im php.exe > nul 2>&1
echo Done!
