<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRestauranteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|exists:usuarios,id',
            'nombre' => 'required|string|max:255',
            'direccion' => 'required|string|max:255',
            'telefono' => 'nullable|string|max:50',
            'descripcion' => 'nullable|string|max:1000',
            'ciudad' => 'nullable|string|max:100',
            'tipo_comida' => 'nullable|string|max:100',
            'horario_apertura' => 'nullable|string|max:5',
            'horario_cierre' => 'nullable|string|max:5',
            'capacidad_total' => 'nullable|integer|min:1',
            'imagen' => 'nullable|string|max:500',
            'portada' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del restaurante es requerido',
            'direccion.required' => 'La dirección es requerida',
        ];
    }
}
