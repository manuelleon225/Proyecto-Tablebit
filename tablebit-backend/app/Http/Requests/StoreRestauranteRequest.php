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
            'nombre' => 'required|string|min:2|max:255',
            'direccion' => 'required|string|min:5|max:255',
            'telefono' => 'nullable|regex:/^[0-9+\-\s()]{7,15}$/',
            'descripcion' => 'nullable|string|max:1000',
            'ciudad' => 'required|string|max:100',
            'tipo_comida' => 'required|string|max:100',
            'capacidad_total' => 'required|integer|min:1|max:9999',
            'imagen' => 'nullable|string|max:500',
            'portada' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del restaurante es requerido',
            'nombre.min' => 'El nombre debe tener al menos 2 caracteres',
            'direccion.required' => 'La dirección es requerida',
            'direccion.min' => 'La dirección debe tener al menos 5 caracteres',
            'telefono.regex' => 'El teléfono debe contener solo números, +, -, espacios o paréntesis',
            'ciudad.required' => 'La ciudad es requerida',
            'tipo_comida.required' => 'El tipo de comida es requerido',
            'capacidad_total.required' => 'La capacidad total es requerida',
            'capacidad_total.integer' => 'La capacidad debe ser un número entero',
            'capacidad_total.min' => 'La capacidad mínima es 1 persona',
        ];
    }
}
