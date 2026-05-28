<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Jobs\SendWelcomeMail;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        DB::beginTransaction();
        try {
            $user = Usuario::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'] ?? 'cliente',
                'estado' => 'activo'
            ]);
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Error al registrar usuario', [
                'error' => $e->getMessage(),
                'data' => $validated,
            ]);
            return response()->json(['message' => 'Error al registrar usuario'], 500);
        }

        try {
            SendWelcomeMail::dispatch($user);
        } catch (\Throwable $e) {
            Log::warning('Error al encolar correo de bienvenida', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }

        $hasRestaurant = $user->restaurantes()->count() > 0 || !is_null($user->restaurante);
        $requiresOnboarding = in_array($user->role, ['admin', 'admin_restaurante'])
            && !$hasRestaurant;

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'requires_onboarding' => $requiresOnboarding,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = Usuario::where('email', $validated['email'])->first();

        if (!$user || $user->estado !== 'activo' || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        $user->load('restaurante');

        $hasRestaurant = $user->restaurantes()->count() > 0 || !is_null($user->restaurante);
        $requiresOnboarding = in_array($user->role, ['admin', 'admin_restaurante'])
            && !$hasRestaurant;

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'requires_onboarding' => $requiresOnboarding,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logout correcto'
        ]);
    }
}
