<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\Mesa;

class MesaPolicy
{
    public function view(Usuario $user, Mesa $mesa): bool
    {
        // Admin roles can view if they manage the restaurant
        if (in_array($user->role, ['admin', 'admin_restaurante', 'superadmin'])) {
            if ($user->role === 'superadmin' || $user->role === 'admin') return true;
            return $user->restaurantes()->where('restaurante_id', $mesa->restaurante_id)->exists();
        }
        return true; // public can view
    }

    public function create(Usuario $user): bool
    {
        return in_array($user->role, ['admin', 'admin_restaurante', 'superadmin']);
    }

    public function update(Usuario $user, Mesa $mesa): bool
    {
        if (in_array($user->role, ['superadmin', 'admin'])) return true;
        return $user->restaurantes()->where('restaurante_id', $mesa->restaurante_id)->exists();
    }

    public function delete(Usuario $user, Mesa $mesa): bool
    {
        if (in_array($user->role, ['superadmin', 'admin'])) return true;
        return $user->restaurantes()->where('restaurante_id', $mesa->restaurante_id)->exists();
    }
}
