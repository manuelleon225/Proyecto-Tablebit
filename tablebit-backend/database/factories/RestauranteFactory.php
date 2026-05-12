<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class RestauranteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nombre' => fake()->company() . ' Restaurante',
            'direccion' => fake()->address(),
            'telefono' => fake()->phoneNumber(),
            'estado' => 'activo',
            'descripcion' => fake()->paragraph(),
            'ciudad' => fake()->city(),
            'tipo_comida' => fake()->randomElement(['Mexicana', 'Italiana', 'Japonesa', 'Española']),
            'capacidad_total' => fake()->numberBetween(20, 200),
        ];
    }
}
