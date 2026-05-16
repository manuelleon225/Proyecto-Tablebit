<?php

namespace Tests\Feature;

use App\Models\Usuario;
use App\Models\Restaurante;
use App\Models\Mesa;
use App\Models\Reservas;
use App\Models\RestaurantHour;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class MultiTenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    private Usuario $ownerA;
    private Usuario $ownerB;
    private Usuario $cliente;
    private Usuario $superadmin;
    private Restaurante $restA;
    private Restaurante $restB;
    private string $tokenA;
    private string $tokenB;
    private string $tokenCliente;
    private string $tokenSuperadmin;

    protected function setUp(): void
    {
        parent::setUp();

        // Create users
        $this->ownerA = Usuario::factory()->create(['role' => 'admin_restaurante', 'email' => 'ownerA@test.com']);
        $this->ownerB = Usuario::factory()->create(['role' => 'admin_restaurante', 'email' => 'ownerB@test.com']);
        $this->cliente = Usuario::factory()->create(['role' => 'cliente', 'email' => 'cliente@test.com']);
        $this->superadmin = Usuario::factory()->create(['role' => 'superadmin', 'email' => 'super@test.com']);

        // Create restaurants
        $this->restA = Restaurante::factory()->create(['nombre' => 'Rest Owner A', 'user_id' => $this->ownerA->id]);
        $this->restB = Restaurante::factory()->create(['nombre' => 'Rest Owner B', 'user_id' => $this->ownerB->id]);

        // Create pivot records
        $this->ownerA->restaurantes()->attach($this->restA->id, ['role' => 'owner']);
        $this->ownerB->restaurantes()->attach($this->restB->id, ['role' => 'owner']);

        // Create tables for each restaurant (sequential numbers to avoid unique constraint)
        foreach (range(1, 3) as $i) {
            Mesa::factory()->create(['restaurante_id' => $this->restA->id, 'numero' => $i]);
        }
        foreach (range(1, 3) as $i) {
            Mesa::factory()->create(['restaurante_id' => $this->restB->id, 'numero' => $i]);
        }

        // Create tokens
        $this->tokenA = $this->ownerA->createToken('test')->plainTextToken;
        $this->tokenB = $this->ownerB->createToken('test')->plainTextToken;
        $this->tokenCliente = $this->cliente->createToken('test')->plainTextToken;
        $this->tokenSuperadmin = $this->superadmin->createToken('test')->plainTextToken;
    }

    /** @test */
    public function owner_cannot_access_other_owners_restaurant()
    {
        // Owner A cannot update Owner B's restaurant
        $response = $this->withToken($this->tokenA)
            ->putJson("/api/restaurantes/{$this->restB->id}", ['nombre' => 'Hacked']);
        $response->assertForbidden();
    }

    /** @test */
    public function owner_cannot_update_other_owners_restaurant()
    {
        $response = $this->withToken($this->tokenA)
            ->putJson("/api/restaurantes/{$this->restB->id}", ['nombre' => 'Hacked Name']);
        $response->assertForbidden();
        $this->assertDatabaseHas('restaurantes', ['id' => $this->restB->id, 'nombre' => 'Rest Owner B']);
    }

    /** @test */
    public function owner_cannot_delete_other_owners_restaurant()
    {
        $response = $this->withToken($this->tokenA)
            ->deleteJson("/api/restaurantes/{$this->restB->id}");
        $response->assertForbidden();
        $this->assertDatabaseHas('restaurantes', ['id' => $this->restB->id]);
    }

    /** @test */
    public function owner_cannot_create_table_in_other_owners_restaurant()
    {
        $response = $this->withToken($this->tokenA)
            ->postJson('/api/mesas', [
                'restaurante_id' => $this->restB->id,
                'numero' => 99,
                'capacidad' => 4,
            ]);
        $response->assertForbidden();
        $this->assertDatabaseMissing('mesas', ['numero' => 99, 'restaurante_id' => $this->restB->id]);
    }

    /** @test */
    public function owner_cannot_update_hours_of_other_owners_restaurant()
    {
        $response = $this->withToken($this->tokenA)
            ->putJson("/api/restaurantes/{$this->restB->id}/hours", [
                'hours' => array_map(fn($i) => [
                    'day_of_week' => $i,
                    'is_closed' => false,
                    'open_time' => '10:00',
                    'close_time' => '22:00',
                ], range(0, 6)),
            ]);
        $response->assertForbidden();
    }

    /** @test */
    public function cliente_cannot_access_admin_dashboard()
    {
        $adminRoutes = [
            '/api/mis-restaurantes',
            '/api/dashboard/restaurante/1',
            "/api/restaurantes/{$this->restA->id}/hours",
        ];

        foreach ($adminRoutes as $route) {
            $response = $this->withToken($this->tokenCliente)->getJson($route);
            $this->assertTrue(
                $response->status() === 403,
                "Route $route should return 403 for cliente, got {$response->status()}"
            );
        }
    }

    /** @test */
    public function cliente_cannot_create_restaurant()
    {
        $response = $this->withToken($this->tokenCliente)
            ->postJson('/api/restaurantes', ['nombre' => 'Hack', 'direccion' => 'x']);
        $response->assertForbidden();
    }

    /** @test */
    public function superadmin_can_see_all_restaurants()
    {
        $response = $this->withToken($this->tokenSuperadmin)->getJson('/api/mis-restaurantes');
        $response->assertOk();
        $this->assertCount(2, $response->json());
    }

    /** @test */
    public function superadmin_can_update_any_restaurant()
    {
        $response = $this->withToken($this->tokenSuperadmin)
            ->putJson("/api/restaurantes/{$this->restB->id}", ['nombre' => 'Updated By Super']);
        $response->assertOk();
        $this->assertDatabaseHas('restaurantes', ['id' => $this->restB->id, 'nombre' => 'Updated By Super']);
    }

    /** @test */
    public function superadmin_can_delete_any_restaurant()
    {
        $response = $this->withToken($this->tokenSuperadmin)
            ->deleteJson("/api/restaurantes/{$this->restA->id}");
        $response->assertOk();
        $this->assertDatabaseHas('restaurantes', ['id' => $this->restA->id, 'estado' => 'inactivo']);
    }

    /** @test */
    public function owner_cannot_access_other_owners_reservations()
    {
        // Create a reservation in rest B as a client
        $mesaB = Mesa::where('restaurante_id', $this->restB->id)->first();
        $reserva = Reservas::factory()->create([
            'restaurante_id' => $this->restB->id,
            'cliente_id' => $this->cliente->id,
            'mesa_id' => $mesaB->id,
        ]);

        // Owner A tries to access it
        $response = $this->withToken($this->tokenA)
            ->getJson("/api/reservas/{$reserva->id}");
        $response->assertForbidden();
    }
}
