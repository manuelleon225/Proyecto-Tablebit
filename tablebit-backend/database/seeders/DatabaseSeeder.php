<?php

namespace Database\Seeders;

use App\Models\Restaurante;
use App\Models\Mesa;
use App\Models\Reservas;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ========================
        // 1. USUARIOS
        // ========================
        $admin = Usuario::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Admin TableBit',
                'password' => bcrypt('admin123'),
                'role' => 'admin',
                'estado' => 'activo',
            ]
        );

        $superadmin = Usuario::firstOrCreate(
            ['email' => 'superadmin@test.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('SuperAdmin123!'),
                'role' => 'superadmin',
                'estado' => 'activo',
            ]
        );

        $adminRest1 = Usuario::firstOrCreate(
            ['email' => 'admin.rest1@test.com'],
            [
                'name' => 'Carlos García',
                'password' => bcrypt('Admin123!'),
                'role' => 'admin_restaurante',
                'estado' => 'activo',
            ]
        );

        $adminRest2 = Usuario::firstOrCreate(
            ['email' => 'admin.rest2@test.com'],
            [
                'name' => 'María López',
                'password' => bcrypt('Admin123!'),
                'role' => 'admin_restaurante',
                'estado' => 'activo',
            ]
        );

        $clientes = [];
        $nombresClientes = [
            ['Ana Martínez', 'ana@test.com'],
            ['Pedro Rodríguez', 'pedro@test.com'],
            ['Laura Fernández', 'laura@test.com'],
            ['Diego Sánchez', 'diego@test.com'],
            ['Sofía Torres', 'sofia@test.com'],
            ['Jorge Ramírez', 'jorge@test.com'],
        ];

        foreach ($nombresClientes as [$name, $email]) {
            $clientes[] = Usuario::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => bcrypt('Cliente1!'),
                    'role' => 'cliente',
                    'estado' => 'activo',
                ]
            );
        }

        $this->command->info('Usuarios creados: ' . Usuario::count());

        // ========================
        // 2. RESTAURANTES
        // ========================
        $restaurantesData = [
            [
                'user_id' => $adminRest1->id,
                'nombre' => 'Restaurante La Terraza',
                'direccion' => 'Calle 123 #45-67',
                'ciudad' => 'Bogotá',
                'tipo_comida' => 'Internacional',
                'telefono' => '3001234567',
                'descripcion' => 'Un acogedor restaurante con terraza al aire libre, especializado en cocina internacional con ingredientes locales.',
                'capacidad_total' => 80,
            ],
            [
                'user_id' => $adminRest1->id,
                'nombre' => 'Sushi Bar Ikigai',
                'direccion' => 'Carrera 15 #88-32',
                'ciudad' => 'Bogotá',
                'tipo_comida' => 'Japonesa',
                'telefono' => '3109876543',
                'descripcion' => 'Auténtica cocina japonesa con los mejores cortes de pescado fresco importado.',
                'capacidad_total' => 50,
            ],
            [
                'user_id' => $adminRest2->id,
                'nombre' => 'Trattoria Da Mario',
                'direccion' => 'Calle 72 #10-45',
                'ciudad' => 'Bogotá',
                'tipo_comida' => 'Italiana',
                'telefono' => '3154567890',
                'descripcion' => 'Auténtica cocina italiana tradicional, pastas artesanales y los mejores vinos de la Toscana.',
                'capacidad_total' => 60,
            ],
            [
                'user_id' => $adminRest2->id,
                'nombre' => 'El Mexicano',
                'direccion' => 'Avenida Chile #20-15',
                'ciudad' => 'Medellín',
                'tipo_comida' => 'Mexicana',
                'telefono' => '3207890123',
                'descripcion' => 'Los mejores tacos y burritos de la ciudad, recetas tradicionales con un toque moderno.',
                'capacidad_total' => 45,
            ],
        ];

        foreach ($restaurantesData as $data) {
            Restaurante::firstOrCreate(
                ['nombre' => $data['nombre']],
                $data
            );
        }

        $this->command->info('Restaurantes creados: ' . Restaurante::count());

        // ========================
        // 3. HORARIOS
        // ========================
        $this->call(HorarioDiasSeeder::class);

        // ========================
        // 4. MESAS
        // ========================
        $restaurantes = Restaurante::all();

        foreach ($restaurantes as $rest) {
            $existingMesas = Mesa::where('restaurante_id', $rest->id)->count();
            if ($existingMesas > 0) {
                $this->command->info("Restaurante {$rest->nombre}: {$existingMesas} mesas ya existen, saltando.");
                continue;
            }

            $mesasConfig = [
                ['desde' => 1, 'hasta' => 3, 'cap' => 2, 'estado' => 'disponible'],
                ['desde' => 4, 'hasta' => 6, 'cap' => 4, 'estado' => 'disponible'],
                ['desde' => 7, 'hasta' => 8, 'cap' => 6, 'estado' => 'disponible'],
                ['desde' => 9, 'hasta' => 9, 'cap' => 8, 'estado' => 'disponible'],
                ['desde' => 10, 'hasta' => 10, 'cap' => 4, 'estado' => 'mantenimiento'],
            ];

            foreach ($mesasConfig as $cfg) {
                for ($i = $cfg['desde']; $i <= $cfg['hasta']; $i++) {
                    Mesa::create([
                        'restaurante_id' => $rest->id,
                        'numero' => $i,
                        'capacidad' => $cfg['cap'],
                        'estado' => $cfg['estado'],
                    ]);
                }
            }

            $this->command->info("Mesas creadas para {$rest->nombre}: " . Mesa::where('restaurante_id', $rest->id)->count());
        }

        // ========================
        // 5. RESERVAS (distribuidas en fechas)
        // ========================
        $today = Carbon::today();

        // Limpiar reservas anteriores para regenerar datos frescos
        Reservas::query()->delete();

        $estadosPosibles = ['confirmada', 'completada', 'cancelada', 'no_show', 'pendiente'];
        $todasLasMesas = Mesa::where('estado', '!=', 'mantenimiento')->get();
        $diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
        $horasDisponibles = ['12:00', '13:00', '14:00', '19:00', '20:00', '21:00'];

        $reservasCreadas = 0;

        foreach ($restaurantes as $rest) {
            $mesasRest = $todasLasMesas->where('restaurante_id', $rest->id);
            if ($mesasRest->isEmpty()) continue;

            // Crear reservas para los últimos 15 días (completadas/canceladas)
            for ($diasAtras = 15; $diasAtras >= 1; $diasAtras--) {
                $fecha = (clone $today)->subDays($diasAtras);
                $numReservas = rand(1, 3);

                for ($r = 0; $r < $numReservas; $r++) {
                    $mesa = $mesasRest->random();
                    $hora = $horasDisponibles[array_rand($horasDisponibles)];
                    $personas = rand(1, $mesa->capacidad);
                    $peso = rand(1, 100);
                    if ($peso < 60) $estado = 'completada';
                    elseif ($peso < 80) $estado = 'cancelada';
                    else $estado = 'no_show';

                    $this->crearReserva($rest->id, $clientes[array_rand($clientes)]->id, $mesa->id, $fecha, $hora, $personas, $estado);
                    $reservasCreadas++;
                }
            }

            // Crear reservas para hoy
            $numHoy = rand(3, 5);
            $horasUsadas = [];
            for ($r = 0; $r < $numHoy; $r++) {
                $mesa = $mesasRest->random();
                $hora = $horasDisponibles[array_rand($horasDisponibles)];
                if (in_array($hora, $horasUsadas)) continue;
                $horasUsadas[] = $hora;
                $personas = rand(1, $mesa->capacidad);
                $estado = (rand(1, 10) <= 7) ? 'confirmada' : 'pendiente';
                $this->crearReserva($rest->id, $clientes[array_rand($clientes)]->id, $mesa->id, $today, $hora, $personas, $estado);
                $reservasCreadas++;
            }

            // Crear reservas para los próximos 14 días (confirmadas mayormente)
            for ($diasAdelante = 1; $diasAdelante <= 14; $diasAdelante++) {
                $fecha = (clone $today)->addDays($diasAdelante);
                $numReservas = rand(1, 2);

                for ($r = 0; $r < $numReservas; $r++) {
                    $mesa = $mesasRest->random();
                    $hora = $horasDisponibles[array_rand($horasDisponibles)];
                    $personas = rand(1, $mesa->capacidad);
                    $estado = (rand(1, 10) <= 8) ? 'confirmada' : 'pendiente';
                    $this->crearReserva($rest->id, $clientes[array_rand($clientes)]->id, $mesa->id, $fecha, $hora, $personas, $estado);
                    $reservasCreadas++;
                }
            }
        }

        $this->command->info("Reservas creadas: {$reservasCreadas}");

        // ========================
        // 6. Demo Data
        // ========================
        $this->call(DemoDataSeeder::class);

        // ========================
        // 7. E2E Test Users
        // ========================
        $this->call(E2ETestSeeder::class);
    }

    private function crearReserva($restauranteId, $clienteId, $mesaId, $fecha, $hora, $personas, $estado): void
    {
        $horaCarbon = Carbon::parse($hora);
        $horaFin = (clone $horaCarbon)->addMinutes(90);

        Reservas::create([
            'restaurante_id' => $restauranteId,
            'cliente_id' => $clienteId,
            'mesa_id' => $mesaId,
            'fecha' => $fecha->toDateString(),
            'hora' => $hora,
            'hora_fin' => $horaFin->format('H:i'),
            'duracion' => 90,
            'cantidad_personas' => $personas,
            'estado' => $estado,
        ]);
    }
}
