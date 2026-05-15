<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\Reservas;

class ReservaPolicy
{
    public function view(Usuario $user, Reservas $reserva): bool
    {
        if (in_array($user->role, ['superadmin', 'admin'])) return true;
        if ($user->role === 'admin_restaurante') {
            return $user->restaurantes()->where('restaurante_id', $reserva->restaurante_id)->exists();
        }
        return $reserva->cliente_id === $user->id;
    }

    public function update(Usuario $user, Reservas $reserva): bool
    {
        if (in_array($user->role, ['superadmin', 'admin'])) return true;
        if ($user->role === 'admin_restaurante') {
            return $user->restaurantes()->where('restaurante_id', $reserva->restaurante_id)->exists();
        }
        return $reserva->cliente_id === $user->id;
    }

    public function cancel(Usuario $user, Reservas $reserva): bool
    {
        if (in_array($user->role, ['superadmin', 'admin'])) return true;
        if ($user->role === 'admin_restaurante') return true;
        return $reserva->cliente_id === $user->id;
    }

    public function delete(Usuario $user, Reservas $reserva): bool
    {
        return in_array($user->role, ['superadmin', 'admin']);
    }
}
