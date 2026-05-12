<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\Reservas;

class ReservaPolicy
{
    public function view(Usuario $user, Reservas $reserva): bool
    {
        if (in_array($user->role, ['admin', 'admin_restaurante', 'superadmin'])) {
            return $reserva->restaurante->user_id === $user->id
                || in_array($user->role, ['admin', 'superadmin']);
        }

        return $reserva->cliente_id === $user->id;
    }

    public function update(Usuario $user, Reservas $reserva): bool
    {
        if (in_array($user->role, ['admin', 'admin_restaurante', 'superadmin'])) {
            return $reserva->restaurante->user_id === $user->id
                || in_array($user->role, ['admin', 'superadmin']);
        }

        return $reserva->cliente_id === $user->id;
    }

    public function cancel(Usuario $user, Reservas $reserva): bool
    {
        if (in_array($user->role, ['admin', 'admin_restaurante', 'superadmin'])) {
            return true;
        }

        return $reserva->cliente_id === $user->id;
    }

    public function delete(Usuario $user, Reservas $reserva): bool
    {
        return in_array($user->role, ['admin', 'superadmin']);
    }
}
