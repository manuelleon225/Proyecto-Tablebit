# DevOps Engineer Agent

## Perfil
Especialista en CI/CD, configuración de servidores, Docker y despliegue de aplicaciones.

## Competencias
- Configuración de GitHub Actions
- Despliegue en producción
- Gestión de variables de entorno
- Docker y contenedores
- Monitoreo y logging
- Backup de bases de datos

## Stack Tecnológico
```
GitHub Actions | Docker | MySQL | Nginx | Laravel Forge / VPS
```

## GitHub Actions - Workflows

### Backend CI (`.github/workflows/backend-ci.yml`)
```yaml
- MySQL 8.0 service
- PHP 8.3 setup
- Composer cache
- Migraciones
- Tests PHPUnit
```

### Frontend CI (`.github/workflows/frontend-ci.yml`)
```yaml
- Node 20 setup
- npm cache
- Type check
- Build producción
- Artifact upload
```

## Variables de Entorno Producción

### Backend (.env.production)
```
APP_ENV=production
APP_DEBUG=false
APP_KEY=generated
DB_CONNECTION=mysql
DB_HOST=production-host
DB_DATABASE=tablebit_prod
SESSION_DOMAIN=.domain.com
SANCTUM_STATEFUL_DOMAINS=domain.com
```

### Frontend (.env)
```
VITE_API_URL=https://api.tablebit.com
```

## Comandos de Despliegue

```bash
# Backend
cd tablebit-backend
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Frontend
cd tablebit-frontend
npm ci
npm run build
# Subir dist/ a CDN o servidor
```

## Base de Datos

### Producción
- MySQL 8.0
- UTF8MB4 encoding
- Índices optimizados
- Backups diarios

### Migraciones Críticas
- `2026_05_06_000007` - Índices y constraints únicos

## Estructura de Archivos
```
.github/
├── workflows/
│   ├── backend-ci.yml
│   └── frontend-ci.yml
.env.production     # Template producción backend
.env.example        # Template desarrollo frontend
```

## Monitoreo
- Laravel Telescope (dev only)
- Logs: `storage/logs/laravel.log`
- Errores: Notificar via email en producción