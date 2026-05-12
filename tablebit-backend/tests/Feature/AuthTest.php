<?php

namespace Tests\Feature;

use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'role'],
                'token',
            ]);

        $this->assertDatabaseHas('usuarios', [
            'email' => 'test@example.com',
            'role' => 'cliente',
        ]);
    }

    public function test_user_cannot_register_with_admin_role(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Hacker',
            'email' => 'hack@example.com',
            'password' => 'password123',
            'role' => 'admin',
        ]);

        $response->assertStatus(422);

        $this->assertDatabaseMissing('usuarios', [
            'email' => 'hack@example.com',
        ]);
    }

    public function test_user_cannot_register_with_superadmin_role(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Hacker',
            'email' => 'hack2@example.com',
            'password' => 'password123',
            'role' => 'superadmin',
        ]);

        $response->assertStatus(422);
    }

    public function test_user_cannot_register_with_duplicate_email(): void
    {
        Usuario::factory()->create(['email' => 'dup@example.com']);

        $response = $this->postJson('/api/register', [
            'name' => 'Duplicate',
            'email' => 'dup@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422);
    }

    public function test_user_can_login(): void
    {
        Usuario::factory()->create([
            'email' => 'user@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'user@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email'],
                'token',
            ]);
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        Usuario::factory()->create([
            'email' => 'user@example.com',
            'password' => bcrypt('correct_password'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'user@example.com',
            'password' => 'wrong_password',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Credenciales incorrectas']);
    }

    public function test_user_cannot_login_with_nonexistent_email(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'noexiste@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_access_me_endpoint(): void
    {
        $user = Usuario::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson('/api/usuarios/me');

        $response->assertStatus(200)
            ->assertJson([
                'id' => $user->id,
                'email' => $user->email,
            ]);
    }

    public function test_unauthenticated_user_cannot_access_me_endpoint(): void
    {
        $response = $this->getJson('/api/usuarios/me');
        $response->assertStatus(401);
    }

    public function test_user_can_logout(): void
    {
        $user = Usuario::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)
            ->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Logout correcto']);

        $this->assertCount(0, $user->tokens);
    }

    public function test_logout_revokes_all_tokens(): void
    {
        $user = Usuario::factory()->create();
        $user->createToken('token1');
        $user->createToken('token2');
        $token = $user->createToken('token3')->plainTextToken;

        $this->withToken($token)->postJson('/api/logout');

        $this->assertCount(0, $user->fresh()->tokens);
    }

    public function test_login_with_inactive_user_is_rejected(): void
    {
        Usuario::factory()->create([
            'email' => 'inactive@example.com',
            'password' => bcrypt('password123'),
            'estado' => 'inactivo',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'inactive@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401);
    }

    public function test_validation_errors_on_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => '',
            'email' => 'not-an-email',
            'password' => '12',
        ]);

        $response->assertStatus(422);
    }
}
