<?php

namespace App\Http\Controllers;

use App\Models\RestaurantReview;
use App\Models\Restaurante;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RestaurantReviewController extends Controller
{
    public function index($restauranteId): JsonResponse
    {
        $reviews = RestaurantReview::with('usuario:id,name')
            ->where('restaurante_id', $restauranteId)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        $avg = RestaurantReview::where('restaurante_id', $restauranteId)->avg('rating');
        $total = RestaurantReview::where('restaurante_id', $restauranteId)->count();

        return response()->json([
            'reviews' => $reviews,
            'promedio' => round($avg ?? 0, 1),
            'total' => $total,
        ]);
    }

    public function store(Request $request, $restauranteId): JsonResponse
    {
        $validated = $request->validate([
            'rating' => 'required|integer|between:1,5',
            'comentario' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();

        $restaurante = Restaurante::findOrFail($restauranteId);

        if ($restaurante->user_id === $user->id) {
            return response()->json(['message' => 'No puedes reseñar tu propio restaurante'], 403);
        }

        $existing = RestaurantReview::where('restaurante_id', $restauranteId)
            ->where('usuario_id', $user->id)
            ->exists();
        if ($existing) {
            return response()->json(['message' => 'Ya has reseñado este restaurante'], 409);
        }

        $review = RestaurantReview::create([
            'restaurante_id' => $restauranteId,
            'usuario_id' => $user->id,
            'rating' => $validated['rating'],
            'comentario' => $validated['comentario'],
        ]);

        $review->load('usuario:id,name');

        return response()->json(['message' => 'Reseña creada', 'review' => $review], 201);
    }
}
