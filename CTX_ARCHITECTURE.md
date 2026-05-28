# TableBit — Resumen de Contexto Técnico para LLM

> Generado: 2026-05-22 | Proyecto: tableBit | Fase: Business Core Recovery (Completada)

---

## 1. FICHA TÉCNICA Y OBJETIVO

**Nombre:** TableBit  
**Tipo:** Plataforma web SPA de reserva de mesas en restaurantes (multi-tenant)  
**Propósito:** Permitir a clientes descubrir restaurantes, reservar mesas, dejar reseñas; y a administradores gestionar restaurantes, mesas, horarios, branding, imágenes y analíticas en tiempo real.

### Stack tecnológico completo

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Backend framework** | Laravel | 12.x |
| **PHP** | PHP | ^8.2 |
| **Base de datos** | MySQL | 8.0 (vía migraciones Eloquent) |
| **Auth API** | Laravel Sanctum | ^4.3 (tokens Bearer, expiración 7 días) |
| **Imágenes** | Intervention Image | latest (vía `intervention/image-laravel`) |
| **Tiempo real** | Laravel Reverb + SSE | ^1.10 |
| **Monitoreo** | Laravel Pulse | latest |
| **Colas** | Laravel Queue (database driver) | — |
| **Email** | Mailtrap (dev), Symfony Mailer | — |
| **Frontend framework** | React | 18.3.1 |
| **Lenguaje** | TypeScript | ^5.8.3 |
| **Bundler** | Vite | ^5.4.19 |
| **Routing** | React Router DOM | ^6.30.3 |
| **Server state** | TanStack React Query | ^5.83.0 |
| **Forms** | React Hook Form + Zod | ^7.61.1 / ^3.25.76 |
| **Estilos** | Tailwind CSS | ^3.4.19 |
| **UI primitives** | shadcn/ui (Radix primitives) | — |
| **Animaciones** | Framer Motion | ^12.38.0 |
| **Gráficos** | Recharts | ^3.8.1 |
| **Mapas** | Leaflet + React Leaflet | ^1.9.4 / ^4.2.1 |
| **Drag & drop** | dnd-kit | ^6.3.1 |
| **Crop de imágenes** | react-easy-crop | ^5.5.7 |
| **PWA** | vite-plugin-pwa | ^1.3.0 (service worker + manifest) |
| **E2E testing** | Playwright | ^1.57.0 |
| **Unit testing** | Vitest + Testing Library | ^3.2.4 |
| **Estado global** | Zustand | ^5.0.13 |
| **HTTP client** | Axios | ^1.14.0 |
| **CI/CD** | GitHub Actions | 2 workflows |
| **Contenedores** | Docker + docker-compose | Nginx + PHP-FPM |

---

## 2. ARQUITECTURA Y RUTAS CLAVE

### Estructura de carpetas

