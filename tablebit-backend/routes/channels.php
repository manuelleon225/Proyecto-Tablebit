<?php

use App\Models\Restaurante;
use App\Models\Usuario;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('restaurant.{restauranteId}', function (Usuario $user, int $restauranteId) {
    if (in_array($user->role, ['superadmin', 'admin'])) return true;
    return Restaurante::where('id', $restauranteId)->where('user_id', $user->id)->exists();
});
