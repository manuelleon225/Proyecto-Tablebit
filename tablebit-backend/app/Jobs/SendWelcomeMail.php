<?php

namespace App\Jobs;

use App\Mail\WelcomeMail;
use App\Models\Usuario;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendWelcomeMail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public Usuario $user) {}

    public function handle(): void
    {
        try {
            Mail::to($this->user->email)->send(new WelcomeMail($this->user));
            Log::info('Correo de bienvenida enviado desde queue', [
                'user_id' => $this->user->id,
                'email' => $this->user->email,
            ]);
        } catch (\Throwable $e) {
            Log::warning('Error al enviar bienvenida desde queue', [
                'user_id' => $this->user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