```
tableBit/
├── opencode.json                          # Configuración del agente OpenCode
├── opencode-config/                       # Reglas y perfiles de agente
│   ├── CLAUDE.md                          # Resumen ejecutivo del proyecto
│   ├── agents/                            # 7 perfiles de agente (backend, frontend, fullstack, security, devops, qa, ui)
│   └── rules/                             # Reglas Laravel + React
├── docker-compose.yml                     # Nginx + PHP-FPM + MySQL
├── .nginx/                                # Configuración Nginx
├── .github/workflows/
│   ├── backend-ci.yml                     # MySQL service + PHP 8.3 + migraciones + tests
│   └── frontend-ci.yml                    # Node 20 + type check + build
│
├── tablebit-backend/                      # Laravel 12 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/               # 17 controladores
│   │   │   └── Requests/                  # FormRequest (Login, Register, etc.)
│   │   ├── Models/                        # 13 modelos Eloquent
│   │   ├── Policies/                      # 3 policies (Restaurante, Mesa, Reserva)
│   │   ├── Services/                      # 15 servicios
│   │   ├── Jobs/                          # SendWelcomeMail
│   │   ├── Mail/                          # Mailable classes
│   │   └── Providers/                     # AppServiceProvider (registro de policies)
│   ├── database/migrations/               # 32 migraciones
│   ├── routes/api.php                     # 146 líneas, todas las rutas API
│   └── tests/                             # PHPUnit (41 tests, 85 assertions)
│
└── tablebit-frontend/                     # React SPA
    └── src/
        ├── App.tsx                        # Root: providers + route table
        ├── components/                    # 18 subdirectorios
        │   ├── ui/                        # shadcn/ui (button, card, dialog, select, etc.)
        │   ├── media/                     # MediaUploader, ResponsiveImage, MediaSection, GalleryManager
        │   ├── layout/                    # MainLayout, DashboardLayout, AuthLayout
        │   ├── restaurant/                # RestaurantCard, GalleryManager
        │   └── system/                    # OfflineBanner, PWA components
        ├── pages/                         # 13 páginas
        │   ├── dashboard/                 # 10 páginas de dashboard
        │   ├── admin/                     # 5 páginas de admin (auditoría, alertas, observabilidad)
        │   └── public/                    # Página pública de restaurante
        ├── context/                       # 3 context providers (Auth, Restaurante, Branding)
        ├── hooks/                         # useSEO, usePWA
        ├── services/                      # api.ts + 3 services
        ├── types/                         # Interfaz Restaurante + 14 tipos derivados
        └── lib/                           # image.ts (getImageUrl), utils.ts, queryPersistence.ts
```

### Backend — API Endpoints (routes/api.php)

#### Públicos (sin autenticación)
| Método | Ruta | Rate limit | Propósito |
|--------|------|-----------|-----------|
| POST | `/api/register` | 10/min | Registro de usuario (DB transaction, retorna `requires_onboarding`) |
| POST | `/api/login` | 10/min | Login (retorna token + `requires_onboarding`) |
| POST | `/api/password/forgot` | 5/min | Solicitar reset de contraseña |
| POST | `/api/password/reset` | 5/min | Ejecutar reset de contraseña |
| POST | `/api/disponibilidad` | 30/min | Verificar disponibilidad de mesas |
| GET | `/api/restaurantes` | global | Listar restaurantes |
| GET | `/api/buscar-restaurantes` | global | Buscar restaurantes (query params) |
| GET | `/api/restaurantes/{id}` | global | Detalle de restaurante |
| GET | `/api/restaurantes/{id}/public` | global | Vista pública |
| GET | `/api/public/restaurantes/{slug}` | global | Vista pública por slug |
| GET | `/api/health` | — | Health check |
| GET | `/api/health/db` | — | Health check BD |
| GET | `/api/health/cache` | — | Health check caché |

#### Autenticados (auth:sanctum)
| Método | Ruta | Middleware extra | Propósito |
|--------|------|-----------------|-----------|
| POST | `/api/logout` | — | Revocar tokens |
| GET | `/api/usuarios/me` | — | Perfil actual (incluye `requires_onboarding`) |
| PUT/PATCH | `/api/usuarios/me` | throttle:sensitive | Actualizar perfil |
| POST | `/api/profile/avatar` | 10/min | Subir avatar |

#### Administrativos (rol: admin, admin_restaurante, superadmin)
| Método | Ruta | Propósito |
|--------|------|-----------|
| POST/PUT/DELETE | `/api/restaurantes[/{id}]` | CRUD restaurantes (con DB transaction en store) |
| GET | `/api/mis-restaurantes` | Listar restaurantes del admin |
| POST | `/api/restaurantes/{id}/imagenes` | Subir imagen (logo/banner/portada/galeria) |
| GET/PUT/DELETE | `/api/restaurantes/{id}/imagenes[/{id}]` | Gestionar imágenes |
| POST/PUT/DELETE | `/api/mesas[/{id}]` | CRUD mesas |
| GET | `/api/reservas` | Listar reservas (admin) |
| PUT/PATCH | `/api/reservas/{id}[/estado]` | Actualizar/cambiar estado reserva |
| GET | `/api/dashboard/restaurante/{id}` | Dashboard analíticas |
| GET | `/api/calendario/restaurante/{id}` | Calendario reservas |
| GET/PUT | `/api/restaurantes/{id}/hours` | Horarios del restaurante |

