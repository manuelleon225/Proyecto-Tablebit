<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;

class ImageCacheService
{
    public function getCacheHeaders(string $path, int $maxAge = 31536000): array
    {
        $fullPath = Storage::disk('public')->path($path);
        $mime = 'image/webp';
        $lastModified = file_exists($fullPath) ? filemtime($fullPath) : time();
        $size = file_exists($fullPath) ? filesize($fullPath) : 0;

        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        $mimeTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml',
            'gif' => 'image/gif',
        ];
        $mime = $mimeTypes[$ext] ?? $mime;

        return [
            'Content-Type' => $mime,
            'Cache-Control' => "public, max-age={$maxAge}, immutable",
            'Pragma' => 'cache',
            'Expires' => gmdate('D, d M Y H:i:s \G\M\T', time() + $maxAge),
            'Last-Modified' => gmdate('D, d M Y H:i:s \G\M\T', $lastModified),
            'Content-Length' => (string)$size,
        ];
    }

    public function serveImage(string $path)
    {
        $disk = Storage::disk('public');
        if (!$disk->exists($path)) {
            return response()->json(['error' => 'Not found'], 404);
        }

        $fullPath = $disk->path($path);
        $headers = $this->getCacheHeaders($path);

        return response()->file($fullPath, $headers);
    }
}
