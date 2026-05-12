<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DisponibilidadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'restaurante_id' => 'required|exists:restaurantes,id',
            'fecha'          => 'required|date|after_or_equal:today',
            'hora'           => 'required|date_format:H:i',
            'duracion'       => 'nullable|integer|min:15|max:300',
            'personas'       => 'required|integer|min:1|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'fecha.after_or_equal' => 'La fecha debe ser hoy o posterior',
            'personas.min' => 'Debe haber al menos 1 persona',
        ];
    }
}