#### Superadmin
| Método | Ruta | Propósito |
|--------|------|-----------|
| GET | `/api/admin/audit-logs` | Logs de auditoría |
| GET | `/api/admin/system-health` | Salud del sistema |
| GET | `/api/admin/alerts` | Alertas |
| GET | `/api/admin/analytics/*` | Analíticas del sistema |
| GET | `/api/admin/observability/snapshot` | Snapshot de observabilidad |
| GET | `/api/admin/stream` | SSE stream |

### Frontend — Rutas (App.tsx)

| Ruta | Componente | Protección | Provider necesario |
|------|-----------|-----------|-------------------|
| `/` | Home | Pública | — |
| `/buscar-restaurantes` | Home | Pública | — |
| `/restaurantes` | RestaurantesPage | Pública | — |
| `/restaurantes/:id` | RestauranteDetalle | Pública | — |
| `/restaurante/:slug` | RestaurantPublicPage | Pública | — |
| `/login` | Login | Pública | — |
| `/register` | Register | Pública | — |
| `/mis-reservas` | MisReservas | auth | — |
| `/perfil` | Profile | auth | — |
| `/onboarding/restaurante` | OnboardingRestaurante | auth + role admin | **RestauranteProvider** (global) |
| `/dashboard/*` (10 rutas) | Dashboard, GestionMesas, etc. | auth + role admin | **RestauranteProvider** (global) |
| `/dashboard/auditoria` | AuditDashboard | superadmin | — |
| `/dashboard/observabilidad` | ObservabilityHub | superadmin | — |

### Árbol de Providers (orden de anidamiento)

```
<QueryClientProvider>                   ← TanStack React Query
  <AuthProvider>                         ← AuthContext (user, token, login, register, updateUser)
    <RestauranteProvider>                ← RestauranteContext (misRestaurantes, selectedRestauranteId)
      <PwaHandler />                     ← beforeinstallprompt listener (preventDefault)
      <TooltipProvider>                  ← Radix UI
        <BrandingProvider>               ← BrandingContext (CSS variables dinámicas)
          <BrowserRouter>
            <ErrorBoundary>
              <Suspense>                 ← Lazy loading de páginas
                <Routes>
                  ...
```

**Nota crítica:** `RestauranteProvider` fue extraído de `DashboardGuard` (donde solo cubría `/dashboard/*`) y movido al nivel raíz del árbol, justo debajo de `AuthProvider`. Esto asegura que **todas** las rutas administrativas (incluyendo `/onboarding/restaurante`) tengan acceso a `useRestaurante()`.

---

## 3. CONFIGURACIÓN Y DEPENDENCIAS CRÍTICAS

### Backend (composer.json)

**Paquetes de producción:**
- `laravel/framework:^12.0` — Framework core
- `laravel/sanctum:^4.3` — API tokens (Bearer, expiración 7 días configurada en `config/sanctum.php`)
- `intervention/image-laravel:*` — Manipulación de imágenes (redimensionado, variantes WebP)
- `laravel/reverb:^1.10` — WebSockets para tiempo real
- `laravel/pulse:*` — Monitoreo de performance
- `railsware/mailtrap-php:*` + `symfony/mailtrap-mailer:*` — Email en desarrollo

**Paquetes de desarrollo:**
- `phpunit/phpunit:^11.5.3` — Testing (41 tests)
- `laravel/sail:^1.41` — Entorno Docker
- `nunomaduro/collision:^8.6` — Errores en consola

**Configuraciones clave:**
- **CORS** (`config/cors.php`): `allowed_origins` desde env `CORS_ALLOWED_ORIGINS` (default: `localhost:5173,3000,8080`). `supports_credentials: true`.
- **Sanctum** (`config/sanctum.php`): `expiration: 60*24*7` (7 días). Stateful domains desde env.
- **Rate limiting** definido en `AppServiceProvider` o `RouteServiceProvider`: `global` (120/min), `sensitive` (30/min), `reservas` (20/min).
- **Auth guard**: `web` para Sanctum token authentication.

