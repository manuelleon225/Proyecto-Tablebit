<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Imagen extends Model
{
    protected $table = 'imagenes';
    protected $fillable = [
        'restaurante_id',
        'ruta',
        'tipo',
        'nombre_original',
        'tamanio_kb',
        'orden',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function restaurante()
    {
        return $this->belongsTo(Restaurante::class);
    }
}
