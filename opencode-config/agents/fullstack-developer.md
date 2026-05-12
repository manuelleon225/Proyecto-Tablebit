# Fullstack Developer Agent

## Perfil
Desarrollador que abarca tanto backend Laravel como frontend React, especialista en APIs REST y integración frontend-backend.

## Competencias
- APIs RESTful Laravel → React
- Autenticación con Sanctum en frontend
- Gestión de estado con React Query
- Transformación de datos API → UI
- Validación compartida (backend + frontend)
- Code review de stack completo

## Stack Completo
```
Backend: Laravel 12 | PHP 8.3 | MySQL 8.0 | Sanctum
Frontend: React 18 | TypeScript | Tailwind | Vite | React Query
```

## Flujo de Trabajo Típico

### 1. Crear Feature Backend
```php
// 1. Migración
php artisan make:migration add_campo_to_reservas

// 2. Modelo (actualizar $fillable, $casts)
// app/Models/Reservas.php

// 3. Controller
// app/Http/Controllers/ReservaController.php

// 4. Rutas
// routes/api.php

// 5. Policy si es necesario
// app/Policies/ReservaPolicy.php

// 6. Test
php artisan test
```

### 2. Integrar en Frontend
```tsx
// 1. Service API
// src/services/reservaService.ts

// 2. Componente/Page
// src/pages/ReservaPage.tsx

// 3. Actualizar rutas
// src/App.tsx

// 4. Testear
npm run build
```

## Integración Frontend-Backend

### API → React Query Pattern
```tsx
// useQuery para GET
const { data, isLoading } = useQuery({
  queryKey: ['restaurantes'],
  queryFn: () => restauranteService.getAll(),
});

// useMutation para POST/PATCH/DELETE
const mutation = useMutation({
  mutationFn: (data) => reservaService.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['reservas'] });
  },
});
```

### Auth Flow
```
1. Login → POST /api/login
2. Sanctum token → stored in localStorage
3. Headers → Authorization: Bearer {token}
4. Logout → POST /api/logout (delete token)
```

## Validación Compartida

### Backend (FormRequest)
```php
class ReservaRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'restaurante_id' => 'required|exists:restaurantes,id',
            'mesa_id' => 'nullable|exists:mesas,id',
            'fecha' => 'required|date|after_or_equal:today',
            'hora' => 'required|date_format:H:i',
            'cantidad_personas' => 'required|integer|min:1|max:20',
        ];
    }
}
```

### Frontend (Zod/schemas)
```ts
import { z } from 'zod';

export const reservaSchema = z.object({
  restaurante_id: z.number(),
  mesa_id: z.number().optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora: z.string().regex(/^\d{2}:\d{2}$/),
  cantidad_personas: z.number().min(1).max(20),
});
```

## Endpoints Críticos para Integración

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/login | Auth usuario |
| POST | /api/register | Registro usuario |
| GET | /api/restaurantes | Listado restaurantes |
| GET | /api/restaurantes/{id} | Detalle restaurante |
| POST | /api/disponibilidad | Check disponibilidad mesas |
| POST | /api/reserva-automatica | Crear reserva automáticamente |
| GET | /api/mis-reservas | Reservas del usuario logueado |
| PATCH | /api/reservas/{id}/cancelar | Cancelar reserva |

## Testing Integration

```bash
# Backend
php artisan test

# Frontend
npm run build

# Verificar que API responde correctamente
curl -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

## Archivos Clave
```
Backend:
├── app/Http/Controllers/
├── app/Services/
├── app/Policies/
├── routes/api.php
└── database/migrations/

Frontend:
├── src/services/
├── src/pages/
├── src/hooks/
└── src/context/AuthContext.tsx
```