### Frontend (package.json)

**Librerías de UI/UX críticas:**
- `@radix-ui/*` (20+ paquetes) — Componentes headless accesibles (base de shadcn/ui)
- `@tanstack/react-query:^5.83.0` — Server state management (queries + mutations con staleTime/gcTime)
- `react-hook-form:^7.61.1 + zod:^3.25.76` — Forms con validación tipada
- `framer-motion:^12.38.0` — Animaciones declarativas
- `recharts:^3.8.1` — Gráficos (barras, líneas, distribuciones)
- `react-easy-crop:^5.5.7` — Crop de imágenes antes de upload
- `vite-plugin-pwa:^1.3.0` — Service worker + manifest.json
- `zustand:^5.0.13` — Estado global ligero
- `axios:^1.14.0` — HTTP client con interceptors (token en request, 401 → logout)

**Configuración de Vite:** TypeScript strict, path alias `@/` → `src/`, SWC para compilación rápida.

**Variables de entorno frontend:**
- `VITE_API_URL` — Base URL de la API (default: `http://localhost:8000/api`)
- `VITE_STORAGE_URL` — Base URL para archivos estáticos (default: `/storage`)

### Roles de usuario

| Rol | DB enum value | Permisos |
|-----|--------------|----------|
| Cliente | `cliente` | Reservar mesas, reseñas, favoritos |
| Admin restaurante | `admin_restaurante` | Gestionar su restaurante (mesas, horarios, imágenes, reservas) |
| Admin | `admin` | Admin global (heredado, equivalente a admin_restaurante en policies) |
| Superadmin | `superadmin` | Acceso total sin restricciones, panel de observabilidad |

### Autenticación — Flujo completo

1. **Register**: `POST /api/register` → `DB::transaction` → `Usuario::create` → `commit/rollBack` → genera token → retorna `{ user, token, requires_onboarding }`.
2. **Login**: `POST /api/login` → verifica email + estado activo + password hash → `$user->load('restaurante')` → cuenta restaurantes vía `restaurantes()` (belongsToMany) → retorna `{ user, token, requires_onboarding }`.
3. **Token validation** (cada request): Sanctum middleware `auth:sanctum` → lee `Authorization: Bearer {token}` → verifica en `personal_access_tokens` table.
4. **Frontend interceptor** (api.ts): request → agrega `Bearer` header desde `localStorage("tablebit_token")`. Response 401 → limpia localStorage + dispara evento `auth:logout`.
5. **requires_onboarding**: Se calcula en backend: `in_array($user->role, ['admin', 'admin_restaurante']) && $user->restaurantes()->count() === 0`. Disponible en login, register, y `GET /me`.
6. **ProtectedRoute** (frontend): si `requiresOnboarding=true` + rol admin + ruta != `/onboarding/*` → redirige a `/onboarding/restaurante`.

---

## 4. MODELO DE DATOS Y RELACIONES

### Tablas principales

#### `usuarios`
| Columna | Tipo | Constraints |
|---------|------|-------------|
| id | BIGINT PK | Auto increment |
| name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | NOT NULL (hashed) |
| role | ENUM | `admin, cliente, admin_restaurante, superadmin` |
| estado | ENUM | `activo, inactivo` (default: activo) |
| avatar | VARCHAR(255) | NULLABLE (ruta relativa: `usuarios/{id}/avatar/uuid.ext`) |
| remember_token | VARCHAR(100) | NULLABLE |

