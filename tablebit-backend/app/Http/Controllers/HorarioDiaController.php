<?php

namespace App\Http\Controllers;

use App\Models\HorarioDia;
use App\Models\Restaurante;
use Illuminate\Http\Request;

class HorarioDiaController extends Controller
{
    public function index($restauranteId)
    {
        $horarios = HorarioDia::where('restaurante_id', $restauranteId)
            ->orderByRaw("FIELD(dia, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')")
            ->get();

        return response()->json($horarios);
    }

    public function store(Request $request, $restauranteId)
    {
        $restaurante = Restaurante::findOrFail($restauranteId);

        $validated = $request->validate([
            'dia' => 'required|in:lunes,martes,miercoles,jueves,viernes,sabado,domingo',
            'activo' => 'boolean',
            'hora_apertura' => 'nullable|date_format:H:i',
            'hora_cierre' => 'nullable|date_format:H:i|after:hora_apertura',
            'hora_apertura_tarde' => 'nullable|date_format:H:i',
            'hora_cierre_tarde' => 'nullable|date_format:H:i|after:hora_apertura_tarde',
        ]);

        $existente = HorarioDia::where('restaurante_id', $restauranteId)
            ->where('dia', $validated['dia'])
            ->first();

        if ($existente) {
            $existente->update($validated);
            return response()->json([
                'message' => 'Horario actualizado',
                'horario' => $existente
            ]);
        }

        $horario = HorarioDia::create([
            'restaurante_id' => $restauranteId,
            ...$validated,
        ]);

        return response()->json([
            'message' => 'Horario creado',
            'horario' => $horario
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $horario = HorarioDia::findOrFail($id);

        $validated = $request->validate([
            'activo' => 'sometimes|boolean',
            'hora_apertura' => 'nullable|date_format:H:i',
            'hora_cierre' => 'nullable|date_format:H:i',
            'hora_apertura_tarde' => 'nullable|date_format:H:i',
            'hora_cierre_tarde' => 'nullable|date_format:H:i',
        ]);

        $horario->update($validated);
        $horario->refresh();

        return response()->json([
            'message' => 'Horario actualizado',
            'horario' => $horario
        ]);
    }

    public function seedDefaults($restauranteId)
    {
        Restaurante::findOrFail($restauranteId);

        $dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

        foreach ($dias as $dia) {
            $existente = HorarioDia::where('restaurante_id', $restauranteId)
                ->where('dia', $dia)
                ->first();

            if (!$existente) {
                $esFinDeSemana = in_array($dia, ['sabado', 'domingo']);

                HorarioDia::create([
                    'restaurante_id' => $restauranteId,
                    'dia' => $dia,
                    'activo' => !$esFinDeSemana,
                    'hora_apertura' => $esFinDeSemana ? null : '09:00',
                    'hora_cierre' => $esFinDeSemana ? null : '22:00',
                ]);
            }
        }

        $horarios = HorarioDia::where('restaurante_id', $restauranteId)
            ->orderByRaw("FIELD(dia, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')")
            ->get();

        return response()->json([
            'message' => 'Horarios por defecto creados',
            'horarios' => $horarios
        ]);
    }

    public function destroy($id)
    {
        $horario = HorarioDia::findOrFail($id);
        $horario->delete();

        return response()->json(['message' => 'Horario eliminado']);
    }
}
