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
        return true;
    }

    public function create(Usuario $user): bool
    {
        return in_array($user->role, ['admin', 'admin_restaurante', 'superadmin']);
    }

    public function update(Usuario $user, Restaurante $restaurante): bool
    {
        if (in_array($user->role, ['superadmin'])) return true;

        return $restaurante->user_id === $user->id
            || in_array($user->role, ['admin', 'admin_restaurante']);
    }

    public function delete(Usuario $user, Restaurante $restaurante): bool
    {
        if (in_array($user->role, ['superadmin'])) return true;

        return $restaurante->user_id === $user->id
            || $user->role === 'admin';
    }

    public function manageMesas(Usuario $user, Restaurante $restaurante): bool
    {
        return in_array($user->role, ['admin', 'admin_restaurante', 'superadmin'])
            && ($restaurante->user_id === $user->id || in_array($user->role, ['admin', 'superadmin']));
    }

    public function manageReservas(Usuario $user, Restaurante $restaurante): bool
    {
        return in_array($user->role, ['admin', 'admin_restaurante', 'superadmin'])
            && ($restaurante->user_id === $user->id || in_array($user->role, ['admin', 'superadmin']));
    }
}
