<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageVariantService
{
    private ImageManager $manager;

    public function __construct()
    {
        $this->manager = new ImageManager(new Driver());
    }

    private const VARIANTS = [
        'avatar' => [
            ['suffix' => '64', 'w' => 64, 'h' => 64, 'q' => 85],
            ['suffix' => '128', 'w' => 128, 'h' => 128, 'q' => 85],
        ],
        'logo' => [
            ['suffix' => '128', 'w' => 128, 'h' => 128, 'q' => 90],
            ['suffix' => '256', 'w' => 256, 'h' => 256, 'q' => 90],
        ],
        'portada' => [
            ['suffix' => '320', 'w' => 320, 'h' => null, 'q' => 80],
            ['suffix' => '640', 'w' => 640, 'h' => null, 'q' => 80],
            ['suffix' => '1280', 'w' => 1280, 'h' => null, 'q' => 80],
        ],
        'galeria' => [
            ['suffix' => 'thumb', 'w' => 150, 'h' => 150, 'q' => 75],
            ['suffix' => '640', 'w' => 640, 'h' => null, 'q' => 80],
            ['suffix' => '1280', 'w' => 1280, 'h' => null, 'q' => 80],
        ],
    ];

    public function generateVariants(string $imageType, string $originalPath, string $extension): array
    {
        $variants = [];
        $config = self::VARIANTS[$imageType] ?? [];

        $disk = Storage::disk('public');
        $fullPath = storage_path('app/public/' . $originalPath);
        $baseDir = pathinfo($originalPath, PATHINFO_DIRNAME);
        $baseName = pathinfo($originalPath, PATHINFO_FILENAME);

        if (!file_exists($fullPath)) {
            return [];
        }

        foreach ($config as $variant) {
            try {
                $suffix = $variant['suffix'];
                $subdir = $baseDir . '/' . $suffix;
                $disk->makeDirectory($subdir);

                $img = $this->manager->read($fullPath);

                if ($variant['w'] && $variant['h']) {
                    $img->cover($variant['w'], $variant['h']);
                } elseif ($variant['w']) {
                    $img->scaleDown(width: $variant['w']);
                }

                $variantPath = $subdir . '/' . $baseName . '.webp';
                $variantFull = storage_path('app/public/' . $variantPath);
                $disk->makeDirectory(dirname($variantPath));

                $encoded = $img->encodeByMediaType('image/webp', quality: $variant['q']);
                file_put_contents($variantFull, $encoded);

                $variants[$suffix] = $variantPath;
            } catch (\Exception $e) {
                continue;
            }
        }

        return $variants;
    }

    public function deleteVariants(string $originalPath): void
    {
        $disk = Storage::disk('public');
        $baseDir = pathinfo($originalPath, PATHINFO_DIRNAME);
        $baseName = pathinfo($originalPath, PATHINFO_FILENAME);

        foreach (self::VARIANTS as $imageType => $config) {
            foreach ($config as $variant) {
                $suffix = $variant['suffix'];
                $variantPath = $baseDir . '/' . $suffix . '/' . $baseName . '.webp';
                if ($disk->exists($variantPath)) {
                    $disk->delete($variantPath);
                }
            }
        }
    }

    public static function getVariantWidths(string $imageType): array
    {
        $config = self::VARIANTS[$imageType] ?? [];
        return array_map(fn($v) => $v['w'], $config);
    }
}
