<?php

namespace Tests\Feature;

use App\Models\Restaurante;
use App\Models\Usuario;
use App\Policies\RestaurantePolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $response = $this->getJson('/api/mis-reservas');
        $response->assertStatus(401);

        $response = $this->getJson('/api/usuarios/me');
        $response->assertStatus(401);
    }

    public function test_restaurante_policy_create_permissions(): void
    {
        $policy = new RestaurantePolicy();

        $admin = new Usuario(['role' => 'admin']);
        $adminRestaurante = new Usuario(['role' => 'admin_restaurante']);
        $superadmin = new Usuario(['role' => 'superadmin']);
        $cliente = new Usuario(['role' => 'cliente']);

        $this->assertTrue($policy->create($admin));
        $this->assertTrue($policy->create($adminRestaurante));
        $this->assertTrue($policy->create($superadmin));
        $this->assertFalse($policy->create($cliente));
    }

    public function test_restaurante_policy_update_permissions(): void
    {
        $policy = new RestaurantePolicy();

        $superadmin = new Usuario(['role' => 'superadmin', 'id' => 1]);
        $admin = new Usuario(['role' => 'admin', 'id' => 4]);
        $cliente = new Usuario(['role' => 'cliente', 'id' => 3]);

        $restaurante = new Restaurante(['user_id' => 1, 'id' => 1]);

        $this->assertTrue($policy->update($superadmin, $restaurante));
        $this->assertTrue($policy->update($admin, $restaurante));
        $this->assertFalse($policy->update($cliente, $restaurante));
    }

    public function test_restaurante_policy_delete_permissions(): void
    {
        $policy = new RestaurantePolicy();

        $superadmin = new Usuario(['role' => 'superadmin', 'id' => 1]);
        $admin = new Usuario(['role' => 'admin', 'id' => 2]);

        $restaurante = new Restaurante(['user_id' => 1, 'id' => 1]);

        $this->assertTrue($policy->delete($superadmin, $restaurante));
        $this->assertTrue($policy->delete($admin, $restaurante));
    }

    public function test_rate_limiting_on_login(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/login', ['email' => 'test@test.com', 'password' => 'secret']);
        }

        $response = $this->postJson('/api/login', ['email' => 'test@test.com', 'password' => 'secret']);
        $response->assertStatus(429);
    }

    public function test_rate_limiting_on_registration(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/register', [
                'nombre' => 'User ' . $i,
                'email' => "user{$i}@test.com",
                'password' => 'password123',
                'telefono' => '1234567890',
            ]);
        }

        $response = $this->postJson('/api/register', [
            'nombre' => 'User 11',
            'email' => 'user11@test.com',
            'password' => 'password123',
            'telefono' => '1234567890',
        ]);
        $response->assertStatus(429);
    }
}
