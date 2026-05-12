<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HorarioDia extends Model
{
    protected $table = 'horario_dias';

    protected $fillable = [
        'restaurante_id',
        'dia',
        'activo',
        'hora_apertura',
        'hora_cierre',
        'hora_apertura_tarde',
        'hora_cierre_tarde',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'hora_apertura' => 'datetime:H:i',
        'hora_cierre' => 'datetime:H:i',
        'hora_apertura_tarde' => 'datetime:H:i',
        'hora_cierre_tarde' => 'datetime:H:i',
    ];

    public function restaurante()
    {
        return $this->belongsTo(Restaurante::class);
    }

    public function estaAbierto($hora = null)
    {
        if (!$this->activo) {
            return false;
        }

        $hora = $hora ?? now()->format('H:i');

        $apertura = is_string($this->hora_apertura) ? $this->hora_apertura : ($this->hora_apertura ? $this->hora_apertura->format('H:i') : null);
        $cierre = is_string($this->hora_cierre) ? $this->hora_cierre : ($this->hora_cierre ? $this->hora_cierre->format('H:i') : null);

        if ($apertura && $cierre) {
            return $hora >= $apertura && $hora <= $cierre;
        }

        return false;
    }
}
