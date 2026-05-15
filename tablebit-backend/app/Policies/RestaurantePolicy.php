<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\Restaurante;

class RestaurantePolicy
{
    public function viewAny(Usuario $user): bool
    {
        return true;
    }

    public function view(Usuario $user, Restaurante $restaurante): bool
    {
        return true; // public API — anyone can view restaurant details
    }

    public function create(Usuario $user): bool
    {
        return in_array($user->role, ['admin', 'admin_restaurante', 'superadmin']);
    }

    public function update(Usuario $user, Restaurante $restaurante): bool
    {
        if ($user->role === 'superadmin') return true;
        if ($user->role === 'admin') return true;
        // Check via pivot
        return $user->restaurantes()->where('restaurante_id', $restaurante->id)->exists();
    }

    public function delete(Usuario $user, Restaurante $restaurante): bool
    {
        if ($user->role === 'superadmin') return true;
        if ($user->role === 'admin') return true;
        return $user->restaurantes()->where('restaurante_id', $restaurante->id)->exists();
    }

    public function manageMesas(Usuario $user, Restaurante $restaurante): bool
    {
        if (in_array($user->role, ['superadmin', 'admin'])) return true;
        return $user->restaurantes()->where('restaurante_id', $restaurante->id)->wherePivot('role', 'owner')->exists();
    }

    public function manageReservas(Usuario $user, Restaurante $restaurante): bool
    {
        if (in_array($user->role, ['superadmin', 'admin'])) return true;
        return $user->restaurantes()->where('restaurante_id', $restaurante->id)->exists();
    }
}
