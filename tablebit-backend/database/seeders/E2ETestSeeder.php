<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Seeder;

class E2ETestSeeder extends Seeder
{
    public function run(): void
    {
        Usuario::firstOrCreate(
            ['email' => 'e2e-admin@tablebit.com'],
            [
                'name' => 'E2E Admin',
                'password' => bcrypt('admin123'),
                'role' => 'admin',
                'estado' => 'activo',
            ]
        );

        Usuario::firstOrCreate(
            ['email' => 'e2e-cliente@tablebit.com'],
            [
                'name' => 'E2E Cliente',
                'password' => bcrypt('test123'),
                'role' => 'cliente',
                'estado' => 'activo',
            ]
        );

        Usuario::firstOrCreate(
            ['email' => 'e2e-admin-rest@tablebit.com'],
            [
                'name' => 'E2E Admin Rest',
                'password' => bcrypt('admin123'),
                'role' => 'admin_restaurante',
                'estado' => 'activo',
            ]
        );

        $this->command->info('E2E test users seeded successfully.');
    }
}
