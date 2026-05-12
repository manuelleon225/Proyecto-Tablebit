<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Resena extends Model
{
    use SoftDeletes;

    protected $table = 'resenas';

    protected $fillable = [
        'cliente_id',
        'restaurante_id',
        'reserva_id',
        'rating',
        'comentario',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function cliente()
    {
        return $this->belongsTo(Usuario::class, 'cliente_id');
    }

    public function restaurante()
    {
        return $this->belongsTo(Restaurante::class);
    }

    public function reserva()
    {
        return $this->belongsTo(Reservas::class);
    }

    public function scopeDelRestaurante($query, $restauranteId)
    {
        return $query->where('restaurante_id', $restauranteId);
    }

    public function scopeConRating($query, $rating)
    {
        return $query->where('rating', $rating);
    }
}
