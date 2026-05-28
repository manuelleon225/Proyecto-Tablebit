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
  <a href="#features">✨ Features</a> •
  <a href="#tech-stack">🛠 Stack</a> •
  <a href="#quick-start">🚀 Quick Start</a> •
  <a href="#architecture">🏗 Arquitectura</a> •
  <a href="#deploy">📦 Deploy</a> •
  <a href="#security">🔐 Seguridad</a> •
  <a href="#roadmap">📈 Roadmap</a>
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

| Categoría | Tecnologías |
|-----------|-------------|
| **Frontend** | React 18 · TypeScript 5 · Tailwind CSS 4 · shadcn/ui · React Query · Zustand · Framer Motion · Recharts |
| **Backend** | Laravel 12 · PHP 8.3 · Sanctum Auth · Reverb WS · Queue Jobs · Mailtrap/SMTP · API REST · Form Requests |
| **Infraestructura** | MySQL 8.0 · Redis 7 · Nginx · GitHub Actions · Laravel Pulse · PWA + SEO · OpenGraph |

## 🚀 Quick Start

<details>
<summary><b>🐘 Backend — Laravel API</b></summary>

```bash
cd tablebit-backend
cp .env.example .env
# Configurar DB en .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```
</details>

<details>
<summary><b>⚛️ Frontend — React SPA</b></summary>

```bash
cd tablebit-frontend
npm install
npm run dev
```
</details>

> 💡 **Credenciales Demo**
>
> | Rol | Email | Password |
> |-----|-------|----------|
> | **Admin Demo** | admin@tablebit.com | password |
> | **Cliente Demo** | carlos@demo.com | password |
> | Admin | admin@test.com | admin123 |
> | Admin Restaurante | admin.rest1@test.com | Admin123! |
> | Cliente | ana@test.com | Cliente1! |

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
└── README.md
```

## 📦 Deploy

<details>
<summary><b>⚙️ Manual</b></summary>

```bash
# Frontend
cd tablebit-frontend && npm run build
# Backend
cd tablebit-backend && bash deploy.sh production
```
</details>

<details>
<summary><b>🔐 Variables de entorno producción</b></summary>

```env
APP_ENV=production
APP_DEBUG=false
DB_PASSWORD=<generar_segura>
SESSION_DRIVER=redis
CACHE_STORE=redis
QUEUE_CONNECTION=redis
BROADCAST_CONNECTION=reverb
```
</details>

## 🔐 Seguridad

| Componente | Implementación |
|-----------|----------------|
| **Auth** | Laravel Sanctum (tokens 7 días) |
| **Rate Limiting** | 10/min auth · 30/min disponibilidad · 20/min reservas |
| **Headers** | CSP · HSTS · X-Frame-Options · X-Content-Type-Options |
| **Authorization** | Policies por rol + RoleMiddleware |
| **Validation** | FormRequests (backend) + Zod (frontend) |
| **CORS** | Restringido a orígenes específicos |

> ⚠️ **Aviso de seguridad:** Las contraseñas en entorno de desarrollo son inseguras (`123456`, `admin123`). Para producción, usar contraseñas seguras y HTTPS.

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
