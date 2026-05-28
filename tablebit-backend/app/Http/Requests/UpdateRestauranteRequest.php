<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRestauranteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'sometimes|string|max:255',
            'direccion' => 'sometimes|string|max:255',
            'telefono' => 'nullable|string|regex:/^\+57\d{10}$/',
            'estado' => 'sometimes|in:activo,inactivo',
            'descripcion' => 'nullable|string|max:1000',
            'ciudad' => 'nullable|string|max:100',
            'tipo_comida' => 'nullable|string|max:100',
            'horario_apertura' => 'nullable|string|max:5',
            'horario_cierre' => 'nullable|string|max:5',
            'capacidad_total' => 'nullable|integer|min:1',
            'imagen' => 'nullable|string|max:500',
            'portada' => 'nullable|string|max:500',
            'branding.primary_color' => 'nullable|string|max:50',
            'branding.secondary_color' => 'nullable|string|max:50',
            'branding.accent_color' => 'nullable|string|max:50',
        ];
    }
}
