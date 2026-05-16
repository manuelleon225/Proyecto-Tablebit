<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Restaurante;
use App\Models\Imagen;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImagenController extends Controller
{
    public function index($restauranteId): JsonResponse
    {
        $restaurante = Restaurante::findOrFail($restauranteId);
        $this->authorize('manageReservas', $restaurante);
        $imagenes = Imagen::where('restaurante_id', $restauranteId)->orderBy('created_at', 'desc')->get();
        return response()->json($imagenes);
    }

    public function subirImagen(Request $request, $restauranteId): JsonResponse
    {
        $restaurante = Restaurante::findOrFail($restauranteId);
        $this->authorize('update', $restaurante);

        $request->validate([
            'imagen' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
            'tipo' => 'nullable|in:logo,galeria,portada',
        ]);

        $file = $request->file('imagen');
        $tipo = $request->input('tipo', 'galeria');
        $extension = $file->getClientOriginalExtension();
        $nombreArchivo = Str::uuid() . '.' . $extension;

        $directorio = 'restaurantes/' . $restauranteId . '/' . $tipo;

        $ruta = $file->storeAs($directorio, $nombreArchivo, 'public');

        if ($tipo === 'portada') {
            if ($restaurante->imagen) {
                Storage::disk('public')->delete($restaurante->imagen);
            }
            $restaurante->imagen = $ruta;
            $restaurante->save();
        }

        $imagen = Imagen::create([
            'restaurante_id' => $restauranteId,
            'ruta' => $ruta,
            'tipo' => $tipo,
            'nombre_original' => $file->getClientOriginalName(),
            'tamanio_kb' => round($file->getSize() / 1024, 2),
        ]);

        return response()->json([
            'message' => 'Imagen subida correctamente',
            'imagen' => [
                'id' => $imagen->id,
                'url' => Storage::url($ruta),
                'tipo' => $imagen->tipo,
            ]
        ], 201);
    }

    public function eliminarImagen($imagenId): JsonResponse
    {
        $imagen = Imagen::findOrFail($imagenId);

        Storage::disk('public')->delete($imagen->ruta);
        $imagen->delete();

        return response()->json([
            'message' => 'Imagen eliminada'
        ]);
    }
}
