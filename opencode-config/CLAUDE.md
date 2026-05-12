# TableBit - Proyecto de Reserva de Mesas en Restaurantes

## Resumen del Proyecto

TableBit es una plataforma web para reserva de mesas en restaurantes. Permite a los usuarios descubrir restaurantes, hacer reservas, dejar reseñas y gestionar favoritos.

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Backend | Laravel 12, PHP 8.3, MySQL 8.0 |
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Auth | Laravel Sanctum (tokens 7 días) |
| API | RESTful JSON API |

## Estructura del Proyecto

```
tableBit/
├── tablebit-backend/     # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   ├── Policies/
│   │   └── Services/
│   ├── database/migrations/
│   ├── routes/api.php
│   └── tests/
├── tablebit-frontend/    # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── services/
│   └── public/
├── opencode-config/      # Configuración de agentes
│   ├── agents/
│   ├── rules/
│   └── opencode.json
└── .github/workflows/    # CI/CD
```

## Sistema de Usuarios y Roles

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| `cliente` | Usuario regular | Reservar, reseñas, favoritos |
| `admin` | Administrador global | Gestión total |
| `admin_restaurante` | Gestor de restaurante | Gestión de su restaurante |
| `superadmin` | Superadministrador | Acceso total sin restricciones |

## Estados de Reservas

```
pendiente → confirmada → completada
              ↓              ↓
          cancelada      cancelada
              ↓
          no_show
```

## Funcionalidades Implementadas

### Core
- [x] Registro/Login de usuarios
- [x] Listado y búsqueda de restaurantes
- [x] Detalle de restaurante con imágenes
- [x] Reserva de mesas con validación de disponibilidad
- [x] Gestión de mesas por restaurante
- [x] Dashboard para administradores
- [x] Calendario de reservas
- [x] Reseñas y calificaciones
- [x] Favoritos

### Seguridad
- [x] Rate limiting en auth (10/min)
- [x] Rate limiting en password reset (5/min)
- [x] Rate limiting en disponibilidad (30/min)
- [x] Policies de autorización
- [x] Token Sanctum 7 días
- [x] Índices BD para performance

### Performance
- [x] Eager loading con withAvg/withCount
- [x] Code splitting con lazy()
- [x] PWA configurado
- [x] SEO con meta tags y JSON-LD

### Excluido
- [ ] Sistema de pagos

## API Endpoints Principales

### Autenticación
```
POST   /api/register
POST   /api/login
POST   /api/logout
POST   /api/password/forgot
POST   /api/password/reset
```

### Restaurantes
```
GET    /api/restaurantes
GET    /api/restaurantes/{id}
GET    /api/restaurantes/{id}/public
GET    /api/buscar-restaurantes
POST   /api/restaurantes           (admin)
PUT    /api/restaurantes/{id}      (admin)
DELETE /api/restaurantes/{id}      (admin)
```

### Reservas
```
POST   /api/disponibilidad
POST   /api/reserva-automatica
GET    /api/mis-reservas           (cliente)
PATCH  /api/reservas/{id}/cancelar (cliente)
GET    /api/reservas               (admin)
POST   /api/reservas               (admin)
PUT    /api/reservas/{id}          (admin)
DELETE /api/reservas/{id}          (admin)
```

### Dashboard
```
GET    /api/dashboard/restaurante/{id}
GET    /api/calendario/restaurante/{id}
```

## Comandos de Desarrollo

```bash
# Backend
cd tablebit-backend
php artisan migrate
php artisan db:seed
php artisan test

# Frontend
cd tablebit-frontend
npm install
npm run dev
npm run build
```

## Testing

```bash
# Backend
php artisan test

# Frontend
npm run build
```

## Deploy

El proyecto está configurado con GitHub Actions para CI/CD:
- `.github/workflows/backend-ci.yml` - Tests y migraciones
- `.github/workflows/frontend-ci.yml` - Build y type check

Variables necesarias en producción (ver `.env.production`).

## Контекст Atual (Sprint 2)

- Backend hardening completo
- Rate limiting implementado
- Policies de autorización operativas
- Índices de base de datos optimizados
- Code splitting en frontend
- CI/CD configurado
- SEO y PWA configurados

### Próximos Pasos
1. Testing E2E con Playwright (ya configurado)
2. Despliegue a producción
3. Monitoreo y logging

## Notas Importantes

- Las contraseñas en la DB de desarrollo son inseguras (`123456`, `admin123`)
- Para producción, usar contraseñas seguras y HTTPS
- El módulo de pagos está excluido del alcance
- Usar Playwright para tests E2E