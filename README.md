<p align="center">
  <img src="https://img.shields.io/badge/status-v1.0.0--beta-success" alt="Version">
  <img src="https://img.shields.io/badge/PHP-8.3-777bb4" alt="PHP">
  <img src="https://img.shields.io/badge/Laravel-12-ff2d20" alt="Laravel">
  <img src="https://img.shields.io/badge/React-18-61dafb" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4-06b6d4" alt="Tailwind">
  <img src="https://img.shields.io/badge/MySQL-8.0-4479a1" alt="MySQL">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

<h1 align="center">🍽️ TableBit</h1>
<p align="center"><strong>SaaS moderno de gestión de reservas para restaurantes</strong></p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Stack</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Arquitectura</a> •
  <a href="#deploy">Deploy</a> •
  <a href="#demo">Demo</a>
</p>

---

## ✨ Features

| 🎯 **Reservas** | 📊 **Dashboard** | 🛠️ **Gestión** |
|----------------|------------------|----------------|
| Confirmación instantánea | KPIs en tiempo real | Mapa interactivo de mesas |
| Disponibilidad en vivo | Analytics con gráficos | CRUD completo |
| Email de confirmación | Horas pico y tendencias | Multi-restaurante |
| Cancelación online | Ocupación por hora | Roles y permisos |

| 🔔 **Notificaciones** | 🔐 **Seguridad** | 🚀 **Performance** |
|----------------------|------------------|-------------------|
| WelcomeMail automatizado | Laravel Sanctum tokens | React Query caching |
| Confirmación de reserva | Rate limiting | Lazy loading |
| Cancelación | Policies por rol | Code splitting |
| Recordatorio (próximamente) | CORS + CSP headers | Server-side pagination |

## 🛠️ Tech Stack

```
Frontend         Backend          Infraestructura
React 18         Laravel 12       MySQL 8.0
TypeScript 5     PHP 8.3          Redis 7
Tailwind CSS 4   Sanctum Auth     Docker
shadcn/ui        Reverb WS        Nginx
React Query      Queue Jobs       GitHub Actions
Zustand          Mailtrap/SMTP    Laravel Pulse
Framer Motion    API REST         PWA + SEO
Recharts         Form Requests    OpenGraph
```

## 🚀 Quick Start

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
npm install
npm run dev
```

### Credenciales Demo

| Rol | Email | Password |
|-----|-------|----------|
| **Admin Demo** | admin@tablebit.com | password |
| **Cliente Demo** | carlos@demo.com | password |
| Admin | admin@test.com | admin123 |
| Admin Restaurante | admin.rest1@test.com | Admin123! |
| Cliente | ana@test.com | Cliente1! |

## 🏗️ Arquitectura

```
tableBit/
├── tablebit-frontend/       # React SPA (Vite)
│   ├── src/
│   │   ├── components/      # UI + shadcn/ui + analytics + mesas
│   │   ├── pages/           # Page components + dashboard/
│   │   ├── layouts/         # MainLayout, DashboardLayout
│   │   ├── services/        # Axios API services
│   │   ├── stores/          # Zustand stores
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # utils, date formatters
│   └── public/              # PWA, favicon
├── tablebit-backend/        # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/   # REST API controllers
│   │   ├── Http/Requests/      # FormRequest validation
│   │   ├── Models/             # Eloquent models
│   │   ├── Services/           # Business logic layer
│   │   ├── Policies/           # Authorization
│   │   └── Events/             # Broadcast events
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   ├── api.php             # API routes
│   │   └── channels.php        # WebSocket channels
│   └── tests/
├── docker-compose.yml
├── .nginx/default.conf
└── README.md
```

## 📦 Deploy

### Docker (producción)

```bash
docker compose up -d
```

### Manual

```bash
# Frontend
cd tablebit-frontend && npm run build
# Backend
cd tablebit-backend && bash deploy.sh production
```

### Variables de entorno producción

```env
APP_ENV=production
APP_DEBUG=false
DB_PASSWORD=<generar_segura>
SESSION_DRIVER=redis
CACHE_STORE=redis
QUEUE_CONNECTION=redis
BROADCAST_CONNECTION=reverb
```

## 🔐 Seguridad

- **Auth**: Laravel Sanctum (tokens 7 días)
- **Rate Limiting**: 10/min auth, 30/min disponibilidad, 20/min reservas
- **Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **Authorization**: Policies por rol + RoleMiddleware
- **Validation**: FormRequests (backend) + Zod (frontend)
- **CORS**: Restringido a orígenes específicos

## 📈 Roadmap

- [x] Core: reservas, auth, restaurantes
- [x] Dashboard: KPIs, analytics, calendario
- [x] Mapa interactivo de mesas
- [x] Emails: bienvenida, confirmación, cancelación
- [x] Multi-restaurante con contexto persistente
- [x] Notificaciones en tiempo real
- [x] WebSockets con Laravel Reverb
- [ ] Recordatorios automáticos 24h
- [ ] Exportación de reportes (CSV/PDF)
- [ ] Modo oscuro
- [ ] i18n (ES/EN)

## 📄 Licencia

MIT &copy; 2026 TableBit
