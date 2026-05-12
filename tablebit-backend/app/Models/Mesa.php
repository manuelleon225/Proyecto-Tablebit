<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mesa extends Model
{
    use HasFactory;

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
        $horaInicio = strtotime($hora);
        $horaFin = $horaInicio + ($duracion * 60);

        $reservas = $this->reservas()
            ->where('fecha', $fecha)
            ->whereNotIn('estado', ['cancelada', 'no_show'])
            ->get(['hora', 'duracion']);

        foreach ($reservas as $existente) {
            $existenteInicio = strtotime($existente->hora);
            $existenteFin = $existenteInicio + (($existente->duracion ?? 90) * 60);

            if ($horaInicio < $existenteFin && $horaFin > $existenteInicio) {
                return true;
            }
        }

        return false;
    }
}
