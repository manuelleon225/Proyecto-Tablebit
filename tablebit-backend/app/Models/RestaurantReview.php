<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RestaurantReview extends Model
{
    protected $fillable = [
        'restaurante_id',
        'usuario_id',
        'rating',
        'comentario',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function restaurante()
    {
        return $this->belongsTo(Restaurante::class);
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class);
    }
}
