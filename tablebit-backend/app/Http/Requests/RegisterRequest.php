<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|min:2|max:255',
            'email' => 'required|email|max:255|unique:usuarios',
            'password' => ['required', 'string', 'min:8', 'max:128', 'regex:/^(?=.*[A-Z])(?=.*[a-z])(?=.*[^a-zA-Z0-9]).+$/'],
            'role' => 'nullable|in:cliente,admin_restaurante',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es requerido',
            'name.min' => 'El nombre debe tener al menos 2 caracteres',
            'email.required' => 'El email es requerido',
            'email.email' => 'El email debe ser válido',
            'email.unique' => 'El correo electrónico ya se encuentra vinculado a una cuenta',
            'password.required' => 'La contraseña es requerida',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres',
            'password.max' => 'La contraseña no puede exceder 128 caracteres',
            'password.regex' => 'La contraseña debe contener al menos una mayúscula, una minúscula y un carácter especial',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => strtolower(trim($this->email)),
            'name' => trim($this->name),
        ]);
    }
}
