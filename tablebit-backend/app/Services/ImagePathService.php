<?php

namespace App\Services;

use Illuminate\Support\Str;

class ImagePathService
{
    public function generatePath(int $entityId, string $entityType, string $imageType, string $extension): string
    {
        $filename = Str::uuid() . '.' . $extension;
        return "{$entityType}/{$entityId}/{$imageType}/{$filename}";
    }

    public function getDirectory(int $entityId, string $entityType, string $imageType): string
    {
        return "{$entityType}/{$entityId}/{$imageType}";
    }

    public function sanitizeFilename(string $name): string
    {
        return preg_replace('/[^a-zA-Z0-9._-]/', '_', $name);
    }
}
