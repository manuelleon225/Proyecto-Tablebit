# TableBit — Arquitectura Técnica

## Visión General

TableBit es un SaaS de dos capas: API REST Laravel + SPA React. La comunicación es vía JSON sobre HTTP con autenticación basada en tokens Sanctum.

```
[React SPA] ──HTTP/JSON──> [Laravel API] ──Eloquent──> [MySQL]
                                 ──Mail──> [Log/Mailer]
                                 ──Queue──> [Database Queue]
```

## Backend (Laravel)

### Capas

| Capa | Responsabilidad | Ubicación |
|------|----------------|-----------|
| **Routes** | Definición de endpoints y middleware | `routes/api.php` |
| **Controllers** | Manejo de requests/responses | `app/Http/Controllers/` |
| **FormRequests** | Validación de entrada | `app/Http/Requests/` |
| **Services** | Lógica de negocio | `app/Services/` |
| **Models** | Eloquent ORM, relaciones, scopes | `app/Models/` |
| **Policies** | Autorización por roles | `app/Policies/` |
| **Middleware** | Rate limiting, roles, seguridad | `app/Http/Middleware/` |

### Flujo de Request

```
Request → Middleware (auth:sanctum, throttle, role)
       → Controller → FormRequest (validación)
       → Service (lógica negocio)
       → Policy (autorización)
       → Model (DB)
       → JSON Response
```

### Modelos Principales

```
Usuario (1) ──── hasOne ────> Restaurante
Usuario (1) ──── hasMany ───> Reservas (como cliente)
Restaurante (1) ── hasMany ──> Mesas
Restaurante (1) ── hasMany ──> Reservas
Restaurante (1) ── hasMany ──> HorarioDia
Mesa (1) ──────── hasMany ──> Reservas
Usuario (1) ────── hasMany ──> Resenas
Usuario (1) ────── hasMany ──> Favoritos
```

### Roles y Permisos

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| `cliente` | Usuario regular | Reservar, reseñas, favoritos |
| `admin` | Administrador global | Gestión total de todos los restaurantes |
| `admin_restaurante` | Gestor de un restaurante | Solo su restaurante asignado |
| `superadmin` | Superadministrador | Acceso total sin restricciones |

### Estados de Reserva

```
pendiente → confirmada → completada
               ↓             ↓
           cancelada      cancelada
               ↓
           no_show
```

### Rate Limiting

| Límite | Requests | Ventana |
|--------|----------|---------|
| Auth (login/register) | 10 | 1 minuto |
| Disponibilidad | 30 | 1 minuto |
| Reservas | 20 | 1 minuto |
| Sensible (profile) | 5 | 1 minuto |
| Global | 120 | 1 minuto |

## Frontend (React)

### Capas

| Capa | Tecnología | Ubicación |
|------|-----------|-----------|
| Routing | React Router 6 | `App.tsx` |
| State (server) | React Query (TanStack) | Hooks/services |
| State (auth) | Context API | `context/AuthContext.tsx` |
| Forms | React Hook Form + Zod | Pages |
| UI | shadcn/ui + Tailwind CSS | `components/ui/` |
| API calls | Axios + interceptors | `services/api.ts` |

### Flujo de Datos

```
Page → useQuery/useMutation → Service (Axios) → API → Response
                    ↓
            React Query cache
                    ↓
              UI render
```

### Code Splitting

Todas las páginas usan `React.lazy()` + `Suspense` para carga bajo demanda:

```tsx
const Home = lazy(() => import("./pages/Home"));
```

### Convenciones

- Componentes de página en `src/pages/`
- Componentes compartidos en `src/components/`
- Layouts en `src/layouts/`
- Servicios API en `src/services/`
- Hooks personalizados en `src/hooks/`
- Utilidades en `src/lib/`
- Constantes en `src/constants/`

## Seguridad

- Autenticación: Sanctum tokens (expiración 7 días)
- Autorización: Policies + RoleMiddleware
- Validación: FormRequests (backend) + Zod (frontend)
- Rate Limiting: Named limiters (global, reservas, sensitive)
- Headers: SecurityHeadersMiddleware (CSP, HSTS, X-Frame-Options)
- Logging: JSON estructurado con request_id
- CORS: Restringido a orígenes específicos

## Observabilidad

- Health checks: `/api/health`, `/api/health/db`, `/api/health/cache`
- Laravel Pulse: Dashboard de monitoreo (admin)
- Logging: JSON con request_id, slow request tracking
- Errores React: ErrorBoundary con logging estructurado
