<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RestauranteController;
use App\Http\Controllers\MesaController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ImagenController;
use App\Http\Controllers\ResenaController;
use App\Http\Controllers\FavoritoController;
use App\Http\Controllers\HorarioDiaController;
use App\Http\Controllers\PasswordResetController;

Route::get('/test', function () {
    return response()->json(['message' => 'API de TableBit funcionando']);
});

// Auth public
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login',    [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/password/forgot', [PasswordResetController::class, 'sendResetLink'])->middleware('throttle:5,1');
Route::post('/password/reset',  [PasswordResetController::class, 'reset'])->middleware('throttle:5,1');

// Disponibilidad (pública)
Route::post('/disponibilidad', [ReservaController::class, 'disponibilidad'])->middleware('throttle:30,1');

// Restaurantes públicos
Route::get('/restaurantes', [RestauranteController::class, 'index']);
Route::get('/buscar-restaurantes', [RestauranteController::class, 'buscar']);
Route::get('/restaurantes/{id}', [RestauranteController::class, 'show']);
Route::get('/restaurantes/{id}/public', [RestauranteController::class, 'showPublic']);
Route::get('/restaurantes/{id}/resenas', [ResenaController::class, 'index']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/usuarios/me', [UsuarioController::class, 'me']);
    Route::put('/usuarios/me', [UsuarioController::class, 'updateMe']);
    Route::patch('/usuarios/me', [UsuarioController::class, 'updateMe']);

    // Restaurantes (admin)
    Route::post('/restaurantes', [RestauranteController::class, 'store'])
        ->middleware('role:admin,admin_restaurante,superadmin');
    Route::put('/restaurantes/{id}', [RestauranteController::class, 'update'])
        ->middleware('role:admin,admin_restaurante,superadmin');
    Route::delete('/restaurantes/{id}', [RestauranteController::class, 'destroy'])
        ->middleware('role:admin,admin_restaurante,superadmin');
    Route::get('/mis-restaurantes', [RestauranteController::class, 'misRestaurantes'])
        ->middleware('role:admin,admin_restaurante,superadmin');

    // Imagenes
    Route::post('/restaurantes/{id}/imagenes', [ImagenController::class, 'subirImagen'])
        ->middleware('role:admin,admin_restaurante,superadmin');
    Route::delete('/imagenes/{id}', [ImagenController::class, 'eliminarImagen'])
        ->middleware('role:admin,admin_restaurante,superadmin');

    // Mesas
    Route::get('/mesas', [MesaController::class, 'index']);
    Route::get('/mesas/restaurante/{restauranteId}', [MesaController::class, 'delRestaurante']);
    Route::post('/mesas', [MesaController::class, 'store'])
        ->middleware('role:admin,admin_restaurante,superadmin');
    Route::put('/mesas/{id}', [MesaController::class, 'update'])
        ->middleware('role:admin,admin_restaurante,superadmin');
    Route::delete('/mesas/{id}', [MesaController::class, 'destroy'])
        ->middleware('role:admin,admin_restaurante,superadmin');

    // Reservas - Cliente
    Route::post('/reservas', [ReservaController::class, 'store']);
    Route::post('/reserva-automatica', [ReservaController::class, 'reservaAutomatica']);
    Route::get('/mis-reservas', [ReservaController::class, 'misReservas']);
    Route::patch('/reservas/{id}/cancelar', [ReservaController::class, 'cancelar']);

    // Reservas - Admin (cualquier rol admin)
    Route::get('/reservas', [ReservaController::class, 'index'])
        ->middleware('role:admin,admin_restaurante,superadmin');
    Route::get('/reservas/{id}', [ReservaController::class, 'show'])
        ->middleware('role:admin,admin_restaurante,superadmin');
    Route::put('/reservas/{id}', [ReservaController::class, 'update'])
        ->middleware('role:admin,admin_restaurante,superadmin');
    Route::patch('/reservas/{id}/estado', [ReservaController::class, 'cambiarEstado'])
        ->middleware('role:admin,admin_restaurante,superadmin');

    // Dashboard & Analytics
    Route::get('/dashboard/restaurante/{restauranteId}', [ReservaController::class, 'dashboardRestaurante'])
        ->middleware('role:admin,admin_restaurante,superadmin');

    // Calendario
    Route::get('/calendario/restaurante/{restauranteId}', [ReservaController::class, 'calendarioRestaurante'])
        ->middleware('role:admin,admin_restaurante,superadmin');

    // Horarios
    Route::get('/restaurantes/{restauranteId}/horarios', [HorarioDiaController::class, 'index']);
    Route::post('/restaurantes/{restauranteId}/horarios', [HorarioDiaController::class, 'store'])
        ->middleware('role:admin,admin_restaurante,superadmin');
    Route::put('/horarios/{id}', [HorarioDiaController::class, 'update'])
        ->middleware('role:admin,admin_restaurante,superadmin');
    Route::delete('/horarios/{id}', [HorarioDiaController::class, 'destroy'])
        ->middleware('role:admin,admin_restaurante,superadmin');
    Route::post('/restaurantes/{restauranteId}/horarios/seed', [HorarioDiaController::class, 'seedDefaults'])
        ->middleware('role:admin,admin_restaurante,superadmin');

    // Reseñas
    Route::post('/restaurantes/{restauranteId}/resenas', [ResenaController::class, 'store']);
    Route::get('/mis-resenas', [ResenaController::class, 'misResenas']);
    Route::delete('/resenas/{id}', [ResenaController::class, 'destroy']);

    // Favoritos
    Route::get('/favoritos', [FavoritoController::class, 'index']);
    Route::post('/favoritos/{restauranteId}', [FavoritoController::class, 'toggle']);
    Route::get('/favoritos/{restauranteId}/verificar', [FavoritoController::class, 'verificar']);

    // Resource routes (fallback)
    Route::apiResource('usuarios', UsuarioController::class)->except(['me']);
});
