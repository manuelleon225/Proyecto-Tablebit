<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ImageMetadataService
{
    public function extractMetadata(string $path): array
    {
        $fullPath = Storage::disk('public')->path($path);
        if (!file_exists($fullPath)) return [];

        $info = @getimagesize($fullPath);
        if (!$info) return [];

        return [
            'width' => $info[0],
            'height' => $info[1],
            'mime' => $info['mime'],
            'size' => filesize($fullPath),
            'aspect' => $info[0] > 0 ? round($info[0] / $info[1], 4) : null,
        ];
    }

    public function getDominantColor(string $path): ?string
    {
        $fullPath = Storage::disk('public')->path($path);
        if (!file_exists($fullPath)) return null;

        $size = filesize($fullPath);
        // Skip if file is too large for GD memory
        if ($size > 5 * 1024 * 1024) return null;

        $info = @getimagesize($fullPath);
        if (!$info) return null;

        if ($info[2] === IMAGETYPE_JPEG || $info[2] === IMAGETYPE_PNG || $info[2] === IMAGETYPE_WEBP) {
            try {
                $img = @imagecreatefromstring(file_get_contents($fullPath));
                if (!$img) return null;

                $thumb = imagescale($img, 1, 1, IMG_BILINEAR_FIXED);
                imagedestroy($img);

                if (!$thumb) return null;

                $rgb = imagecolorat($thumb, 0, 0);
                imagedestroy($thumb);

                $r = ($rgb >> 16) & 0xFF;
                $g = ($rgb >> 8) & 0xFF;
                $b = $rgb & 0xFF;

                return sprintf("#%02x%02x%02x", $r, $g, $b);
            } catch (\Throwable $e) {
                return null;
            }
        }

        return null;
    }
}