#### `restaurantes`
| Columna | Tipo | Constraints |
|---------|------|-------------|
| id | BIGINT PK | Auto increment |
| user_id | BIGINT FK | `→ usuarios(id) ON DELETE CASCADE` (propietario) |
| nombre | VARCHAR(255) | NOT NULL |
| slug | VARCHAR(255) | UNIQUE (auto-generado en `creating` boot) |
| direccion | VARCHAR(255) | NOT NULL |
| telefono | VARCHAR(255) | NULLABLE |
| ciudad | VARCHAR(255) | NULLABLE |
| tipo_comida | VARCHAR(255) | NULLABLE |
| descripcion | TEXT | NULLABLE |
| imagen | VARCHAR(255) | NULLABLE (ruta relativa: portada/cover) |
| portada | VARCHAR(255) | NULLABLE |
| logo | VARCHAR(255) | NULLABLE (ruta relativa) |
| banner | VARCHAR(255) | NULLABLE |
| horario_apertura | VARCHAR(255) | NULLABLE |
| horario_cierre | VARCHAR(255) | NULLABLE |
| capacidad_total | INTEGER | NULLABLE |
| estado | ENUM | `activo, inactivo` |
| branding | JSON | NULLABLE (`{ primary_color, secondary_color, accent_color }`) |
| lat, lng | VARCHAR | NULLABLE (migrados pero no en fillable) |
| amenities | JSON | NULLABLE (migrados pero no en fillable) |

#### `mesas`
| Columna | Tipo | Constraints |
|---------|------|-------------|
| id | BIGINT PK | — |
| restaurante_id | BIGINT FK | `→ restaurantes(id) ON DELETE CASCADE` |
| numero | INTEGER | UNIQUE por restaurante |
| capacidad | INTEGER | — |
| estado | ENUM | `disponible, ocupada, inactiva, mantenimiento` |

#### `reservas`
| Columna | Tipo | Constraints |
|---------|------|-------------|
| id | BIGINT PK | — |
| cliente_id | BIGINT FK | `→ usuarios(id) ON DELETE CASCADE` |
| restaurante_id | BIGINT FK | `→ restaurantes(id) ON DELETE CASCADE` |
| mesa_id | BIGINT FK | `→ mesas(id) ON DELETE CASCADE` |
| fecha | DATE | — |
| hora | TIME | — |
| hora_fin | TIME | NULLABLE |
| duracion | INTEGER | Minutos (default: 90) |
| cantidad_personas | INTEGER | — |
| tipo_evento | VARCHAR | NULLABLE |
| notas | TEXT | NULLABLE |
| estado | ENUM | `pendiente, confirmada, completada, cancelada, no_show` |
| deleted_at | TIMESTAMP | Soft deletes |

**Estados de reserva (máquina de estados):**
```
pendiente → confirmada → completada
                ↓            ↓
            cancelada     cancelada
                ↓
            no_show
```

#### `restaurant_user` (pivote multi-tenant)
| Columna | Tipo | Constraints |
|---------|------|-------------|
| id | BIGINT PK | — |
| restaurante_id | BIGINT FK | `→ restaurantes(id) ON DELETE CASCADE` |
| user_id | BIGINT FK | `→ usuarios(id) ON DELETE CASCADE` |
| role | VARCHAR(255) | Default: `owner` (owner, admin, staff) |
| — | — | UNIQUE(restaurante_id, user_id) |

### Relaciones clave (Eloquent)

**Usuario:**
- `restaurante()`: HasOne → `Restaurante(user_id)` — restaurante propio (legacy)
- `restaurantes()`: BelongsToMany → `restaurant_user` — multi-tenant
- `reservas()`: HasMany → `Reservas(cliente_id)`
- `favoritos()`: HasMany → `Favorito(cliente_id)`

**Restaurante:**
- `user()`: BelongsTo → `Usuario`
- `users()`: BelongsToMany → `restaurant_user`
- `mesas()`: HasMany → `Mesa`
- `reservas()`: HasMany → `Reservas`
- `imagenes()`: HasMany → `Imagen`
- `horarios()`: HasMany → `HorarioDia`
- `hours()`: HasMany → `RestaurantHour`
- `resenas()`: HasMany → `Resena`
- Accessors: `ratingPromedio`, `totalResenas`
- Métodos: `estaAbiertoAhora()`, scopes: `activos`, `porCiudad`, `porTipoComida`
- Boot events: auto-genera slug en `creating` y `updating`

### Índices de performance (migración `2026_05_22_000002`)
- `imagenes(restaurante_id, tipo)` → `imagenes_restaurante_id_tipo_index`
- `reservas(restaurante_id, fecha)` → `reservas_restaurante_id_fecha_index`

---

