<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('restaurante');
        return response()->json($user);
    }

    public function updateMe(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'    => 'sometimes|string|max:255',
            'email'   => 'sometimes|email|unique:usuarios,email,' . $user->id,
            'password' => 'sometimes|min:6|confirmed',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);
        $user->refresh();

        return response()->json([
            'message' => 'Perfil actualizado',
            'user'    => $user
        ]);
    }

    public function index(): JsonResponse
    {
        $users = Usuario::where('estado', 'activo')->get();
        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:usuarios,email',
            'password' => 'required|min:6',
            'role' => 'required|in:admin,restaurante,cliente,admin_restaurante,superadmin',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['estado'] = 'activo';

        $user = Usuario::create($validated);

        return response()->json([
            'message' => 'Usuario creado',
            'user' => $user
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $user = Usuario::findOrFail($id);
        return response()->json($user);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $user = Usuario::findOrFail($id);

        $validated = $request->validate([
            'name'   => 'sometimes|string|max:255',
            'email'  => 'sometimes|email|unique:usuarios,email,' . $id,
            'role'   => 'sometimes|in:admin,restaurante,cliente,admin_restaurante,superadmin',
            'estado' => 'sometimes|in:activo,inactivo',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);
        $user->refresh();

        return response()->json([
            'message' => 'Usuario actualizado',
            'user'    => $user
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $user = Usuario::findOrFail($id);
        $user->estado = 'inactivo';
        $user->save();

        return response()->json([
            'message' => 'Usuario desactivado'
        ]);
    }
}
