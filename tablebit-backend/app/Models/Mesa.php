<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mesa extends Model
{
    protected $table = 'mesas';

    protected $fillable = [
        'restaurante_id',
        'numero',
        'capacidad',
        'estado',
    ];

    protected $casts = [
        'numero' => 'integer',
        'capacidad' => 'integer',
    ];

    public function restaurante()
    {
        return $this->belongsTo(Restaurante::class);
    }

    public function reservas()
    {
        return $this->hasMany(Reservas::class, 'mesa_id');
    }

    public function scopeDisponibles($query)
    {
        return $query->where('estado', 'disponible');
    }

    public function scopeActivas($query)
    {
        return $query->where('estado', '!=', 'inactiva');
    }

    public function scopeDelRestaurante($query, $restauranteId)
    {
        return $query->where('restaurante_id', $restauranteId);
    }

    public function tieneReservaEn($fecha, $hora, $duracion = 90)
    {
        $horaFin = date('H:i:s', strtotime($hora) + ($duracion * 60));

        return $this->reservas()
            ->where('fecha', $fecha)
            ->whereNotIn('estado', ['cancelada', 'no_show'])
            ->where(function ($query) use ($hora, $horaFin) {
                $query->where('hora', '<', $horaFin)
                      ->whereRaw("ADDTIME(hora, SEC_TO_TIME(duracion * 60)) > ?", [$hora]);
            })
            ->exists();
    }
}
