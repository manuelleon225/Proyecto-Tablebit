<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class MesaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'numero' => fake()->numberBetween(1, 50),
            'capacidad' => fake()->numberBetween(2, 12),
            'estado' => 'disponible',
        ];
    }
}
