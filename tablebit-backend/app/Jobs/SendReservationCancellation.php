<?php

namespace App\Jobs;

use App\Mail\ReservationCancelledMail;
use App\Models\Reservas;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendReservationCancellation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public Reservas $reserva) {}

    public function handle(): void
    {
        try {
            Mail::to($this->reserva->cliente->email)->send(new ReservationCancelledMail($this->reserva));
            Log::info('Correo de cancelación enviado', [
                'reserva_id' => $this->reserva->id,
                'email' => $this->reserva->cliente->email,
            ]);
        } catch (\Throwable $e) {
            Log::warning('Error al enviar cancelación', [
                'reserva_id' => $this->reserva->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
