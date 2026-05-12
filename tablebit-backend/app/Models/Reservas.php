<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reservas extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'reservas';

    protected $fillable = [
        'cliente_id',
        'restaurante_id',
        'mesa_id',
        'fecha',
        'hora',
        'hora_fin',
        'duracion',
        'cantidad_personas',
        'tipo_evento',
        'notas',
        'estado',
    ];

    protected $casts = [
        'fecha' => 'date',
        'hora' => 'datetime:H:i',
        'hora_fin' => 'datetime:H:i',
    ];

    protected $hidden = ['deleted_at'];

    public function cliente()
    {
        return $this->belongsTo(Usuario::class, 'cliente_id');
    }

    public function restaurante()
    {
        return $this->belongsTo(Restaurante::class, 'restaurante_id');
    }

    public function mesa()
    {
        return $this->belongsTo(Mesa::class, 'mesa_id');
    }

    public function resena()
    {
        return $this->hasOne(Resena::class, 'reserva_id');
    }

    public function getHoraFinAttribute($value)
    {
        if ($value) {
            return $value;
        }
        if ($this->hora && $this->duracion) {
            $hora = is_string($this->hora) ? $this->hora : $this->hora->format('H:i');
            return date('H:i', strtotime($hora) + ($this->duracion * 60));
        }
        return null;
    }

    public function scopeConfirmadas($query)
    {
        return $query->where('estado', 'confirmada');
    }

    public function scopeActivas($query)
    {
        return $query->whereIn('estado', ['pendiente', 'confirmada']);
    }

    public function scopeDelDia($query, $fecha)
    {
        return $query->whereDate('fecha', $fecha);
    }

    public function scopeDelRestaurante($query, $restauranteId)
    {
        return $query->where('restaurante_id', $restauranteId);
    }
}
