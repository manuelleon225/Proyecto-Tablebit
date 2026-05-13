# TableBit — Reserva de Mesas en Restaurantes

**TableBit** es un SaaS moderno de gestión de reservas y mesas para restaurantes. Permite a los usuarios descubrir restaurantes, reservar mesas al instante, dejar reseñas y gestionar favoritos. Para administradores, ofrece un dashboard completo con analytics, calendario y gestión de mesas.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **Backend** | Laravel 12, PHP 8.3, MySQL 8.0 |
| **Auth** | Laravel Sanctum (tokens 7 días) |
| **API** | RESTful JSON API con rate limiting |
| **CI/CD** | GitHub Actions |
| **Queue** | Database driver (Laravel Queue) |

---

## Funcionalidades

### Usuarios (Cliente)
- 🔍 Buscar restaurantes por nombre, ciudad, tipo de comida
- 📋 Ver detalle completo: horarios, mesas, reseñas, fotos
- ✅ Reservar mesas con confirmación instantánea
- ⭐ Dejar reseñas y calificaciones
- ❤️ Gestionar favoritos
- 📱 Panel "Mis Reservas" con filtros y cancelación

### Administradores (Admin / Admin Restaurante)
- 📊 Dashboard con KPIs: reservas hoy, ocupación, horas pico
- 📅 Calendario interactivo de reservas
- 🪑 Gestión completa de mesas (CRUD)
- 📋 Listado de reservas con filtros
- 📈 Analytics: reservas por día/semana, tendencias

### Seguridad
- 🔐 Autenticación con tokens Sanctum
- 🛡️ Rate limiting diferenciado (auth, reservas, sensible)
- 👮 Policies de autorización por rol
- 🚫 Protección contra acceso cruzado a datos
- 📝 Logging JSON estructurado
- ✅ Health checks (API, DB, Cache)

---

## Arquitectura

```
tableBit/
├── tablebit-frontend/       # React SPA (Vite)
│   ├── src/
│   │   ├── components/      # UI components + shadcn/ui
│   │   ├── pages/           # Page components
│   │   ├── layouts/         # MainLayout, DashboardLayout
│   │   ├── services/        # API services (Axios)
│   │   ├── hooks/           # Custom hooks
│   │   ├── context/         # AuthContext
│   │   └── lib/             # Utilities
│   └── public/
├── tablebit-backend/        # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Http/Requests/   # Form Request validation
│   │   ├── Models/
│   │   ├── Policies/        # Authorization
│   │   └── Services/        # Business logic
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/api.php
│   └── tests/
```

---

## Instalación

### Requisitos
- PHP 8.3+, MySQL 8.0, Composer 2.x
- Node.js 20 LTS, npm

### Backend

```bash
cd tablebit-backend
cp .env.example .env
# Configurar DB en .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend

```bash
cd tablebit-frontend
cp .env.example .env
npm install
npm run dev
```

---

## Credenciales Demo

| Rol | Email | Contraseña |
|-----|-------|------------|
| **Admin** | admin@test.com | admin123 |
| **Super Admin** | superadmin@test.com | SuperAdmin123! |
| **Admin Restaurante** | admin.rest1@test.com | Admin123! |
| **Admin Restaurante** | admin.rest2@test.com | Admin123! |
| **Cliente** | ana@test.com | Cliente1! |

---

## API Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/register` | Registro de usuario |
| POST | `/api/login` | Inicio de sesión |
| POST | `/api/logout` | Cierre de sesión |
| GET | `/api/restaurantes` | Listado restaurantes |
| GET | `/api/restaurantes/{id}` | Detalle restaurante |
| GET | `/api/buscar-restaurantes` | Búsqueda restaurantes |
| POST | `/api/disponibilidad` | Verificar disponibilidad |
| POST | `/api/reserva-automatica` | Crear reserva |
| GET | `/api/mis-reservas` | Reservas del usuario |
| GET | `/api/dashboard/restaurante/{id}` | Dashboard analytics |
| GET | `/api/calendario/restaurante/{id}` | Calendario reservas |
| GET | `/api/health` | Health check API |

---

## Testing

```bash
# Backend (PHPUnit)
cd tablebit-backend && php artisan test

# Frontend (Build verification)
cd tablebit-frontend && npm run build
```

---

## Despliegue

Ver [DEPLOY.md](tablebit-backend/DEPLOY.md) para instrucciones detalladas.

```bash
# Deploy script automatizado
cd tablebit-backend && bash deploy.sh production
```

---

## Roadmap

- [x] Core funcional (registro, login, restaurantes, reservas)
- [x] Dashboard admin con analytics y calendario
- [x] Gestión de mesas, reseñas y favoritos
- [x] Seguridad: roles, rate limiting, policies
- [x] CI/CD: GitHub Actions
- [x] SEO, PWA, OpenGraph
- [ ] Notificaciones por email (reservas)
- [ ] Recordatorios automáticos
- [ ] Exportación de reportes (CSV/PDF)
- [ ] Multi-idioma (ES/EN)
- [ ] Modo oscuro

---

## Licencia

MIT &copy; 2026 TableBit
