<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== TABLEBIT DATA CURATION ===\n\n";

// =============================================
// STEP 1: Restaurants to DELETE
// =============================================
$deleteRestIds = [1,2,3,4,5,7,10,11,12,13,16,17,19,20,21,22,24,25];
echo "Deleting " . count($deleteRestIds) . " restaurants...\n";

// Delete in FK order
$tables = ['reservas', 'resenas', 'favoritos', 'imagenes', 'horario_dias', 'restaurant_hours', 'mesas', 'restaurant_user'];
foreach ($tables as $table) {
    $count = DB::table($table)->whereIn('restaurante_id', $deleteRestIds)->delete();
    echo "  $table: deleted $count records\n";
}

// Now delete restaurants
$delCount = App\Models\Restaurante::whereIn('id', $deleteRestIds)->forceDelete();
echo "  restaurantes: deleted $delCount records\n\n";

// =============================================
// STEP 2: Users to DELETE
// =============================================
// Keep these users:
//   id=15 Super Admin (superadmin)
//   id=46 Sofía Martínez (admin_restaurante - manages kept restaurants)
//   id=55 Angie Duarte (admin_restaurante - manages España)
//   id=66 adoptame (cliente - real email, has reservations on kept restaurants?)
//   id=27 Johan Mantilla (cliente - real email)
//   id=44 Manuel Leon (cliente - real email)
//   id=64 Magdali León (cliente - real email)
//   id=30 Jose (j.m_leon@hotmail.com)
//   id=42 Manuel Leon (manuel.test@hotmail.com)
//   id=58 jose arimate (josarprueba1@gmail.com)
//   id=59 mojica 14111 (mojica14111@gmail.com)
//   id=43 Gmail Demo (demo-gmail@hotmail.com)
//   id=56 prueb1123 (prube12334@gmail.com)

// Users to delete based on pattern matching:
$deleteUserIds = [];

$allUsers = App\Models\Usuario::all();
foreach ($allUsers as $u) {
    $name = strtolower($u->name);
    $email = strtolower($u->email);
    
    // ALWAYS KEEP these
    $keepIds = [15, 46, 55, 66, 27, 44, 64, 30, 42, 58, 59, 43, 56, 2];
    
    if (in_array($u->id, $keepIds)) continue;
    
    // Delete test/fake patterns
    $isFake = false;
    if (preg_match('/^(test|qa|e2e|runtime|avatar|diag|f5|email|mailtrap|mt-)/i', $name)) $isFake = true;
    if (preg_match('/^(test|qa|e2e|runtime|avatar|diag|f5|email|mailtrap|mt-)/i', $email)) $isFake = true;
    if (preg_match('/@test\./i', $email)) $isFake = true;
    if (preg_match('/@tablebit\./i', $email)) $isFake = true;
    if (preg_match('/@demo\./i', $email)) $isFake = true;
    if (preg_match('/@example\./i', $email)) $isFake = true;
    if (preg_match('/^prueba\d/i', $name)) $isFake = true;
    
    // Don't delete admin_restaurante with assigned restaurants
    $restCount = $u->restaurantes()->count();
    if ($restCount > 0 && $u->role === 'admin_restaurante') $isFake = false;
    
    if ($isFake) $deleteUserIds[] = $u->id;
}

echo "Deleting " . count($deleteUserIds) . " users...\n";

// Also delete any orphan reservas for these users (on kept restaurants)
$reservasDel = DB::table('reservas')->whereIn('cliente_id', $deleteUserIds)->delete();
echo "  reservas (orphan): deleted $reservasDel records\n";

// Delete from pivot if any
$pivotDel = DB::table('restaurant_user')->whereIn('user_id', $deleteUserIds)->delete();
echo "  restaurant_user: deleted $pivotDel records\n";

// Now delete users
$userDel = App\Models\Usuario::whereIn('id', $deleteUserIds)->forceDelete();
echo "  usuarios: deleted $userDel records\n\n";

// =============================================
// STEP 3: CURATE KEPT RESTAURANTS
// =============================================
echo "=== Curating kept restaurants ===\n\n";

$kept = App\Models\Restaurante::whereIn('id', [6,8,9,14,15,18,23])->get();
foreach ($kept as $r) {
    echo "ID {$r->id}: {$r->nombre} (slug: {$r->slug})\n";
    echo "  Ciudad: {$r->ciudad}\n";
    echo "  Direccion: {$r->direccion}\n";
    echo "  Telefono: {$r->telefono}\n";
    echo "  Tipo comida: {$r->tipo_comida}\n";
    echo "  Capacidad: {$r->capacidad_total}\n";
    echo "  Descripcion: " . substr($r->descripcion ?? '', 0, 80) . "\n";
    echo "\n";
}

echo "\n=== CLEANUP COMPLETE ===\n";
echo "Remaining restaurants: " . App\Models\Restaurante::count() . "\n";
echo "Remaining users: " . App\Models\Usuario::count() . "\n";
echo "Remaining reservations: " . DB::table('reservas')->count() . "\n";
