<?php

namespace App\Http\Controllers;

use App\Http\Requests\DisponibilidadRequest;
use App\Http\Requests\StoreReservaRequest;
use App\Models\Reservas;
use App\Models\Restaurante;
use App\Services\ReservaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReservaController extends Controller
{
    public function __construct(
        private readonly ReservaService $reservaService
    ) {}

    public function index(Request $request): JsonResponse
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

    public function store(StoreReservaRequest $request): JsonResponse
    {
        $validated = $request->validated();
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
            Log::warning('Error al crear reserva', [
                'user_id' => $clienteId,
                'restaurante_id' => $validated['restaurante_id'] ?? null,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function show($id): JsonResponse
    {
        $reserva = Reservas::with(['cliente', 'mesa', 'restaurante', 'resena'])->findOrFail($id);
        $this->authorize('view', $reserva);
        return response()->json($reserva);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $reserva = Reservas::findOrFail($id);
        $this->authorize('update', $reserva);

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

            $conflicto = $this->reservaService->tieneConflicto(
                $checkMesa,
                $checkFecha,
                $checkHora,
                $checkDuracion,
                $id
            );

            if ($conflicto) {
                return response()->json([
                    'message' => 'Existe un conflicto de horario con otra reserva'
                ], 409);
            }
        }

        if (isset($validated['hora']) && isset($validated['duracion'])) {
            $validated['hora_fin'] = date('H:i:s', strtotime($validated['hora']) + ($validated['duracion'] * 60));
        } elseif (isset($validated['hora'])) {
            $validated['hora_fin'] = date('H:i:s', strtotime($validated['hora']) + (($validated['duracion'] ?? $reserva->duracion) * 60));
        }

        $reserva->update($validated);
        $reserva->refresh();
        $reserva->load(['cliente', 'mesa', 'restaurante']);

        return response()->json([
            'message' => 'Reserva actualizada',
            'reserva' => $reserva
        ]);
    }

    public function disponibilidad(DisponibilidadRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $resultado = $this->reservaService->verificarDisponibilidad(
            $validated['restaurante_id'],
            $validated['fecha'],
            $validated['hora'],
            $validated['personas'],
            $validated['duracion'] ?? null
        );

        return response()->json($resultado);
    }

    public function reservaAutomatica(StoreReservaRequest $request): JsonResponse
    {
        $validated = $request->validated();
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
            Log::warning('Error en reserva automatica', [
                'user_id' => $clienteId,
                'restaurante_id' => $validated['restaurante_id'] ?? null,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function calendarioRestaurante(Request $request, $restauranteId): JsonResponse
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

    public function dashboardRestaurante($restauranteId): JsonResponse
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

    public function misReservas(Request $request): JsonResponse
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

    public function cancelar($id): JsonResponse
    {
        try {
            $reserva = Reservas::findOrFail($id);
            $this->authorize('cancel', $reserva);

            $reserva = $this->reservaService->cancelarReserva($id);

            return response()->json([
                'message' => 'Reserva cancelada correctamente',
                'reserva' => $reserva
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::warning('Error al cancelar reserva', [
                'reserva_id' => $id,
                'user_id' => request()->user()?->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function cambiarEstado(Request $request, $id): JsonResponse
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

    private function getColorByEstado($estado): string
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
