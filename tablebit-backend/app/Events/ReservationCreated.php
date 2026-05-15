<?php

namespace App\Events;

use App\Models\Reservas;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReservationCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Reservas $reserva) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('restaurant.' . $this->reserva->restaurante_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'reservation.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->reserva->id,
            'cliente' => $this->reserva->cliente?->name,
            'fecha' => $this->reserva->fecha,
            'hora' => $this->reserva->hora,
            'personas' => $this->reserva->cantidad_personas,
            'mesa' => $this->reserva->mesa?->numero,
            'estado' => $this->reserva->estado,
        ];
    }
}
