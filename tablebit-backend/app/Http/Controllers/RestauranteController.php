<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRestauranteRequest;
use App\Http\Requests\UpdateRestauranteRequest;
use App\Models\Restaurante;
use App\Models\RestaurantHour;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

    public function store(StoreRestauranteRequest $request): JsonResponse
    {
        $this->authorize('create', Restaurante::class);

        DB::beginTransaction();
        try {
            $validated = $request->validated();
            $validated['estado'] = 'activo';
            $validated['user_id'] = $request->user()->id;

            $restaurante = Restaurante::create($validated);
            $restaurante->users()->attach($request->user()->id, ['role' => 'owner']);
            $restaurante->load(['horarios']);

            DB::commit();

            return response()->json([
                'message' => 'Restaurante creado',
                'restaurante' => $restaurante
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear el restaurante',
                'error' => $e->getMessage(),
            ], 500);
        }
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

    public function update(UpdateRestauranteRequest $request, $id): JsonResponse
    {
        $restaurante = Restaurante::findOrFail($id);
        $this->authorize('update', $restaurante);

        $restaurante->update($request->validated());
        $restaurante->refresh();

        return response()->json([
            'message' => 'Restaurante actualizado',
            'restaurante' => $restaurante
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $restaurante = Restaurante::findOrFail($id);
        $this->authorize('delete', $restaurante);

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
            $safe = addcslashes($request->nombre, '%_');
            $query->where('nombre', 'like', '%' . $safe . '%');
        }

        if ($request->filled('ciudad')) {
            $safe = addcslashes($request->ciudad, '%_');
            $query->where(function ($q) use ($safe) {
                $q->where('ciudad', 'like', '%' . $safe . '%')
                  ->orWhere('direccion', 'like', '%' . $safe . '%');
            });
        }

        if ($request->filled('tipo_comida')) {
            $safe = addcslashes($request->tipo_comida, '%_');
            $query->where('tipo_comida', 'like', '%' . $safe . '%');
        }

        if ($request->filled('min_capacidad')) {
            $query->where('capacidad_total', '>=', $request->min_capacidad);
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

    public function showPublicBySlug($slug): JsonResponse
    {
        $restaurante = Restaurante::with(['mesas' => function ($q) {
                $q->whereNotIn('estado', ['inactiva', 'mantenimiento']);
            }, 'imagenes'])
            ->withAvg('resenas', 'rating')
            ->withCount('resenas')
            ->where('slug', $slug)
            ->firstOrFail();

        $hours = RestaurantHour::where('restaurante_id', $restaurante->id)
            ->orderBy('day_of_week')
            ->get();

        $resenasRecientes = $restaurante->resenas()
            ->with('cliente')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $related = Restaurante::where('id', '!=', $restaurante->id)
            ->where('estado', 'activo')
            ->where(function ($q) use ($restaurante) {
                if ($restaurante->ciudad) {
                    $q->where('ciudad', $restaurante->ciudad);
                }
                if ($restaurante->tipo_comida) {
                    $q->orWhere('tipo_comida', $restaurante->tipo_comida);
                }
            })
            ->withAvg('resenas', 'rating')
            ->withCount('resenas')
            ->limit(3)
            ->get();

        return response()->json([
            'restaurante' => $restaurante,
            'hours' => $hours,
            'related' => $related,
            'rating_promedio' => round($restaurante->resenas_avg_rating ?? 0, 1),
            'total_resenas' => $restaurante->resenas_count ?? 0,
            'resenas_recientes' => $resenasRecientes,
            'abierto_ahora' => $restaurante->estaAbiertoAhora(),
        ]);
    }

    public function misRestaurantes(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'superadmin') {
            $restaurantes = Restaurante::with(['mesas', 'imagenes'])
                ->withAvg('resenas', 'rating')
                ->withCount('resenas')
                ->get();
        } else {
            $restaurantes = $user->restaurantes()
                ->with(['mesas', 'imagenes'])
                ->withAvg('resenas', 'rating')
                ->withCount('resenas')
                ->get();
        }

        return response()->json($restaurantes);
    }
}
