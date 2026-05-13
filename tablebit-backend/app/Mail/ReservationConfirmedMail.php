<?php

namespace App\Mail;

use App\Models\Reservas;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ReservationConfirmedMail extends Mailable
{
    use Queueable, SerializesModels;

    public Reservas $reserva;

    public function __construct(Reservas $reserva)
    {
        $this->reserva = $reserva;
    }

    public function build(): self
    {
        return $this->subject('¡Reserva confirmada en ' . ($this->reserva->restaurante->nombre ?? 'TableBit') . '!')
                    ->view('emails.reservation-confirmed');
    }
}