## 5. ESTADO ACTUAL DEL DESARROLLO Y FLUJOS IMPLEMENTADOS

### Módulos 100% operativos

#### Autenticación y onboarding
- **Register/Login/Logout**: Funcional con tokens Sanctum. Register envuelto en `DB::transaction()`.
- **requires_onboarding**: Backend calcula flag en login, register y `GET /me`. Frontend `ProtectedRoute.tsx` redirige admins sin restaurante a `/onboarding/restaurante`.
- **Onboarding wizard**: 3 pasos (info básica → logo/cover → branding). Usa `useMutation` + `RestauranteContext.setSelectedRestauranteId` para persistir y redirigir al dashboard.
- **Provider fix**: `RestauranteProvider` movido a raíz del árbol para que `/onboarding/restaurante` tenga acceso.

#### Gestión de restaurantes (multi-tenant)
- **Dashboard**: 6 cards de insight (reservas hoy, ocupación, cancelaciones, etc.) + timeline de próximas reservas + checklist de onboarding.
- **CRUD mesas**: Con tabla interactiva, drag & drop de estado, mantenimiento.
- **Calendario**: Vista mensual con eventos de reservas arrastrables.
- **Horarios**: Por días de semana con doble turno (mañana/tarde).
- **Branding**: Editor de colores primario/secundario/acento con vista previa.
- **Media (imágenes)**: Subida de logo, banner, portada con `MediaSection` + `MediaUploader` (crop + WebP). Optimistic UI via `queryClient.setQueryData`.
- **Mapa de mesas**: Vista visual del restaurante con arrastre de mesas.

#### Imágenes (backend)
- **MediaService.uploadRestaurantImage()**: Guarda archivo en `storage/app/public/restaurantes/{id}/{tipo}/uuid.ext`, genera variantes WebP (thumbnails via `ImageVariantService`), elimina archivo anterior + variantes si existe, actualiza columna en BD.
- **URLs**: `Storage::url($fullPath)` para URLs legibles. Frontend las resuelve con `getImageUrl()` (en `lib/image.ts`) que soporta CDN, fallback y caché de URLs fallidas.
- **Validación**: `mimes:jpeg,png,jpg,webp|max:5120` (5MB).

#### Reservas
- **Disponibilidad**: `ReservaService.verificarDisponibilidad()` valida horario, capacidad de mesas, conflictos de tiempo.
- **Creación**: `ReservaService.crearReserva()` con asignación automática de mesa si no se especifica.
- **Cancelación**: Client puede cancelar sus reservas. Admin puede cambiar estado (pendiente→confirmada→completada/cancelada/no_show).

#### Perfil de usuario
- **Avatar**: Subida vía `POST /api/profile/avatar` con validación `image|max:2048`. Backend elimina avatar anterior si existe. Frontend `Profile.tsx` usa `updateUser()` de `AuthContext` para sincronización inmediata en Navbar/Sidebar sin refresh.
- **Datos personales**: Update via `PUT /api/usuarios/me` con validación básica.

#### Seguridad
- **Policies**: `RestaurantePolicy`, `MesaPolicy`, `ReservaPolicy` registradas en `AppServiceProvider`. Validan ownership del recurso (superadmin bypass).
- **Role middleware**: Filtro por role en rutas.
- **Rate limiting**: 10/min auth, 5/min password reset, 30/min disponibilidad, 120/min global.

#### PWA
- Service worker generado por `vite-plugin-pwa` con precache de 120 entradas.
- `PwaHandler` en App.tsx captura `beforeinstallprompt` con `preventDefault()`.
- `OfflineBanner` con 3 estados (offline, reconectando, online).
- Manifest en `public/manifest.webmanifest`.

### Flujo de datos: Frontend → Backend (ejemplo típico)

```
React Component (página)         ← carga/error/empty states
  ↓ useQuery / useMutation
Custom Hook / Service            ← tipado vía interfaces TypeScript
  ↓
api.ts (axios instance)          ← interceptor: agrega Bearer token
  ↓
API REST (Laravel)               ← middleware: auth:sanctum + throttle + role
  ↓
Controller                       ← validación con FormRequest
  ↓
Service                          ← lógica de negocio + DB::transaction
  ↓
Model (Eloquent)                 ← scopes, relaciones, casts
  ↓
MySQL                            ← con índices compuestos
```

