<?php

namespace Tests\Feature;

use App\Models\Mesa;
use App\Models\Restaurante;
use App\Models\Reservas;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservaTest extends TestCase
{
    use RefreshDatabase;

    private Usuario $cliente;
    private Usuario $admin;
    private Restaurante $restaurante;
    private Mesa $mesa;

    protected function setUp(): void
    {
        parent::setUp();

        $this->cliente = Usuario::factory()->create(['role' => 'cliente']);
        $this->admin = Usuario::factory()->create(['role' => 'admin']);
        $this->restaurante = Restaurante::factory()->create();
        $this->mesa = Mesa::factory()->create([
            'restaurante_id' => $this->restaurante->id,
            'capacidad' => 4,
        ]);
    }

    public function test_authenticated_user_can_create_reservation(): void
    {
        $token = $this->cliente->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/reservas', [
            'restaurante_id' => $this->restaurante->id,
            'fecha' => now()->addDays(1)->format('Y-m-d'),
            'hora' => '20:00',
            'cantidad_personas' => 2,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'reserva' => ['id', 'cliente_id', 'restaurante_id', 'fecha', 'hora', 'estado'],
            ]);

        $this->assertDatabaseHas('reservas', [
            'cliente_id' => $this->cliente->id,
            'estado' => 'confirmada',
        ]);
    }

    public function test_unauthenticated_user_cannot_create_reservation(): void
    {
        $response = $this->postJson('/api/reservas', [
            'restaurante_id' => $this->restaurante->id,
            'fecha' => now()->addDays(1)->format('Y-m-d'),
            'hora' => '20:00',
            'cantidad_personas' => 2,
        ]);

        $response->assertStatus(401);
    }

    public function test_user_can_view_own_reservations(): void
    {
        $token = $this->cliente->createToken('test')->plainTextToken;

        Reservas::factory()->create([
            'cliente_id' => $this->cliente->id,
            'restaurante_id' => $this->restaurante->id,
            'mesa_id' => $this->mesa->id,
        ]);

        $response = $this->withToken($token)->getJson('/api/mis-reservas');

        $response->assertStatus(200)
            ->assertJsonCount(1);
    }

    public function test_user_only_sees_own_reservations(): void
    {
        $token = $this->cliente->createToken('test')->plainTextToken;
        $otroCliente = Usuario::factory()->create(['role' => 'cliente']);

        Reservas::factory()->create([
            'cliente_id' => $this->cliente->id,
            'restaurante_id' => $this->restaurante->id,
            'mesa_id' => $this->mesa->id,
        ]);

        Reservas::factory()->create([
            'cliente_id' => $otroCliente->id,
            'restaurante_id' => $this->restaurante->id,
            'mesa_id' => $this->mesa->id,
        ]);

        $response = $this->withToken($token)->getJson('/api/mis-reservas');

        $response->assertStatus(200)
            ->assertJsonCount(1);
    }

    public function test_user_can_cancel_own_reservation(): void
    {
        $token = $this->cliente->createToken('test')->plainTextToken;

        $reserva = Reservas::factory()->create([
            'cliente_id' => $this->cliente->id,
            'restaurante_id' => $this->restaurante->id,
            'mesa_id' => $this->mesa->id,
            'fecha' => now()->addDays(1)->format('Y-m-d'),
        ]);

        $response = $this->withToken($token)
            ->patchJson("/api/reservas/{$reserva->id}/cancelar");

        $response->assertStatus(200);
        $this->assertDatabaseHas('reservas', [
            'id' => $reserva->id,
            'estado' => 'cancelada',
        ]);
    }

    public function test_user_cannot_cancel_others_reservation(): void
    {
        $token = $this->cliente->createToken('test')->plainTextToken;
        $otroCliente = Usuario::factory()->create(['role' => 'cliente']);

        $reserva = Reservas::factory()->create([
            'cliente_id' => $otroCliente->id,
            'restaurante_id' => $this->restaurante->id,
            'mesa_id' => $this->mesa->id,
        ]);

        $response = $this->withToken($token)
            ->patchJson("/api/reservas/{$reserva->id}/cancelar");

        $response->assertStatus(403);
    }

    public function test_cannot_create_reservation_in_past(): void
    {
        $token = $this->cliente->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/reservas', [
            'restaurante_id' => $this->restaurante->id,
            'fecha' => now()->subDays(1)->format('Y-m-d'),
            'hora' => '20:00',
            'cantidad_personas' => 2,
        ]);

        $response->assertStatus(422);
    }

    public function test_create_reservation_with_specific_table(): void
    {
        $token = $this->cliente->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/reservas', [
            'restaurante_id' => $this->restaurante->id,
            'mesa_id' => $this->mesa->id,
            'fecha' => now()->addDays(1)->format('Y-m-d'),
            'hora' => '20:00',
            'cantidad_personas' => 2,
        ]);

        $response->assertStatus(201);
    }

    public function test_auto_reserve_without_specific_table(): void
    {
        $token = $this->cliente->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/reserva-automatica', [
            'restaurante_id' => $this->restaurante->id,
            'fecha' => now()->addDays(1)->format('Y-m-d'),
            'hora' => '20:00',
            'cantidad_personas' => 2,
        ]);

        $response->assertStatus(201);
    }
}
