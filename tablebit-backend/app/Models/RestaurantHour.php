<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RestaurantHour extends Model
{
    protected $fillable = [
        'restaurante_id',
        'day_of_week',
        'open_time',
        'close_time',
        'is_closed',
    ];

    protected $casts = [
        'open_time' => 'string',
        'close_time' => 'string',
        'is_closed' => 'boolean',
    ];

    public function restaurante()
    {
        return $this->belongsTo(Restaurante::class);
    }
}
