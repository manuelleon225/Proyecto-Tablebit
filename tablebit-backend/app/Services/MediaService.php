<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Models\Restaurante;

class MediaService
{
    public function __construct(
        private readonly ImagePathService $pathService,
        private readonly ImageVariantService $variantService,
    ) {}

    public function uploadRestaurantImage(
        Restaurante $restaurante,
        UploadedFile $file,
        string $imageType,
        ?string $fieldToUpdate = null
    ): array {
        $extension = $file->getClientOriginalExtension();
        $path = $this->pathService->generatePath($restaurante->id, 'restaurantes', $imageType, $extension);
        $disk = Storage::disk('public');

        // Store original
        $fullPath = $file->storeAs(dirname($path), basename($path), 'public');

        // Delete old field image + variants if replacing
        if ($fieldToUpdate && $restaurante->$fieldToUpdate) {
            $this->variantService->deleteVariants($restaurante->$fieldToUpdate);
            $disk->delete($restaurante->$fieldToUpdate);
        }

        // Generate variants
        $extension = $file->getClientOriginalExtension();
        $variants = $this->variantService->generateVariants($imageType, $fullPath, $extension);

        // Update model
        if ($fieldToUpdate) {
            $restaurante->$fieldToUpdate = $fullPath;
            $restaurante->save();
        }

        return [
            'path' => $fullPath,
            'url' => Storage::url($fullPath),
            'tipo' => $imageType,
            'variants' => $variants,
        ];
    }

    public function deleteImage(?string $path): void
    {
        if ($path) {
            $this->variantService->deleteVariants($path);
            Storage::disk('public')->delete($path);
        }
    }
}
