<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HorarioDiasSeeder extends Seeder
{
    public function run(): void
    {
        $restaurantes = DB::table('restaurantes')->select('id')->get();
        $dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

        foreach ($restaurantes as $restaurante) {
            foreach ($dias as $dia) {
                $activo = !in_array($dia, ['lunes']);

                DB::table('horario_dias')->updateOrInsert(
                    [
                        'restaurante_id' => $restaurante->id,
                        'dia' => $dia,
                    ],
                    [
                        'activo' => $activo,
                        'hora_apertura' => $activo ? '09:00:00' : null,
                        'hora_cierre' => $activo ? '22:00:00' : null,
                        'hora_apertura_tarde' => $activo ? '14:00:00' : null,
                        'hora_cierre_tarde' => $activo ? '17:00:00' : null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }
    }
}
