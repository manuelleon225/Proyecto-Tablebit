<?php

namespace App\Http\Controllers;

use App\Models\Resena;
use App\Models\Restaurante;
use Illuminate\Http\Request;

class ResenaController extends Controller
{
    public function index($restauranteId)
    {
        $resenas = Resena::with('cliente')
            ->where('restaurante_id', $restauranteId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $ratingPromedio = Resena::where('restaurante_id', $restauranteId)->avg('rating') ?? 0;
        $totalResenas = Resena::where('restaurante_id', $restauranteId)->count();

        $distribucion = [];
        for ($i = 5; $i >= 1; $i--) {
            $distribucion[$i] = Resena::where('restaurante_id', $restauranteId)->where('rating', $i)->count();
        }

        return response()->json([
            'resenas' => $resenas,
            'rating_promedio' => round($ratingPromedio, 1),
            'total_resenas' => $totalResenas,
            'distribucion' => $distribucion,
        ]);
    }

    public function store(Request $request, $restauranteId)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comentario' => 'nullable|string|max:1000',
            'reserva_id' => 'nullable|exists:reservas,id',
        ]);

        $restaurante = Restaurante::findOrFail($restauranteId);
        $clienteId = $request->user()->id;

        $existente = Resena::where('cliente_id', $clienteId)
            ->where('restaurante_id', $restauranteId)
            ->first();

        if ($existente) {
            $existente->update([
                'rating' => $validated['rating'],
                'comentario' => $validated['comentario'],
            ]);

            $existente->load('cliente');

            return response()->json([
                'message' => 'Reseña actualizada',
                'resena' => $existente
            ]);
        }

        $resena = Resena::create([
            'cliente_id' => $clienteId,
            'restaurante_id' => $restauranteId,
            'reserva_id' => $validated['reserva_id'] ?? null,
            'rating' => $validated['rating'],
            'comentario' => $validated['comentario'],
        ]);

        $resena->load('cliente');

        return response()->json([
            'message' => 'Reseña creada',
            'resena' => $resena
        ], 201);
    }

    public function misResenas(Request $request)
    {
        $resenas = Resena::with('restaurante')
            ->where('cliente_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($resenas);
    }

    public function destroy($id)
    {
        $resena = Resena::findOrFail($id);

        if ($resena->cliente_id !== request()->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $resena->delete();

        return response()->json(['message' => 'Reseña eliminada']);
    }
}
