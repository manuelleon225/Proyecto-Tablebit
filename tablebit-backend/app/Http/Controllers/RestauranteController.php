<?php

namespace App\Http\Controllers;

use App\Models\Reservas;
use App\Models\Restaurante;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RestauranteController extends Controller
{
    public function index(): JsonResponse
    {
        $restaurantes = Restaurante::activos()
            ->with(['imagenes'])
            ->withAvg('resenas', 'rating')
            ->withCount('resenas')
            ->get()
            ->map(function ($restaurante) {
                $restaurante->abierto_ahora = $restaurante->estaAbiertoAhora();
                return $restaurante;
            });

        return response()->json($restaurantes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:usuarios,id',
            'nombre' => 'required|string|max:255',
            'direccion' => 'required|string|max:255',
            'telefono' => 'nullable|string|max:50',
            'descripcion' => 'nullable|string|max:1000',
            'ciudad' => 'nullable|string|max:100',
            'tipo_comida' => 'nullable|string|max:100',
            'horario_apertura' => 'nullable|string|max:5',
            'horario_cierre' => 'nullable|string|max:5',
            'capacidad_total' => 'nullable|integer|min:1',
            'imagen' => 'nullable|string|max:500',
            'portada' => 'nullable|string|max:500',
        ]);

        $validated['estado'] = 'activo';

        $restaurante = Restaurante::create($validated);

        $restaurante->load(['horarios']);

        return response()->json([
            'message' => 'Restaurante creado',
            'restaurante' => $restaurante
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $restaurante = Restaurante::with(['mesas', 'imagenes', 'horarios'])
            ->withAvg('resenas', 'rating')
            ->withCount('resenas')
            ->findOrFail($id);

        return response()->json([
            'restaurante' => $restaurante,
            'rating_promedio' => round($restaurante->resenas_avg_rating ?? 0, 1),
            'total_resenas' => $restaurante->resenas_count ?? 0,
            'abierto_ahora' => $restaurante->estaAbiertoAhora(),
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $restaurante = Restaurante::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'direccion' => 'sometimes|string|max:255',
            'telefono' => 'nullable|string|max:50',
            'estado' => 'sometimes|in:activo,inactivo',
            'descripcion' => 'nullable|string|max:1000',
            'ciudad' => 'nullable|string|max:100',
            'tipo_comida' => 'nullable|string|max:100',
            'horario_apertura' => 'nullable|string|max:5',
            'horario_cierre' => 'nullable|string|max:5',
            'capacidad_total' => 'nullable|integer|min:1',
            'imagen' => 'nullable|string|max:500',
            'portada' => 'nullable|string|max:500',
        ]);

        $restaurante->update($validated);
        $restaurante->refresh();

        return response()->json([
            'message' => 'Restaurante actualizado',
            'restaurante' => $restaurante
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $restaurante = Restaurante::findOrFail($id);
        $restaurante->estado = 'inactivo';
        $restaurante->save();

        return response()->json([
            'message' => 'Restaurante desactivado'
        ]);
    }

    public function buscar(Request $request): JsonResponse
    {
        $query = Restaurante::activos()
            ->with(['imagenes'])
            ->withAvg('resenas', 'rating')
            ->withCount('resenas');

        if ($request->filled('nombre')) {
            $query->where('nombre', 'like', '%' . $request->nombre . '%');
        }

        if ($request->filled('ciudad')) {
            $query->where('ciudad', 'like', '%' . $request->ciudad . '%')
                  ->orWhere('direccion', 'like', '%' . $request->ciudad . '%');
        }

        if ($request->filled('tipo_comida')) {
            $query->where('tipo_comida', 'like', '%' . $request->tipo_comida . '%');
        }

        if ($request->filled('min_capacidad')) {
            $query->where('capacidad_total', '>=', $request->min_capacidad);
        }

        if ($request->filled('min_rating')) {
            $query->havingRaw('AVG((SELECT AVG(rating) FROM resenas WHERE resenas.restaurante_id = restaurantes.id)) >= ?', [$request->min_rating]);
        }

        if ($request->filled('ordenar')) {
            switch ($request->ordenar) {
                case 'rating':
                    $query->orderByDesc('resenas_avg_rating');
                    break;
                case 'nombre':
                    $query->orderBy('nombre', 'asc');
                    break;
                case 'capacidad':
                    $query->orderByDesc('capacidad_total');
                    break;
                default:
                    $query->orderBy('nombre', 'asc');
            }
        } else {
            $query->orderBy('nombre', 'asc');
        }

        $restaurantes = $query->paginate($request->per_page ?? 20);

        return response()->json($restaurantes);
    }

    public function showPublic($id): JsonResponse
    {
        $restaurante = Restaurante::with(['mesas.activas', 'imagenes', 'horarios'])
            ->withAvg('resenas', 'rating')
            ->withCount('resenas')
            ->findOrFail($id);

        $resenasRecientes = $restaurante->resenas()
            ->with('cliente')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'restaurante' => $restaurante,
            'rating_promedio' => round($restaurante->resenas_avg_rating ?? 0, 1),
            'total_resenas' => $restaurante->resenas_count ?? 0,
            'resenas_recientes' => $resenasRecientes,
            'abierto_ahora' => $restaurante->estaAbiertoAhora(),
        ]);
    }

    public function misRestaurantes(Request $request): JsonResponse
    {
        $user = $request->user();

        $restaurantes = Restaurante::where('user_id', $user->id)
            ->with(['mesas', 'imagenes'])
            ->withAvg('resenas', 'rating')
            ->withCount('resenas')
            ->get();

        return response()->json($restaurantes);
    }
}
