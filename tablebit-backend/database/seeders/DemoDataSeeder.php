<?php

namespace Database\Seeders;

use App\Models\Restaurante;
use App\Models\Mesa;
use App\Models\Reservas;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creando datos demo...');

        // ══════════════════════════════════════════════
        // 1. USERS
        // ══════════════════════════════════════════════
        $carlos = Usuario::firstOrCreate(
            ['email' => 'carlos@demo.com'],
            ['name' => 'Carlos Ramírez', 'password' => bcrypt('password'), 'role' => 'cliente', 'estado' => 'activo']
        );

        $sofia = Usuario::firstOrCreate(
            ['email' => 'admin@tablebit.com'],
            ['name' => 'Sofía Martínez', 'password' => bcrypt('password'), 'role' => 'admin_restaurante', 'estado' => 'activo']
        );

        $staffNames = [
            ['Laura Vega', 'laura@tablebit.com', 'staff'],
            ['Diego Rojas', 'diego@tablebit.com', 'staff'],
            ['Valentina Ortiz', 'valentina@tablebit.com', 'host'],
            ['Mateo Castillo', 'mateo@tablebit.com', 'manager'],
        ];
        foreach ($staffNames as [$name, $email, $role]) {
            Usuario::firstOrCreate(
                ['email' => $email],
                ['name' => $name, 'password' => bcrypt('password'), 'role' => 'admin_restaurante', 'estado' => 'activo']
            );
        }

        $this->command->info('Usuarios demo creados.');

        // ══════════════════════════════════════════════
        // 2. RESTAURANTES
        // ══════════════════════════════════════════════
        $restData = [
            [
                'user_id' => $sofia->id,
                'nombre' => 'Sushi Ikigai', 'ciudad' => 'Bogotá', 'tipo_comida' => 'Japonesa',
                'direccion' => 'Carrera 15 #88-32, Chapinero', 'telefono' => '3109876543',
                'descripcion' => 'Auténtica cocina japonesa con los mejores cortes de pescado fresco importado directamente desde Tokio. Ambiente minimalista con barra de sushi tradicional donde puedes ver a nuestros itamae en acción. Selección exclusiva de sake y whisky japonés.',
                'capacidad_total' => 48,
            ],
            [
                'user_id' => $sofia->id,
                'nombre' => 'Trattoria Da Mario', 'ciudad' => 'Bogotá', 'tipo_comida' => 'Italiana',
                'direccion' => 'Calle 72 #10-45, El Retiro', 'telefono' => '3154567890',
                'descripcion' => 'Auténtica cocina italiana tradicional en un ambiente elegante y acogedor. Pastas artesanales hechas a mano diariamente, los mejores vinos de la Toscana y una terraza espectacular. El lugar perfecto para cenas románticas y celebraciones especiales.',
                'capacidad_total' => 72,
            ],
            [
                'user_id' => $sofia->id,
                'nombre' => 'Fuego & Brasa', 'ciudad' => 'Bogotá', 'tipo_comida' => 'Steakhouse',
                'direccion' => 'Avenida Chile #20-15, Usaquén', 'telefono' => '3207890123',
                'descripcion' => 'Steakhouse moderna con cortes premium y parrilla argentina. Ambiente industrial elegante con bodega de vinos visible y lounge bar. Especialidad en cortes madurados, mariscos a la parrilla y una selección única de vinos sudamericanos.',
                'capacidad_total' => 95,
            ],
        ];

        $restaurantes = [];
        foreach ($restData as $data) {
            $r = Restaurante::firstOrCreate(['nombre' => $data['nombre']], $data);
            $restaurantes[] = $r;
        }

        // Pivot restaurant_user
        DB::table('restaurant_user')->upsert([
            ['restaurante_id' => $restaurantes[0]->id, 'user_id' => $sofia->id, 'role' => 'owner'],
            ['restaurante_id' => $restaurantes[1]->id, 'user_id' => $sofia->id, 'role' => 'owner'],
            ['restaurante_id' => $restaurantes[2]->id, 'user_id' => $sofia->id, 'role' => 'admin'],
        ], ['restaurante_id', 'user_id'], ['role']);

        $this->command->info('Restaurantes demo creados: Sushi Ikigai, Trattoria Da Mario, Fuego & Brasa');

        // ══════════════════════════════════════════════
        // 3. HORARIOS
        // ══════════════════════════════════════════════
        foreach ($restaurantes as $rest) {
            $dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
            foreach ($dias as $dia) {
                DB::table('horario_dias')->updateOrInsert(
                    ['restaurante_id' => $rest->id, 'dia' => $dia],
                    [
                        'activo' => !in_array($dia, ['lunes']),
                        'hora_apertura' => '09:00:00',
                        'hora_cierre' => $dia === 'domingo' ? '20:00:00' : '23:00:00',
                        'hora_apertura_tarde' => '14:00:00',
                        'hora_cierre_tarde' => '17:00:00',
                    ]
                );
            }
        }

        // ══════════════════════════════════════════════
        // 4. MESAS
        // ══════════════════════════════════════════════
        $mesasConfig = [
            'Sushi Ikigai' => [
                ['num' => 1, 'cap' => 2, 'shape' => 'circle', 'x' => 40, 'y' => 80],
                ['num' => 2, 'cap' => 2, 'shape' => 'circle', 'x' => 200, 'y' => 80],
                ['num' => 3, 'cap' => 4, 'shape' => 'rectangle', 'x' => 360, 'y' => 60],
                ['num' => 4, 'cap' => 4, 'shape' => 'rectangle', 'x' => 520, 'y' => 60],
                ['num' => 5, 'cap' => 6, 'shape' => 'rectangle', 'x' => 40, 'y' => 220],
                ['num' => 6, 'cap' => 4, 'shape' => 'circle', 'x' => 200, 'y' => 220],
                ['num' => 7, 'cap' => 2, 'shape' => 'booth', 'x' => 400, 'y' => 200],
                ['num' => 8, 'cap' => 2, 'shape' => 'booth', 'x' => 520, 'y' => 200],
                ['num' => 9, 'cap' => 4, 'shape' => 'rectangle', 'x' => 80, 'y' => 360, 'estado' => 'mantenimiento'],
                ['num' => 10, 'cap' => 8, 'shape' => 'rectangle', 'x' => 280, 'y' => 340],
                ['num' => 11, 'cap' => 4, 'shape' => 'circle', 'x' => 480, 'y' => 360],
            ],
            'Trattoria Da Mario' => [
                ['num' => 1, 'cap' => 2, 'shape' => 'circle', 'x' => 40, 'y' => 60],
                ['num' => 2, 'cap' => 2, 'shape' => 'circle', 'x' => 160, 'y' => 60],
                ['num' => 3, 'cap' => 4, 'shape' => 'rectangle', 'x' => 300, 'y' => 50],
                ['num' => 4, 'cap' => 4, 'shape' => 'rectangle', 'x' => 460, 'y' => 50],
                ['num' => 5, 'cap' => 6, 'shape' => 'rectangle', 'x' => 40, 'y' => 200],
                ['num' => 6, 'cap' => 4, 'shape' => 'circle', 'x' => 180, 'y' => 200],
                ['num' => 7, 'cap' => 6, 'shape' => 'rectangle', 'x' => 340, 'y' => 190],
                ['num' => 8, 'cap' => 8, 'shape' => 'rectangle', 'x' => 40, 'y' => 350],
                ['num' => 9, 'cap' => 4, 'shape' => 'circle', 'x' => 240, 'y' => 340],
                ['num' => 10, 'cap' => 2, 'shape' => 'booth', 'x' => 400, 'y' => 340],
                ['num' => 11, 'cap' => 2, 'shape' => 'booth', 'x' => 520, 'y' => 340],
                ['num' => 12, 'cap' => 10, 'shape' => 'rectangle', 'x' => 120, 'y' => 480, 'estado' => 'mantenimiento'],
            ],
            'Fuego & Brasa' => [
                ['num' => 1, 'cap' => 4, 'shape' => 'rectangle', 'x' => 40, 'y' => 50],
                ['num' => 2, 'cap' => 4, 'shape' => 'rectangle', 'x' => 200, 'y' => 50],
                ['num' => 3, 'cap' => 2, 'shape' => 'circle', 'x' => 380, 'y' => 60],
                ['num' => 4, 'cap' => 2, 'shape' => 'circle', 'x' => 500, 'y' => 60],
                ['num' => 5, 'cap' => 6, 'shape' => 'rectangle', 'x' => 40, 'y' => 200],
                ['num' => 6, 'cap' => 6, 'shape' => 'rectangle', 'x' => 220, 'y' => 200],
                ['num' => 7, 'cap' => 8, 'shape' => 'rectangle', 'x' => 400, 'y' => 190],
                ['num' => 8, 'cap' => 4, 'shape' => 'circle', 'x' => 40, 'y' => 360],
                ['num' => 9, 'cap' => 12, 'shape' => 'rectangle', 'x' => 180, 'y' => 340],
                ['num' => 10, 'cap' => 4, 'shape' => 'booth', 'x' => 400, 'y' => 350],
                ['num' => 11, 'cap' => 4, 'shape' => 'booth', 'x' => 520, 'y' => 350],
                ['num' => 12, 'cap' => 6, 'shape' => 'rectangle', 'x' => 60, 'y' => 500],
                ['num' => 13, 'cap' => 6, 'shape' => 'rectangle', 'x' => 240, 'y' => 500],
                ['num' => 14, 'cap' => 8, 'shape' => 'rectangle', 'x' => 420, 'y' => 490],
            ],
        ];

        $estadosMesa = ['disponible', 'disponible', 'disponible', 'ocupada', 'disponible', 'disponible', 'ocupada', 'disponible'];
        $mesasCount = 0;
        foreach ($restaurantes as $rest) {
            if (isset($mesasConfig[$rest->nombre])) {
                foreach ($mesasConfig[$rest->nombre] as $cfg) {
                    Mesa::firstOrCreate(
                        ['restaurante_id' => $rest->id, 'numero' => $cfg['num']],
                        [
                            'capacidad' => $cfg['cap'],
                            'estado' => $cfg['estado'] ?? $estadosMesa[array_rand($estadosMesa)],
                        ]
                    );
                    $mesasCount++;
                }
            }
        }
        $this->command->info("$mesasCount mesas creadas.");

        // ══════════════════════════════════════════════
        // 5. RESERVAS DEMO
        // ══════════════════════════════════════════════
        Reservas::where('cliente_id', $carlos->id)->delete();

        $today = Carbon::today();
        $clientes = [$carlos->id];

        // Get other client users
        $otrosClientes = Usuario::where('role', 'cliente')->where('id', '!=', $carlos->id)->pluck('id')->toArray();
        $allClientes = array_merge($clientes, $otrosClientes);

        $reservasData = [
            // Carlos - completed (past)
            ['rest' => 0, 'days' => -20, 'time' => '20:00', 'pax' => 2, 'state' => 'completada', 'notas' => 'Cena romántica de aniversario. Mesa junto a la ventana por favor.', 'cliente' => $carlos->id],
            ['rest' => 1, 'days' => -15, 'time' => '13:00', 'pax' => 6, 'state' => 'completada', 'notas' => 'Almuerzo familiar por cumpleaños de mamá', 'cliente' => $carlos->id],
            ['rest' => 2, 'days' => -10, 'time' => '21:00', 'pax' => 4, 'state' => 'completada', 'notas' => null, 'cliente' => $carlos->id],
            ['rest' => 0, 'days' => -5, 'time' => '19:00', 'pax' => 3, 'state' => 'completada', 'notas' => 'Reunión de negocios', 'cliente' => $carlos->id],
            // Carlos - cancelled
            ['rest' => 1, 'days' => -8, 'time' => '14:00', 'pax' => 4, 'state' => 'cancelada', 'notas' => 'Cancelado por imprevisto laboral', 'cliente' => $carlos->id],
            ['rest' => 2, 'days' => -3, 'time' => '20:30', 'pax' => 2, 'state' => 'cancelada', 'notas' => null, 'cliente' => $carlos->id],
            // Carlos - future
            ['rest' => 0, 'days' => 0, 'time' => '20:00', 'pax' => 2, 'state' => 'confirmada', 'notas' => 'Mesa de barra sushi', 'cliente' => $carlos->id],
            ['rest' => 1, 'days' => 2, 'time' => '13:30', 'pax' => 8, 'state' => 'confirmada', 'notas' => 'Celebración familiar - solicito terraza', 'cliente' => $carlos->id],
            ['rest' => 2, 'days' => 5, 'time' => '21:00', 'pax' => 6, 'state' => 'confirmada', 'notas' => 'Reunión empresarial', 'cliente' => $carlos->id],
            ['rest' => 0, 'days' => 10, 'time' => '19:00', 'pax' => 4, 'state' => 'pendiente', 'notas' => null, 'cliente' => $carlos->id],
            ['rest' => 1, 'days' => 14, 'time' => '20:00', 'pax' => 2, 'state' => 'confirmada', 'notas' => 'Cena romántica - vela y champagne', 'cliente' => $carlos->id],
            ['rest' => 2, 'days' => -12, 'time' => '14:00', 'pax' => 2, 'state' => 'no_show', 'notas' => null, 'cliente' => $carlos->id],
        ];

        // Additional random reservations from other clients
        $randRest = [0, 0, 1, 1, 1, 2, 2];
        $randTimes = ['12:00', '13:00', '14:00', '19:00', '20:00', '21:00', '22:00'];
        $randPax = [2, 2, 3, 4, 4, 6, 8];
        $randStates = ['confirmada', 'confirmada', 'confirmada', 'pendiente', 'completada', 'cancelada'];

        for ($r = -14; $r <= 14; $r++) {
            if ($r === 0 || abs($r) % 2 !== 0) continue; // every 2nd day
            $reservasData[] = [
                'rest' => $randRest[array_rand($randRest)],
                'days' => $r,
                'time' => $randTimes[array_rand($randTimes)],
                'pax' => $randPax[array_rand($randPax)],
                'state' => $r < 0 ? $randStates[array_rand($randStates)] : 'confirmada',
                'notas' => rand(0, 3) === 0 ? 'Sin preferencia especial' : null,
                'cliente' => $allClientes[array_rand($allClientes)],
            ];
        }

        $reservasCreadas = 0;
        foreach ($reservasData as $rd) {
            $fecha = (clone $today)->addDays($rd['days']);
            $rest = $restaurantes[$rd['rest']];
            $mesa = Mesa::where('restaurante_id', $rest->id)->where('estado', '!=', 'mantenimiento')->inRandomOrder()->first();
            if (!$mesa) continue;

            $horaCarbon = Carbon::parse($rd['time']);
            $horaFin = (clone $horaCarbon)->addMinutes(90);

            Reservas::create([
                'cliente_id' => $rd['cliente'],
                'restaurante_id' => $rest->id,
                'mesa_id' => $mesa->id,
                'fecha' => $fecha->toDateString(),
                'hora' => $rd['time'],
                'hora_fin' => $horaFin->format('H:i'),
                'duracion' => 90,
                'cantidad_personas' => $rd['pax'],
                'estado' => $rd['state'],
                'notas' => $rd['notas'],
                'created_at' => (clone $fecha)->subDays(rand(1, 7)),
                'updated_at' => now(),
            ]);
            $reservasCreadas++;
        }

        $this->command->info("$reservasCreadas reservas demo creadas.");
        $this->command->info('============================================');
        $this->command->info('DATOS DEMO COMPLETADOS');
        $this->command->info('Carlos Ramírez: carlos@demo.com / password');
        $this->command->info('Sofía Martínez: admin@tablebit.com / password');
        $this->command->info('============================================');
    }
}
