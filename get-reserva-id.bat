@echo off
cd /d "C:\Users\Manuel\Proyecto tableBit\tablebit-backend"
echo Starting Laravel server...
start /B php artisan serve --port=8000 > nul 2>&1
ping -n 7 127.0.0.1 > nul

echo Creating reservation...
curl -s -X POST http://localhost:8000/api/login -H "Content-Type: application/json" -d "{\"email\":\"admin@test.com\",\"password\":\"admin123\"}" > login.json
for /f "tokens=*" %%a in ('type login.json ^| findstr "token"') do set token_line=%%a
echo Login response saved

curl -s -X POST http://localhost:8000/api/register -H "Content-Type: application/json" -d "{\"name\":\"TempUser\",\"email\":\"tempuser%daterandome%@test.com\",\"password\":\"Cliente1!\",\"password_confirmation\":\"Cliente1!\"}" > register.json
for /f "tokens=*" %%a in ('type register.json ^| findstr "token"') do set token_line2=%%a
echo Register response saved

:: Use PHP to parse and make the reservation
php -r "
\$login = json_decode(file_get_contents('login.json'), true);
\$register = json_decode(file_get_contents('register.json'), true);
\$token = \$register['token'] ?? \$login['token'];
echo 'Token: ' . substr(\$token, 0, 30) . '...\n';

\$ch = curl_init('http://localhost:8000/api/reserva-automatica');
curl_setopt_array(\$ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Authorization: Bearer ' . \$token, 'Accept: application/json'],
    CURLOPT_POSTFIELDS => json_encode(['restaurante_id' => 8, 'fecha' => '2026-06-15', 'hora' => '20:00', 'cantidad_personas' => 4]),
    CURLOPT_RETURNTRANSFER => true
]);
\$res = json_decode(curl_exec(\$ch), true);
curl_close(\$ch);
echo 'Reserva ID: ' . (\$res['reserva']['id'] ?? 'ERROR') . '\n';
echo 'Estado: ' . (\$res['reserva']['estado'] ?? 'ERROR') . '\n';
file_put_contents('reserva_result.json', json_encode(\$res, JSON_PRETTY_PRINT));
"

echo.
echo Done! Check reserva_result.json for details.
taskkill /f /im php.exe > nul 2>&1
