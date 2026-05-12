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
        $adminRestaurante = new Usuario(['role' => 'admin_restaurante', 'id' => 2]);
        $cliente = new Usuario(['role' => 'cliente', 'id' => 3]);

        $restauranteOwn = new Restaurante(['user_id' => 2]);
        $restauranteOther = new Restaurante(['user_id' => 99]);

        $this->assertTrue($policy->update($superadmin, $restauranteOwn));
        $this->assertTrue($policy->update($adminRestaurante, $restauranteOwn));
        $this->assertTrue($policy->update($adminRestaurante, $restauranteOther));
        $this->assertFalse($policy->update($cliente, $restauranteOwn));
    }

    public function test_restaurante_policy_delete_permissions(): void
    {
        $policy = new RestaurantePolicy();

        $superadmin = new Usuario(['role' => 'superadmin', 'id' => 1]);
        $admin = new Usuario(['role' => 'admin', 'id' => 2]);
        $adminRestaurante = new Usuario(['role' => 'admin_restaurante', 'id' => 3]);

        $restauranteOwn = new Restaurante(['user_id' => 3]);
        $restauranteOther = new Restaurante(['user_id' => 99]);

        $this->assertTrue($policy->delete($superadmin, $restauranteOwn));
        $this->assertTrue($policy->delete($superadmin, $restauranteOther));
        $this->assertTrue($policy->delete($admin, $restauranteOwn));
        $this->assertTrue($policy->delete($admin, $restauranteOther));
        $this->assertFalse($policy->delete($adminRestaurante, $restauranteOther));
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
