<?php

namespace App\Services;

use App\Models\Reservas;
use App\Models\Mesa;
use App\Models\Restaurante;
use App\Models\RestaurantHour;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReservaService
{
    private const DURACION_DEFAULT = 90;

    private const LIMITE_RESERVAS_POR_DIA = 5;

    private const MESES_MAXIMO_ANTICIPACION = 3;

    public function verificarDisponibilidad($restauranteId, $fecha, $hora, $personas, $duracion = null)
    {
        $duracion = $duracion ?? self::DURACION_DEFAULT;

        $restaurante = Restaurante::with('horarios')->find($restauranteId);
        if (!$restaurante) {
            return ['disponible' => false, 'error' => 'Restaurante no encontrado'];
        }

        $validacionHorario = $this->validarHorarioRestaurante($restaurante, $fecha, $hora);
        if (!$validacionHorario['valido']) {
            return ['disponible' => false, 'error' => $validacionHorario['mensaje']];
        }

        $horaInicio = is_string($hora) ? $hora : $hora->format('H:i');

        $mesas = Mesa::where('restaurante_id', $restauranteId)
            ->where('capacidad', '>=', $personas)
            ->whereNotIn('estado', ['inactiva', 'mantenimiento'])
            ->orderBy('capacidad', 'asc')
            ->get();

        $mesasDisponibles = [];

        foreach ($mesas as $mesa) {
            if (!$this->tieneConflicto($mesa->id, $fecha, $horaInicio, $duracion)) {
                $mesasDisponibles[] = $mesa;
            }
        }

        return [
            'disponible' => count($mesasDisponibles) > 0,
            'mesas' => $mesasDisponibles,
            'total_disponibles' => count($mesasDisponibles),
        ];
    }

    public function crearReserva($clienteId, $restauranteId, $fecha, $hora, $personas, $mesaId = null, $duracion = null, $tipoEvento = null, $notas = null)
    {
        $duracion = $duracion ?? self::DURACION_DEFAULT;

        return DB::transaction(function () use ($clienteId, $restauranteId, $fecha, $hora, $personas, $mesaId, $duracion, $tipoEvento, $notas) {
            $restaurante = Restaurante::with('horarios')->find($restauranteId);
            if (!$restaurante) {
                throw new \Exception('Restaurante no encontrado');
            }

            $validacionFecha = $this->validarFechaReserva($fecha);
            if (!$validacionFecha['valido']) {
                throw new \Exception($validacionFecha['mensaje']);
            }

            $validacionHorario = $this->validarHorarioRestaurante($restaurante, $fecha, $hora);
            if (!$validacionHorario['valido']) {
                throw new \Exception($validacionHorario['mensaje']);
            }

            $validacionLimite = $this->validarLimiteReservas($clienteId, $fecha);
            if (!$validacionLimite['valido']) {
                throw new \Exception($validacionLimite['mensaje']);
            }

            $horaInicio = is_string($hora) ? $hora : $hora->format('H:i');
            $horaFin = date('H:i:s', strtotime($horaInicio) + ($duracion * 60));

            if ($mesaId) {
                $mesa = Mesa::find($mesaId);
                if (!$mesa || $mesa->restaurante_id != $restauranteId) {
                    throw new \Exception('Mesa no válida para este restaurante');
                }

                if ($mesa->estado === 'inactiva') {
                    throw new \Exception('La mesa no está disponible');
                }

                if ($mesa->capacidad < $personas) {
                    throw new \Exception('La mesa no tiene capacidad suficiente');
                }

                $conflicto = $this->tieneConflicto($mesaId, $fecha, $horaInicio, $duracion);
                if ($conflicto) {
                    throw new \Exception('La mesa ya está reservada para ese horario');
                }
            } else {
                $mesa = $this->buscarMejorMesa($restauranteId, $fecha, $horaInicio, $personas, $duracion);
                if (!$mesa) {
                    throw new \Exception('No hay mesas disponibles para los datos solicitados');
                }

                $mesaId = $mesa->id;
            }

            $reserva = Reservas::create([
                'cliente_id' => $clienteId,
                'restaurante_id' => $restauranteId,
                'mesa_id' => $mesaId,
                'fecha' => $fecha,
                'hora' => $horaInicio,
                'hora_fin' => $horaFin,
                'duracion' => $duracion,
                'cantidad_personas' => $personas,
                'tipo_evento' => $tipoEvento,
                'notas' => $notas,
                'estado' => 'confirmada',
            ]);

            $reserva->load(['cliente', 'mesa', 'restaurante']);

            Cache::forget("analytics.{$restauranteId}." . Carbon::parse($fecha)->toDateString() . "." . Carbon::parse($fecha)->toDateString());

            return $reserva;
        });
    }

    public function cancelarReserva($reservaId)
    {
        return DB::transaction(function () use ($reservaId) {
            $reserva = Reservas::findOrFail($reservaId);

            if ($reserva->estado === 'cancelada') {
                throw new \Exception('La reserva ya está cancelada');
            }

            if ($reserva->estado === 'completada') {
                throw new \Exception('No se puede cancelar una reserva completada');
            }

            $fechaReserva = Carbon::parse($reserva->fecha);
            $hoy = Carbon::today();

            if ($fechaReserva->lt($hoy)) {
                throw new \Exception('No se puede cancelar una reserva pasada');
            }

            $reserva->estado = 'cancelada';
            $reserva->save();

            $reserva->load(['cliente', 'mesa', 'restaurante']);

            Cache::forget("analytics.{$reserva->restaurante_id}." . Carbon::parse($reserva->fecha)->toDateString() . "." . Carbon::parse($reserva->fecha)->toDateString());

            return $reserva;
        });
    }

    public function completarReserva($reservaId)
    {
        $reserva = Reservas::findOrFail($reservaId);

        if ($reserva->estado !== 'confirmada') {
            throw new \Exception('Solo se pueden completar reservas confirmadas');
        }

        $reserva->estado = 'completada';
        $reserva->save();

        return $reserva;
    }

    public function marcarNoShow($reservaId)
    {
        $reserva = Reservas::findOrFail($reservaId);

        if (!in_array($reserva->estado, ['pendiente', 'confirmada'])) {
            throw new \Exception('No se puede marcar como no-show una reserva ' . $reserva->estado);
        }

        $reserva->estado = 'no_show';
        $reserva->save();

        return $reserva;
    }

    public function obtenerReservasCalendario($restauranteId, $fechaInicio, $fechaFin)
    {
        return Reservas::with(['cliente', 'mesa', 'restaurante'])
            ->where('restaurante_id', $restauranteId)
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->whereNotIn('estado', ['cancelada', 'no_show'])
            ->orderBy('fecha', 'asc')
            ->orderBy('hora', 'asc')
            ->get();
    }

    public function getAnalyticsRestaurante($restauranteId, $fechaInicio = null, $fechaFin = null)
    {
        $cacheKey = "analytics.{$restauranteId}.{$fechaInicio}.{$fechaFin}";

        return Cache::remember($cacheKey, 300, function () use ($restauranteId, $fechaInicio, $fechaFin) {
            $fechaInicio = $fechaInicio ?? Carbon::today()->toDateString();
            $fechaFin = $fechaFin ?? Carbon::today()->toDateString();

            $reservas = Reservas::where('restaurante_id', $restauranteId)
                ->whereBetween('fecha', [$fechaInicio, $fechaFin]);
            $totalReservas = (clone $reservas)->count();
        $confirmadas = (clone $reservas)->where('estado', 'confirmada')->count();
        $completadas = (clone $reservas)->where('estado', 'completada')->count();
        $canceladas = (clone $reservas)->where('estado', 'cancelada')->count();
        $noShows = (clone $reservas)->where('estado', 'no_show')->count();

        $totalMesas = Mesa::where('restaurante_id', $restauranteId)->whereNotIn('estado', ['inactiva', 'mantenimiento'])->count();
        $mesasOcupadasHoy = Reservas::where('restaurante_id', $restauranteId)
            ->where('fecha', Carbon::today()->toDateString())
            ->whereNotIn('estado', ['cancelada', 'no_show'])
            ->distinct('mesa_id')
            ->count('mesa_id');

        $ocupacionHoy = $totalMesas > 0 ? round(($mesasOcupadasHoy / $totalMesas) * 100, 1) : 0;

        $personasPromedio = Reservas::where('restaurante_id', $restauranteId)
            ->whereNotIn('estado', ['cancelada', 'no_show'])
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->avg('cantidad_personas');

        $horasPico = Reservas::selectRaw('HOUR(hora) as hora_int, COUNT(*) as total')
            ->where('restaurante_id', $restauranteId)
            ->whereNotIn('estado', ['cancelada', 'no_show'])
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->groupBy(DB::raw('HOUR(hora)'))
            ->orderBy('total', 'desc')
            ->limit(5)
            ->get()
            ->map(fn ($item) => ['hora' => (int) $item->hora_int, 'total' => (int) $item->total])
            ->values();

        $reservasPorDia = Reservas::selectRaw('DATE(fecha) as fecha, COUNT(*) as total')
            ->where('restaurante_id', $restauranteId)
            ->whereNotIn('estado', ['cancelada', 'no_show'])
            ->whereBetween('fecha', [Carbon::parse($fechaInicio)->subDays(30)->toDateString(), $fechaFin])
            ->groupBy('fecha')
            ->orderBy('fecha', 'asc')
            ->get();

        $reservasPorSemana = Reservas::selectRaw('YEARWEEK(fecha, 1) as semana, COUNT(*) as total')
            ->where('restaurante_id', $restauranteId)
            ->whereNotIn('estado', ['cancelada', 'no_show'])
            ->whereBetween('fecha', [Carbon::parse($fechaInicio)->subWeeks(12)->toDateString(), $fechaFin])
            ->groupBy('semana')
            ->orderBy('semana', 'asc')
            ->get();

        return [
            'reservas_hoy' => Reservas::where('restaurante_id', $restauranteId)
                ->where('fecha', Carbon::today()->toDateString())
                ->whereNotIn('estado', ['cancelada', 'no_show'])
                ->count(),
            'total_reservas_periodo' => $totalReservas,
            'confirmadas' => $confirmadas,
            'completadas' => $completadas,
            'canceladas' => $canceladas,
            'no_shows' => $noShows,
            'tasa_cancelacion' => $totalReservas > 0 ? round(($canceladas / $totalReservas) * 100, 1) : 0,
            'tasa_no_show' => $totalReservas > 0 ? round(($noShows / $totalReservas) * 100, 1) : 0,
            'ocupacion_hoy' => $ocupacionHoy,
            'mesas_totales' => $totalMesas,
            'mesas_ocupadas_hoy' => $mesasOcupadasHoy,
            'mesas_libres_hoy' => $totalMesas - $mesasOcupadasHoy,
            'personas_promedio' => round($personasPromedio ?? 0, 1),
            'horas_pico' => $horasPico,
            'reservas_por_dia' => $reservasPorDia,
            'reservas_por_semana' => $reservasPorSemana,
        ];
        });
    }

    private function buscarMejorMesa($restauranteId, $fecha, $hora, $personas, $duracion)
    {
        $mesas = Mesa::where('restaurante_id', $restauranteId)
            ->where('capacidad', '>=', $personas)
            ->whereNotIn('estado', ['inactiva', 'mantenimiento'])
            ->orderBy('capacidad', 'asc')
            ->get();

        foreach ($mesas as $mesa) {
            if (!$this->tieneConflicto($mesa->id, $fecha, $hora, $duracion)) {
                return $mesa;
            }
        }

        return null;
    }

    public function tieneConflicto($mesaId, $fecha, $hora, $duracion, $excludeId = null)
    {
        $horaInicio = strtotime($hora);
        $horaFin = $horaInicio + ($duracion * 60);

        $query = Reservas::where('mesa_id', $mesaId)
            ->where('fecha', $fecha)
            ->whereNotIn('estado', ['cancelada', 'no_show']);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        $reservas = $query->get(['id', 'hora', 'duracion']);

        foreach ($reservas as $existente) {
            $existenteInicio = strtotime($existente->hora);
            $existenteFin = $existenteInicio + (($existente->duracion ?? self::DURACION_DEFAULT) * 60);

            if ($horaInicio < $existenteFin && $horaFin > $existenteInicio) {
                return true;
            }
        }

        return false;
    }

    private function validarFechaReserva($fecha)
    {
        $fechaReserva = Carbon::parse($fecha);
        $hoy = Carbon::today();
        $maxFecha = Carbon::today()->addMonths(self::MESES_MAXIMO_ANTICIPACION);

        if ($fechaReserva->lt($hoy)) {
            return ['valido' => false, 'mensaje' => 'No se pueden hacer reservas en fechas pasadas'];
        }

        if ($fechaReserva->gt($maxFecha)) {
            return ['valido' => false, 'mensaje' => 'Solo se pueden hacer reservas con ' . self::MESES_MAXIMO_ANTICIPACION . ' meses de anticipación'];
        }

        return ['valido' => true];
    }

    private function validarHorarioRestaurante($restaurante, $fecha, $hora)
    {
        $dayOfWeek = Carbon::parse($fecha)->dayOfWeek; // 0=Sunday, 1=Monday ... 6=Saturday
        // Convert to 0=Monday, 6=Sunday
        $dayIndex = $dayOfWeek === 0 ? 6 : $dayOfWeek - 1;

        // Prefer new restaurant_hours table
        $hour = RestaurantHour::where('restaurante_id', $restaurante->id)
            ->where('day_of_week', $dayIndex)
            ->first();

        if ($hour) {
            if ($hour->is_closed) {
                return ['valido' => false, 'mensaje' => 'El restaurante está cerrado este día'];
            }
            if ($hour->open_time && $hour->close_time) {
                $apertura = is_string($hour->open_time) ? substr($hour->open_time, 0, 5) : $hour->open_time->format('H:i');
                $cierre = is_string($hour->close_time) ? substr($hour->close_time, 0, 5) : $hour->close_time->format('H:i');
                $horaStr = is_string($hora) ? substr($hora, 0, 5) : (is_object($hora) ? $hora->format('H:i') : substr((string)$hora, 0, 5));

                if ($horaStr < $apertura || $horaStr > $cierre) {
                    return ['valido' => false, 'mensaje' => "El restaurante está abierto de {$apertura} a {$cierre}"];
                }
            }
            return ['valido' => true];
        }

        return ['valido' => true];
    }

    private function validarLimiteReservas($clienteId, $fecha)
    {
        $reservasDia = Reservas::where('cliente_id', $clienteId)
            ->where('fecha', $fecha)
            ->whereNotIn('estado', ['cancelada', 'no_show'])
            ->count();

        if ($reservasDia >= self::LIMITE_RESERVAS_POR_DIA) {
            return ['valido' => false, 'mensaje' => 'Has alcanzado el límite de ' . self::LIMITE_RESERVAS_POR_DIA . ' reservas por día'];
        }

        return ['valido' => true];
    }
}
