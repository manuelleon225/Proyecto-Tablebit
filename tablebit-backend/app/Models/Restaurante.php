<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Restaurante extends Model
{
    protected $table = 'restaurantes';

    protected $fillable = [
        'user_id',
        'nombre',
        'direccion',
        'telefono',
        'estado',
        'descripcion',
        'imagen',
        'portada',
        'ciudad',
        'tipo_comida',
        'horario_apertura',
        'horario_cierre',
        'capacidad_total',
    ];

    protected $casts = [
        'capacidad_total' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(Usuario::class, 'user_id');
    }

    public function mesas()
    {
        return $this->hasMany(Mesa::class);
    }

    public function reservas()
    {
        return $this->hasMany(Reservas::class);
    }

    public function imagenes()
    {
        return $this->hasMany(Imagen::class);
    }

    public function horarios()
    {
        return $this->hasMany(HorarioDia::class);
    }

    public function resenas()
    {
        return $this->hasMany(Resena::class);
    }

    public function favoritos()
    {
        return $this->hasMany(Favorito::class);
    }

    public function getRatingPromedioAttribute()
    {
        return $this->resenas()->avg('rating') ?? 0;
    }

    public function getTotalResenasAttribute()
    {
        return $this->resenas()->count();
    }

    public function estaAbiertoAhora()
    {
        $diaActual = strtolower(now()->locale('es')->dayName);
        $horaActual = now()->format('H:i');
        $horaActualMinutos = now()->hour * 60 + now()->minute;

        $horario = $this->horarios()->where('dia', $diaActual)->first();

        if (!$horario || !$horario->activo) {
            return false;
        }

        if ($horario->hora_apertura && $horario->hora_cierre) {
            $apertura = is_string($horario->hora_apertura) ? $horario->hora_apertura : $horario->hora_apertura->format('H:i');
            $cierre = is_string($horario->hora_cierre) ? $horario->hora_cierre : $horario->hora_cierre->format('H:i');
            $aperturaMinutos = $this->timeToMinutes($apertura);
            $cierreMinutos = $this->timeToMinutes($cierre);

            if ($this->isTimeInRange($horaActualMinutos, $aperturaMinutos, $cierreMinutos)) {
                return true;
            }
        }

        if ($horario->hora_apertura_tarde && $horario->hora_cierre_tarde) {
            $aperturaTarde = is_string($horario->hora_apertura_tarde) ? $horario->hora_apertura_tarde : $horario->hora_apertura_tarde->format('H:i');
            $cierreTarde = is_string($horario->hora_cierre_tarde) ? $horario->hora_cierre_tarde : $horario->hora_cierre_tarde->format('H:i');
            $aperturaTardeMinutos = $this->timeToMinutes($aperturaTarde);
            $cierreTardeMinutos = $this->timeToMinutes($cierreTarde);

            if ($this->isTimeInRange($horaActualMinutos, $aperturaTardeMinutos, $cierreTardeMinutos)) {
                return true;
            }
        }

        return false;
    }

    private function timeToMinutes($time)
    {
        $parts = explode(':', $time);
        return (int)$parts[0] * 60 + (int)($parts[1] ?? 0);
    }

    private function isTimeInRange($current, $start, $end)
    {
        if ($end <= $start) {
            return $current >= $start || $current <= $end;
        }
        return $current >= $start && $current <= $end;
    }

    public function scopeActivos($query)
    {
        return $query->where('estado', 'activo');
    }

    public function scopePorCiudad($query, $ciudad)
    {
        return $query->where('ciudad', 'like', "%{$ciudad}%");
    }

    public function scopePorTipoComida($query, $tipo)
    {
        return $query->where('tipo_comida', 'like', "%{$tipo}%");
    }
}
