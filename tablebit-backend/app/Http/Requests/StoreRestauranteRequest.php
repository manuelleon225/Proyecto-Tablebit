<?php

namespace App\Http\Requests;

use App\Support\PhoneNormalizer;
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
            'telefono' => 'required|string',
            'descripcion' => 'required|string|min:10|max:1000',
            'ciudad' => 'required|string|max:100',
            'tipo_comida' => 'required|string|max:100',
            'capacidad_total' => 'required|integer|min:1|max:9999',
            'imagen' => 'nullable|string|max:500',
            'portada' => 'nullable|string|max:500',
            'branding.primary_color' => 'nullable|string|max:50',
            'branding.secondary_color' => 'nullable|string|max:50',
            'branding.accent_color' => 'nullable|string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del restaurante es requerido',
            'nombre.min' => 'El nombre debe tener al menos 2 caracteres',
            'direccion.required' => 'La dirección es requerida',
            'direccion.min' => 'La dirección debe tener al menos 5 caracteres',
            'telefono.required' => 'El teléfono es requerido',
            'descripcion.required' => 'La descripción es requerida',
            'descripcion.min' => 'La descripción debe tener al menos 10 caracteres',
            'ciudad.required' => 'La ciudad es requerida',
            'tipo_comida.required' => 'El tipo de comida es requerido',
            'capacidad_total.required' => 'La capacidad total es requerida',
            'capacidad_total.integer' => 'La capacidad debe ser un número entero',
            'capacidad_total.min' => 'La capacidad mínima es 1 persona',
        ];
    }

    protected function prepareForValidation(): void
    {
        $phone = $this->input('telefono');
        if ($phone) {
            $normalized = PhoneNormalizer::normalize($phone);
            $this->merge([
                'telefono' => $normalized,
                '_phone_valid' => PhoneNormalizer::isValid($phone),
            ]);
        }
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (!$this->input('_phone_valid')) {
                $validator->errors()->add('telefono', 'Ingresa un número celular colombiano válido (10 dígitos, ej: 3147982365)');
            }
        });
    }
}
