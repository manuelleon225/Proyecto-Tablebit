<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ReservasFactory extends Factory
{
    public function definition(): array
    {
        return [
            'fecha' => now()->addDays(rand(1, 30))->format('Y-m-d'),
            'hora' => fake()->randomElement(['12:00', '13:00', '14:00', '20:00', '21:00', '22:00']),
            'duracion' => 90,
            'hora_fin' => '21:30',
            'cantidad_personas' => fake()->numberBetween(1, 6),
            'estado' => 'confirmada',
        ];
    }
}
