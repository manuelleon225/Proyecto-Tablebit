<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Restaurante;
use App\Models\Imagen;
use App\Services\MediaService;
use App\Services\ImageMetadataService;
use App\Services\AuditLogService;
use App\Services\SystemLogger;
use Illuminate\Support\Facades\Storage;

class ImagenController extends Controller
{
    public function __construct(
        private readonly MediaService $mediaService,
        private readonly ImageMetadataService $metadataService,
        private readonly AuditLogService $auditLog,
        private readonly SystemLogger $logger,
    ) {}

    public function index($restauranteId): JsonResponse
    {
        $restaurante = Restaurante::with('imagenes')->findOrFail($restauranteId);
        $this->authorize('manageReservas', $restaurante);
        return response()->json($restaurante->imagenes()->orderBy('orden')->orderBy('created_at', 'desc')->get());
    }

    public function subirImagen(Request $request, $restauranteId): JsonResponse
    {
        $restaurante = Restaurante::findOrFail($restauranteId);
        $this->authorize('update', $restaurante);

        $validated = $request->validate([
            'imagen' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
            'tipo' => 'nullable|in:logo,banner,galeria,portada',
        ]);

        try {
            $file = $request->file('imagen');
            $tipo = $request->input('tipo', 'galeria');

            $fieldMap = ['logo' => 'logo', 'banner' => 'banner', 'portada' => 'imagen'];
            $fieldToUpdate = $fieldMap[$tipo] ?? null;

            $result = $this->mediaService->uploadRestaurantImage($restaurante, $file, $tipo, $fieldToUpdate);

            $imagen = Imagen::create([
                'restaurante_id' => $restauranteId,
                'ruta' => $result['path'],
                'tipo' => $tipo,
                'nombre_original' => $file->getClientOriginalName(),
                'tamanio_kb' => round($file->getSize() / 1024, 2),
            ]);

            $metadata = [];
            try {
                $metadata = $this->metadataService->extractMetadata($result['path']);
                if (!empty($metadata)) {
                    $dominant = $this->metadataService->getDominantColor($result['path']);
                    if ($dominant) $metadata['dominant_color'] = $dominant;
                }
            } catch (\Throwable $e) {
                $this->logger->imageUploadFailure($restauranteId, 'Metadata extraction failed: ' . $e->getMessage());
            }
            if (!empty($metadata)) {
                $imagen->metadata = $metadata;
                $imagen->save();
            }

            $this->auditLog->logFromRequest($request, 'image_upload', 'restaurante', $restauranteId, [
                'imagen_id' => $imagen->id,
                'tipo' => $tipo,
                'size_kb' => $imagen->tamanio_kb,
            ]);

            return response()->json([
                'message' => 'Imagen subida correctamente',
                'imagen' => ['id' => $imagen->id, 'url' => $result['url'], 'tipo' => $imagen->tipo],
                'restaurante' => $restaurante->fresh()->load(['horarios']),
            ], 201);
        } catch (\Throwable $e) {
            $this->logger->imageUploadFailure($restauranteId, $e->getMessage());
            return response()->json(['message' => 'Error al subir la imagen'], 500);
        }
    }

    public function eliminarImagen(Request $request, $imagenId): JsonResponse
    {
        $imagen = Imagen::with('restaurante')->findOrFail($imagenId);
        $this->authorize('update', $imagen->restaurante);

        try {
            $this->mediaService->deleteImage($imagen->ruta);
            $imagen->delete();

            $this->auditLog->logFromRequest($request, 'image_delete', 'imagen', $imagenId, [
                'restaurante_id' => $imagen->restaurante_id,
            ]);

            return response()->json(['message' => 'Imagen eliminada']);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Error al eliminar la imagen'], 500);
        }
    }

    public function reordenar(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ordenes' => 'required|array|max:100',
            'ordenes.*.id' => 'required|integer|exists:imagenes,id',
            'ordenes.*.orden' => 'required|integer|min:0',
        ]);

        foreach ($validated['ordenes'] as $item) {
            $imagen = Imagen::with('restaurante')->findOrFail($item['id']);
            $this->authorize('update', $imagen->restaurante);
            $imagen->update(['orden' => $item['orden']]);
        }

        $this->auditLog->logFromRequest($request, 'image_reorder', 'imagen', null, [
            'count' => count($validated['ordenes']),
        ]);

        return response()->json(['message' => 'Orden actualizado']);
    }
}
