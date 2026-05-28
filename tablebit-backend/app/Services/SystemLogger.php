<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class SystemLogger
{
    public function info(string $message, array $context = []): void
    {
        Log::info("[TableBit] {$message}", $context);
    }

    public function warning(string $message, array $context = []): void
    {
        Log::warning("[TableBit] {$message}", $context);
    }

    public function error(string $message, array $context = []): void
    {
        Log::error("[TableBit] {$message}", $context);
    }

    public function critical(string $message, array $context = []): void
    {
        Log::critical("[TableBit] {$message}", $context);
    }

    public function authFailure(string $email, string $reason, ?string $ip = null): void
    {
        $this->warning("Auth failure: {$email} - {$reason}", [
            'email' => $email,
            'ip' => $ip ?? request()->ip(),
        ]);
    }

    public function imageUploadFailure(int $restauranteId, string $reason): void
    {
        $this->error("Image upload failed for restaurant {$restauranteId}: {$reason}", [
            'restaurante_id' => $restauranteId,
        ]);
    }

    public function slowQuery(float $duration, string $sql): void
    {
        if ($duration > 300) {
            $this->warning("Slow query ({$duration}ms): {$sql}");
        }
    }
}
