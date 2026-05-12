<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reservas;
use App\Models\Mesa;
use App\Models\Restaurante;
use App\Services\ReservaService;
use Illuminate\Support\Facades\DB;

class ReservaController extends Controller
{
    protected $reservaService;

    public function __construct(ReservaService $reservaService)
    {
        $this->reservaService = $reservaService;
    }

    public function index(Request $request)
    {
        $query = Reservas::with(['cliente', 'mesa', 'restaurante']);

        if ($request->has('restaurante_id')) {
            $query->where('restaurante_id', $request->restaurante_id);
        }

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
            $query->whereBetween('fecha', [$request->fecha_inicio, $request->fecha_fin]);
        }

        if ($request->has('fecha')) {
            $query->where('fecha', $request->fecha);
        }

        $reservas = $query->orderBy('fecha', 'desc')
            ->orderBy('hora', 'asc')
            ->paginate($request->per_page ?? 20);

        return response()->json($reservas);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'restaurante_id'    => 'required|exists:restaurantes,id',
            'mesa_id'           => 'nullable|exists:mesas,id',
            'fecha'             => 'required|date|after_or_equal:today',
            'hora'              => 'required|date_format:H:i',
            'duracion'          => 'nullable|integer|min:15|max:300',
            'cantidad_personas' => 'required|integer|min:1|max:50',
            'tipo_evento'       => 'nullable|string|max:100',
            'notas'             => 'nullable|string|max:500',
        ]);

        $clienteId = $request->user()->id;

        try {
            $reserva = $this->reservaService->crearReserva(
                $clienteId,
                $validated['restaurante_id'],
                $validated['fecha'],
                $validated['hora'],
                $validated['cantidad_personas'],
                $validated['mesa_id'] ?? null,
                $validated['duracion'] ?? null,
                $validated['tipo_evento'] ?? null,
                $validated['notas'] ?? null
            );

            return response()->json([
                'message' => 'Reserva confirmada automáticamente',
                'reserva' => $reserva
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function show($id)
    {
        $reserva = Reservas::with(['cliente', 'mesa', 'restaurante', 'resena'])->findOrFail($id);
        return response()->json($reserva);
    }

    public function update(Request $request, $id)
    {
        $reserva = Reservas::findOrFail($id);

        $validated = $request->validate([
            'fecha'             => 'sometimes|date|after_or_equal:today',
            'hora'              => 'sometimes|date_format:H:i',
            'duracion'          => 'sometimes|integer|min:15|max:300',
            'cantidad_personas' => 'sometimes|integer|min:1|max:50',
            'mesa_id'           => 'sometimes|exists:mesas,id',
            'tipo_evento'       => 'nullable|string|max:100',
            'notas'             => 'nullable|string|max:500',
        ]);

        if (isset($validated['fecha']) || isset($validated['hora']) || isset($validated['mesa_id'])) {
            $checkFecha = $validated['fecha'] ?? $reserva->fecha;
            $checkHora = $validated['hora'] ?? $reserva->hora;
            $checkMesa = $validated['mesa_id'] ?? $reserva->mesa_id;
            $checkDuracion = $validated['duracion'] ?? $reserva->duracion;

            $conflicto = Reservas::where('mesa_id', $checkMesa)
                ->where('fecha', $checkFecha)
                ->where('id', '!=', $id)
                ->whereNotIn('estado', ['cancelada', 'no_show'])
                ->where(function ($query) use ($checkHora, $checkDuracion) {
                    $horaFin = date('H:i', strtotime($checkHora) + ($checkDuracion * 60));
                    $query->where('hora', '<', $horaFin)
                          ->whereRaw("ADDTIME(hora, SEC_TO_TIME(duracion * 60)) > ?", [$checkHora]);
                })
                ->exists();

            if ($conflicto) {
                return response()->json([
                    'message' => 'Existe un conflicto de horario con otra reserva'
                ], 409);
            }
        }

        if (isset($validated['hora']) && isset($validated['duracion'])) {
            $validated['hora_fin'] = date('H:i:s', strtotime($validated['hora']) + ($validated['duracion'] * 60));
        } elseif (isset($validated['hora'])) {
            $duracion = $validated['duracion'] ?? $reserva->duracion;
            $validated['hora_fin'] = date('H:i:s', strtotime($validated['hora']) + ($duracion * 60));
        }

        $reserva->update($validated);
        $reserva->refresh();
        $reserva->load(['cliente', 'mesa', 'restaurante']);

        return response()->json([
            'message' => 'Reserva actualizada',
            'reserva' => $reserva
        ]);
    }

    public function destroy($id)
    {
        try {
            $reserva = $this->reservaService->cancelarReserva($id);
            return response()->json([
                'message' => 'Reserva cancelada',
                'reserva' => $reserva
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function disponibilidad(Request $request)
    {
        $validated = $request->validate([
            'restaurante_id' => 'required|exists:restaurantes,id',
            'fecha'          => 'required|date|after_or_equal:today',
            'hora'           => 'required|date_format:H:i',
            'duracion'       => 'nullable|integer|min:15|max:300',
            'personas'       => 'required|integer|min:1|max:50',
        ]);

        $resultado = $this->reservaService->verificarDisponibilidad(
            $validated['restaurante_id'],
            $validated['fecha'],
            $validated['hora'],
            $validated['personas'],
            $validated['duracion'] ?? null
        );

        return response()->json($resultado);
    }

    public function reservaAutomatica(Request $request)
    {
        $validated = $request->validate([
            'restaurante_id'    => 'required|exists:restaurantes,id',
            'fecha'             => 'required|date|after_or_equal:today',
            'hora'              => 'required|date_format:H:i',
            'duracion'          => 'nullable|integer|min:15|max:300',
            'cantidad_personas' => 'required|integer|min:1|max:50',
            'tipo_evento'       => 'nullable|string|max:100',
            'notas'             => 'nullable|string|max:500',
        ]);

        $clienteId = $request->user()->id;

        try {
            $reserva = $this->reservaService->crearReserva(
                $clienteId,
                $validated['restaurante_id'],
                $validated['fecha'],
                $validated['hora'],
                $validated['cantidad_personas'],
                null,
                $validated['duracion'] ?? null,
                $validated['tipo_evento'] ?? null,
                $validated['notas'] ?? null
            );

            return response()->json([
                'message' => 'Reserva confirmada automáticamente',
                'reserva' => $reserva
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function calendarioRestaurante(Request $request, $restauranteId)
    {
        $validated = $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin'    => 'required|date|after_or_equal:fecha_inicio',
        ]);

        $reservas = $this->reservaService->obtenerReservasCalendario(
            $restauranteId,
            $validated['fecha_inicio'],
            $validated['fecha_fin']
        );

        $eventos = $reservas->map(function ($reserva) {
            return [
                'id' => $reserva->id,
                'title' => $reserva->cliente ? $reserva->cliente->name : 'Reserva',
                'start' => $reserva->fecha . 'T' . (is_string($reserva->hora) ? $reserva->hora : ($reserva->hora ? $reserva->hora->format('H:i') : '')),
                'end' => $reserva->hora_fin
                    ? $reserva->fecha . 'T' . (is_string($reserva->hora_fin) ? $reserva->hora_fin : ($reserva->hora_fin ? $reserva->hora_fin->format('H:i') : ''))
                    : null,
                'extendedProps' => [
                    'estado' => $reserva->estado,
                    'mesa' => $reserva->mesa ? 'Mesa ' . $reserva->mesa->numero : null,
                    'personas' => $reserva->cantidad_personas,
                    'cliente_email' => $reserva->cliente ? $reserva->cliente->email : null,
                    'cliente_telefono' => $reserva->cliente ? $reserva->cliente->telefono : null,
                    'notas' => $reserva->notas,
                    'duracion' => $reserva->duracion,
                ],
                'backgroundColor' => $this->getColorByEstado($reserva->estado),
                'borderColor' => $this->getColorByEstado($reserva->estado),
            ];
        });

        return response()->json([
            'restaurante_id' => $restauranteId,
            'fecha_inicio' => $validated['fecha_inicio'],
            'fecha_fin' => $validated['fecha_fin'],
            'eventos' => $eventos,
        ]);
    }

    public function dashboardRestaurante($restauranteId)
    {
        $fechaInicio = request()->input('fecha_inicio');
        $fechaFin = request()->input('fecha_fin');

        $analytics = $this->reservaService->getAnalyticsRestaurante(
            $restauranteId,
            $fechaInicio,
            $fechaFin
        );

        return response()->json($analytics);
    }

    public function misReservas(Request $request)
    {
        $user = $request->user();

        $query = Reservas::with(['mesa', 'restaurante'])
            ->where('cliente_id', $user->id);

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('futuras') && $request->futuras === 'true') {
            $query->where('fecha', '>=', now()->toDateString())
                  ->whereNotIn('estado', ['cancelada', 'no_show']);
        }

        $reservas = $query->orderBy('fecha', 'desc')
            ->orderBy('hora', 'asc')
            ->get();

        return response()->json($reservas);
    }

    public function cancelar($id)
    {
        try {
            $reserva = $this->reservaService->cancelarReserva($id);
            return response()->json([
                'message' => 'Reserva cancelada correctamente',
                'reserva' => $reserva
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function cambiarEstado(Request $request, $id)
    {
        $validated = $request->validate([
            'estado' => 'required|in:pendiente,confirmada,completada,cancelada,no_show',
        ]);

        $reserva = Reservas::findOrFail($id);

        switch ($validated['estado']) {
            case 'completada':
                $reserva = $this->reservaService->completarReserva($id);
                break;
            case 'no_show':
                $reserva = $this->reservaService->marcarNoShow($id);
                break;
            case 'confirmada':
                $reserva->estado = 'confirmada';
                $reserva->save();
                break;
            case 'pendiente':
                $reserva->estado = 'pendiente';
                $reserva->save();
                break;
            default:
                return response()->json(['message' => 'Estado no válido'], 400);
        }

        $reserva->load(['cliente', 'mesa', 'restaurante']);

        return response()->json([
            'message' => 'Estado actualizado',
            'reserva' => $reserva
        ]);
    }

    private function getColorByEstado($estado)
    {
        return match ($estado) {
            'pendiente' => '#f59e0b',
            'confirmada' => '#10b981',
            'completada' => '#6366f1',
            'cancelada' => '#ef4444',
            'no_show' => '#6b7280',
            default => '#8b5cf6',
        };
    }
}
