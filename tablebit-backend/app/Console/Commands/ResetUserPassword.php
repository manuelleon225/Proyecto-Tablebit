<?php

namespace App\Console\Commands;

use App\Models\Usuario;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class ResetUserPassword extends Command
{
    protected $signature = 'user:reset-password {email} {password?}';
    protected $description = 'Cambia la contraseña de un usuario';

    public function handle(): int
    {
        $email = $this->argument('email');
        $user = Usuario::where('email', $email)->first();

        if (!$user) {
            $this->error("Usuario con email '{$email}' no encontrado.");
            return Command::FAILURE;
        }

        $password = $this->argument('password');
        if (!$password) {
            $password = $this->secret('Nueva contraseña (dejar vacío para generar automática):');
            if (!$password) {
                $password = 'Temp' . random_int(1000, 9999) . '!';
                $this->info("Contraseña generada: {$password}");
            }
        }

        $user->password = Hash::make($password);
        $user->save();

        $this->info("✅ Contraseña actualizada para: {$user->name} ({$user->email})");
        $this->warn("Nueva contraseña: {$password}");

        return Command::SUCCESS;
    }
}
