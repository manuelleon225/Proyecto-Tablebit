<?php

namespace App\Support;

class PhoneNormalizer
{
    private const CO_CODE = '57';
    private const CO_LENGTH = 10;

    /**
     * Normalize a Colombian phone number to E.164 format (+57XXXXXXXXXX).
     * Accepts: 3147982365, 573147982365, +573147982365
     */
    public static function normalize(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);

        // Already in E.164 with +
        if (strlen($digits) === 12 && str_starts_with($digits, self::CO_CODE)) {
            return '+' . $digits;
        }

        // 10 digits → Colombian mobile, add +57
        if (strlen($digits) === self::CO_LENGTH) {
            return '+' . self::CO_CODE . $digits;
        }

        return $phone;
    }

    /**
     * Validate a Colombian mobile phone number.
     */
    public static function isValid(string $phone): bool
    {
        $digits = preg_replace('/\D/', '', $phone);

        // Direct 10-digit mobile
        if (strlen($digits) === self::CO_LENGTH) {
            return preg_match('/^3\d{9}$/', $digits) === 1;
        }

        // With country code: 57XXXXXXXXXX
        if (strlen($digits) === 12 && str_starts_with($digits, self::CO_CODE)) {
            return preg_match('/^3\d{9}$/', substr($digits, 2)) === 1;
        }

        return false;
    }
}
