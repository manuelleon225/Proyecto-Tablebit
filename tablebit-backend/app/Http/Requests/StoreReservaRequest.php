<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReservaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'restaurante_id'    => 'required|exists:restaurantes,id',
            'mesa_id'           => 'nullable|exists:mesas,id',
            'fecha'             => 'required|date|after_or_equal:today',
            'hora'              => 'required|date_format:H:i',
            'duracion'          => 'nullable|integer|min:15|max:300',
            'cantidad_personas' => 'required|integer|min:1|max:50',
            'tipo_evento'       => 'nullable|string|max:100',
            'notas'             => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'fecha.after_or_equal' => 'La fecha debe ser hoy o posterior',
            'cantidad_personas.min' => 'Debe haber al menos 1 persona',
            'cantidad_personas.max' => 'No se permiten más de 50 personas',
            'duracion.min' => 'La duración mínima es 15 minutos',
            'duracion.max' => 'La duración máxima es 5 horas',
        ];
    }
}
