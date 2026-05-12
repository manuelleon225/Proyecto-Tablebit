<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RestauranteController;
use App\Http\Controllers\MesaController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\UsuarioController;

Route::get('/', function () {
    return view('welcome');
});
