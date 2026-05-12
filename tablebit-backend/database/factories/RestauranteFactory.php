<?php

namespace Database\Factories;

use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

class RestauranteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => Usuario::factory(),
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