### Problemas resueltos en Core Recovery (Sprint actual)

| Problema | Síntoma | Solución | Archivos tocados |
|----------|---------|----------|-----------------|
| Runtime Crash onboarding | `useRestaurante must be used within RestauranteProvider` | Movido `RestauranteProvider` a raíz del árbol en App.tsx | `App.tsx` |
| Avatar no persiste en sesión | Navbar muestra avatar viejo hasta F5 | `updateUser()` expuesto en AuthContext, consumido en Profile.tsx | `AuthContext.tsx`, `Profile.tsx` |
| Registro sin transacción | Datos parciales si falla creación | `DB::beginTransaction()` + `commit()`/`rollBack()` en AuthController | `AuthController.php` |
| Admin sin restaurante llega a dashboard | Dashboard sin datos, confuso | `requires_onboarding` flag + ProtectedRoute redirect | `AuthController.php`, `ProtectedRoute.tsx` |
| Imagen subida no se refleja en navbar | Optimistic UI faltante | `setQueryData` en cache de React Query al subir/eliminar imagen | `RestaurantMediaSettings.tsx` |
| PWA `beforeinstallprompt` warning | Console warning | Listener con `preventDefault()` en `PwaHandler` | `App.tsx` |

### Build & Tests (último estado verificado)

| Verificación | Resultado |
|---|---|
| Frontend build (`npm run build`) | 3008 modules, 0 errores |
| Backend tests (`php artisan test`) | 41 passed, 85 assertions, ~9s |

### Patrones de código establecidos

**Backend — Controller con inyección de servicios:**
```php
class ImagenController extends Controller
{
    public function __construct(
        private readonly MediaService $mediaService,
        private readonly ImageMetadataService $metadataService,
    ) {}
}
```

**Backend — Response consistente:**
```php
return response()->json([
    'message' => '...',
    'data' => $resource,
], 201);
```

**Frontend — Página con layout + SEO + estados:**
```tsx
const Page = () => {
  useSEO({ title: "...", description: "..." });
  if (isLoading) return <Loader />;
  if (error) return <ErrorState />;
  return (
    <MainLayout>
      <StructuredData data={...} />
      ...
    </MainLayout>
  );
};
```

**Frontend — React Query pattern:**
```tsx
const { data, isLoading } = useQuery({
  queryKey: ['key', param],
  queryFn: () => service.get(param),
  enabled: !!param,
  staleTime: 5 * 60 * 1000,
});
```

### Cosas que NO están implementadas

- **Pagos**: Excluido del alcance explícitamente.
- **Notificaciones push**: Solo PWA básico (service worker + manifest).
- **Autenticación OAuth / social**: Solo Sanctum con email+password.
- **Modo oscuro / tema**: `next-themes` está en package.json pero no hay toggle implementado.
- **`lat`, `lng`, `amenities`** en Restaurante: Migraciones existen pero columnas no están en `$fillable` del modelo.

### Notas para el próximo desarrollador

1. **El `RestauranteContext` está en raíz**: Cualquier componente puede usar `useRestaurante()`. No duplicar providers.
2. **Avatar sync**: Usar `updateUser()` del AuthContext después de mutar el perfil. No escribir directamente a localStorage.
3. **Imágenes**: Siempre usar `getImageUrl(rutaRelativa)` del helper `@/lib/image` para renderizar URLs. No concatenar strings manualmente.
4. **DB transactions**: Toda operación que escriba en múltiples tablas debe usar `DB::beginTransaction()` / `commit()` / `rollBack()`.
5. **Snake_case vs camelCase**: Backend usa snake_case en JSON (Eloquent por defecto). Frontend usa snake_case en interfaces para coincidir.
6. **El onboarding wizard asume que el admin NO tiene restaurantes**: Si por alguna razón llega con restaurante existente, el wizard fallará porque `setSelectedRestauranteId` espera un ID existente.
