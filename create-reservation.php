<?php
function callApi($url, $method = 'GET', $data = null, $token = null) {
    $ch = curl_init($url);
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($token) $headers[] = 'Authorization: Bearer ' . $token;
    
    $opts = [CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => $headers];
    if ($method === 'POST') {
        $opts[CURLOPT_POST] = true;
        $opts[CURLOPT_POSTFIELDS] = json_encode($data);
    }
    curl_setopt_array($ch, $opts);
    $res = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $httpCode, 'data' => json_decode($res, true)];
}

// 1. Login admin
$login = callApi('http://localhost:8000/api/login', 'POST', [
    'email' => 'admin@test.com', 'password' => 'admin123'
]);
echo "Login admin: " . $login['code'] . "\n";

// 2. Register new client
$rand = rand(1000, 9999);
$register = callApi('http://localhost:8000/api/register', 'POST', [
    'name' => 'TempUser' . $rand,
    'email' => "tempuser{$rand}@test.com",
    'password' => 'Cliente1!',
    'password_confirmation' => 'Cliente1!'
]);
echo "Register: " . $register['code'] . "\n";

$token = $register['data']['token'] ?? $login['data']['token'] ?? null;
if (!$token) { echo "ERROR: No token obtained\n"; exit(1); }

echo "Token: " . substr($token, 0, 30) . "...\n";

// 3. Check disponibilidad
$disp = callApi('http://localhost:8000/api/disponibilidad', 'POST', [
    'restaurante_id' => 8, 'fecha' => '2026-06-13', 'hora' => '20:00', 'personas' => 4
]);
echo "Disponibilidad: " . $disp['code'] . "\n";

// 4. Create reservation
$reserva = callApi('http://localhost:8000/api/reserva-automatica', 'POST', [
    'restaurante_id' => 8, 'fecha' => '2026-06-13', 'hora' => '20:00', 'cantidad_personas' => 4
], $token);
echo "Reserva: " . $reserva['code'] . "\n";

$reservaId = $reserva['data']['reserva']['id'] ?? 'ERROR';
echo "\n========================================\n";
echo "✅ RESERVA ID: " . $reservaId . "\n";
echo "   Estado: " . ($reserva['data']['reserva']['estado'] ?? 'N/A') . "\n";
echo "   Mesa: " . ($reserva['data']['reserva']['mesa_id'] ?? 'N/A') . "\n";
echo "========================================\n\n";

// Save result
file_put_contents(__DIR__ . '/reserva_result.json', json_encode($reserva['data'], JSON_PRETTY_PRINT));
echo "Resultado guardado en reserva_result.json\n";

// 5. Try cancel as another user (should fail 403)
$loginB = callApi('http://localhost:8000/api/login', 'POST', [
    'email' => 'carlos@demo.com', 'password' => 'password'
]);
$tokenB = $loginB['data']['token'] ?? null;
if ($tokenB) {
    $cancel = callApi("http://localhost:8000/api/reservas/{$reservaId}/cancelar", 'PATCH', null, $tokenB);
    echo "\nCancelar como otro usuario: " . $cancel['code'] . " - " . ($cancel['data']['message'] ?? 'OK') . "\n";
}
