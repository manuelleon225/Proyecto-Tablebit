<?php

namespace App\Mail;

use App\Models\Reservas;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ReservationCancelledMail extends Mailable
{
    use Queueable, SerializesModels;

    public Reservas $reserva;

    public function __construct(Reservas $reserva)
    {
        $this->reserva = $reserva;
    }

    public function build(): self
    {
        return $this->subject('Reserva cancelada - ' . ($this->reserva->restaurante->nombre ?? 'TableBit'))
                    ->view('emails.reservation-cancelled');
    }
}
