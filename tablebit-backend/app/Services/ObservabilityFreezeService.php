<?php

namespace App\Services;

class ObservabilityFreezeService
{
    private static bool $frozen = false;

    public function freeze(): void
    {
        self::$frozen = true;
    }

    public function unfreeze(): void
    {
        self::$frozen = false;
    }

    public function isFrozen(): bool
    {
        return self::$frozen;
    }

    public function assertNotFrozen(): void
    {
        if (self::$frozen) {
            throw new \RuntimeException('Observability system is frozen. No writes allowed.');
        }
    }

    public function getFreezeState(): array
    {
        return [
            'frozen' => self::$frozen,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
