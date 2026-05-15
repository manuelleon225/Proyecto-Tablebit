<?php

namespace App\Http\Controllers;

use App\Models\Mesa;
use App\Models\Restaurante;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MesaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Mesa::with('restaurante');
        if ($request->has('restaurante_id')) {
            $query->where('restaurante_id', $request->restaurante_id);
        }
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }
        $mesas = $query->orderBy('numero', 'asc')->get();
        return response()->json($mesas);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'restaurante_id' => 'required|exists:restaurantes,id',
            'numero' => 'required|integer|min:1',
            'capacidad' => 'required|integer|min:1',
            'estado' => 'nullable|in:disponible,ocupada,inactiva,mantenimiento',
        ]);

        $restaurante = Restaurante::findOrFail($validated['restaurante_id']);
        $this->authorize('manageMesas', $restaurante);

        $existente = Mesa::where('restaurante_id', $validated['restaurante_id'])
            ->where('numero', $validated['numero'])
            ->where('estado', '!=', 'inactiva')
            ->exists();
        if ($existente) {
            return response()->json(['message' => 'Ya existe una mesa con ese número en este restaurante'], 409);
        }

        $validated['estado'] = $validated['estado'] ?? 'disponible';
        $mesa = Mesa::create($validated);

        return response()->json(['message' => 'Mesa creada', 'mesa' => $mesa->load('restaurante')], 201);
    }

    public function show($id): JsonResponse
    {
        $mesa = Mesa::with(['restaurante', 'reservas'])->findOrFail($id);
        $this->authorize('view', $mesa);
        return response()->json($mesa);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $mesa = Mesa::findOrFail($id);
        $this->authorize('update', $mesa);

        $validated = $request->validate([
            'restaurante_id' => 'sometimes|exists:restaurantes,id',
            'numero' => 'sometimes|integer|min:1',
            'capacidad' => 'sometimes|integer|min:1',
            'estado' => 'sometimes|in:disponible,ocupada,inactiva,mantenimiento',
        ]);

        if (isset($validated['numero'])) {
            $existente = Mesa::where('restaurante_id', $validated['restaurante_id'] ?? $mesa->restaurante_id)
                ->where('numero', $validated['numero'])
                ->where('id', '!=', $id)
                ->where('estado', '!=', 'inactiva')
                ->exists();
            if ($existente) {
                return response()->json(['message' => 'Ya existe otra mesa con ese número'], 409);
            }
        }

        $mesa->update($validated);
        $mesa->refresh();
        return response()->json(['message' => 'Mesa actualizada', 'mesa' => $mesa->load('restaurante')]);
    }

    public function destroy($id): JsonResponse
    {
        $mesa = Mesa::findOrFail($id);
        $this->authorize('delete', $mesa);

        $tieneReservasActivas = $mesa->reservas()
            ->whereIn('estado', ['pendiente', 'confirmada'])
            ->where('fecha', '>=', now()->toDateString())
            ->exists();
        if ($tieneReservasActivas) {
            return response()->json(['message' => 'No se puede desactivar una mesa con reservas activas'], 400);
        }

        $mesa->estado = 'inactiva';
        $mesa->save();
        return response()->json(['message' => 'Mesa desactivada']);
    }

    public function delRestaurante($restauranteId): JsonResponse
    {
        $restaurante = Restaurante::findOrFail($restauranteId);
        $this->authorize('manageReservas', $restaurante);
        $mesas = Mesa::where('restaurante_id', $restauranteId)
            ->orderBy('numero', 'asc')
            ->get();
        return response()->json($mesas);
    }
}
