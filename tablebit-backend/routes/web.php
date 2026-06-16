<?php

use Illuminate\Support\Facades\Route;

use App\Models\Restaurante;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/password/reset/{token}', function ($token) {
    $email = request('email');
    return redirect(env('FRONTEND_URL', 'http://localhost:8080') . '/reset-password?token=' . urlencode($token) . '&email=' . urlencode($email));
})->name('password.reset');

Route::get('/sitemap.xml', function () {
    $restaurantes = Restaurante::where('estado', 'activo')->whereNotNull('slug')->get(['slug', 'updated_at']);

    return response()->view('sitemap', [
        'restaurantes' => $restaurantes,
        'url' => config('app.url', 'https://tablebit.com'),
    ])->header('Content-Type', 'text/xml');
});

Route::middleware(['auth:sanctum', \App\Http\Middleware\RoleMiddleware::class . ':admin,superadmin'])->group(function () {
    Route::get('/pulse', function () {
        return view('vendor.pulse.dashboard');
    });
});

