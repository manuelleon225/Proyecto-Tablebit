<?php

namespace App\Mail;

use App\Models\Usuario;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public Usuario $user;

    public function __construct(Usuario $user)
    {
        $this->user = $user;
    }

    public function build(): self
    {
        return $this->subject('¡Bienvenido a TableBit!')
                    ->view('emails.welcome');
    }
}
