<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\Mesa;

class MesaPolicy
{
    public function view(Usuario $user, Mesa $mesa): bool
    {
        if (in_array($user->role, ['admin', 'admin_restaurante', 'superadmin'])) {
            return true;
        }

        return true;
    }

    public function create(Usuario $user): bool
    {
        return in_array($user->role, ['admin', 'admin_restaurante', 'superadmin']);
    }

    public function update(Usuario $user, Mesa $mesa): bool
    {
        return in_array($user->role, ['admin', 'admin_restaurante', 'superadmin'])
            && ($mesa->restaurante->user_id === $user->id || in_array($user->role, ['admin', 'superadmin']));
    }

    public function delete(Usuario $user, Mesa $mesa): bool
    {
        return in_array($user->role, ['admin', 'superadmin']);
    }
}
