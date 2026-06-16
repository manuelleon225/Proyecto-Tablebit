<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Notifications\ResetPasswordNotification;

class Usuario extends Authenticatable
{
    protected $table = 'usuarios';

    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'estado',
        'avatar',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function restaurante()
    {
        return $this->hasOne(Restaurante::class, 'user_id');
    }

    public function restaurantes()
    {
        return $this->belongsToMany(Restaurante::class, 'restaurant_user', 'user_id', 'restaurante_id')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function reservas()
    {
        return $this->hasMany(Reservas::class, 'cliente_id');
    }

    public function resenas()
    {
        return $this->hasMany(Resena::class, 'cliente_id');
    }

    public function favoritos()
    {
        return $this->hasMany(Favorito::class, 'cliente_id');
    }

    public function esCliente()
    {
        return $this->role === 'cliente';
    }

    public function esAdminRestaurante()
    {
        return in_array($this->role, ['admin_restaurante', 'superadmin']);
    }

    public function esSuperAdmin()
    {
        return $this->role === 'superadmin';
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }
}
