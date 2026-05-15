<?php

namespace App\Http\Controllers;

use App\Models\RestaurantHour;
use App\Models\Restaurante;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class RestaurantHourController extends Controller
{
    public function index($restauranteId): JsonResponse
    {
        $restaurante = Restaurante::findOrFail($restauranteId);
        $this->authorize('manageReservas', $restaurante);

        $hours = RestaurantHour::where('restaurante_id', $restauranteId)
            ->orderBy('day_of_week')
            ->get();

        return response()->json($hours);
    }

    public function update(Request $request, $restauranteId): JsonResponse
    {
        $restaurante = Restaurante::findOrFail($restauranteId);
        $this->authorize('manageReservas', $restaurante);

        $validated = $request->validate([
            'hours' => 'required|array|size:7',
            'hours.*.day_of_week' => 'required|integer|between:0,6',
            'hours.*.is_closed' => 'required|boolean',
            'hours.*.open_time' => 'exclude_if:hours.*.is_closed,true|required|date_format:H:i',
            'hours.*.close_time' => 'exclude_if:hours.*.is_closed,true|required|date_format:H:i|after:hours.*.open_time',
        ]);

        $saved = [];
        foreach ($validated['hours'] as $hourData) {
            $hour = RestaurantHour::updateOrCreate(
                ['restaurante_id' => $restauranteId, 'day_of_week' => $hourData['day_of_week']],
                [
                    'open_time' => $hourData['is_closed'] ? null : ($hourData['open_time'] ?? null),
                    'close_time' => $hourData['is_closed'] ? null : ($hourData['close_time'] ?? null),
                    'is_closed' => $hourData['is_closed'],
                ]
            );
            $saved[] = $hour;
        }

        return response()->json(['message' => 'Horarios actualizados', 'hours' => $saved]);
    }
}
