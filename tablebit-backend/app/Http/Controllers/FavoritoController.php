<?php

namespace App\Http\Controllers;

use App\Models\Favorito;
use App\Models\Restaurante;
use Illuminate\Http\Request;

class FavoritoController extends Controller
{
    public function index(Request $request)
    {
        $favoritos = Favorito::with(['restaurante' => function ($query) {
            $query->withCount('resenas');
        }])
        ->where('cliente_id', $request->user()->id)
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($favoritos);
    }

    public function toggle(Request $request, $restauranteId)
    {
        $restaurante = Restaurante::findOrFail($restauranteId);
        $clienteId = $request->user()->id;

        $favorito = Favorito::where('cliente_id', $clienteId)
            ->where('restaurante_id', $restauranteId)
            ->first();

        if ($favorito) {
            $favorito->delete();
            return response()->json([
                'message' => 'Restaurante removido de favoritos',
                'es_favorito' => false
            ]);
        }

        $favorito = Favorito::create([
            'cliente_id' => $clienteId,
            'restaurante_id' => $restauranteId,
        ]);

        return response()->json([
            'message' => 'Restaurante agregado a favoritos',
            'es_favorito' => true,
            'favorito' => $favorito
        ], 201);
    }

    public function verificar(Request $request, $restauranteId)
    {
        $existe = Favorito::where('cliente_id', $request->user()->id)
            ->where('restaurante_id', $restauranteId)
            ->exists();

        return response()->json(['es_favorito' => $existe]);
    }
}
