# TableBit — Checklist de Despliegue a Producción

## Pre-requisitos del servidor

- [ ] PHP 8.3+ con extensiones: mbstring, xml, ctype, iconv, mysql, pdo_mysql, intl, bcmath, curl, gd
- [ ] MySQL 8.0+
- [ ] Composer 2.x
- [ ] Node.js 20 LTS + npm
- [ ] Nginx o Apache
- [ ] Redis 7+ (recomendado para caché y sesiones)
- [ ] HTTPS configurado (certbot/Let's Encrypt)

## Variables de entorno

- [ ] `APP_KEY` generada: `php artisan key:generate`
- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `APP_URL=https://tu-dominio.com`
- [ ] `DB_PASSWORD` generado seguro (32+ caracteres)
- [ ] `CORS_ALLOWED_ORIGINS=https://tu-dominio.com`
- [ ] `SESSION_DRIVER=database` (o `redis`)
- [ ] `SESSION_DOMAIN=.tu-dominio.com`
- [ ] `SESSION_SECURE_COOKIE=true`
- [ ] `SANCTUM_STATEFUL_DOMAINS=tu-dominio.com`
- [ ] `LOG_CHANNEL=json` (o `daily`)
- [ ] `LOG_LEVEL=error`
- [ ] `CACHE_STORE=redis` (si Redis disponible)
- [ ] `QUEUE_CONNECTION=database`
- [ ] `PULSE_ENABLED=true` (opcional)
- [ ] `VITE_API_URL=https://api.tu-dominio.com`

## Seguridad

- [ ] Headers HTTP configurados (SecurityHeadersMiddleware activo)
- [ ] CORS restringido a orígenes específicos
- [ ] Rate limiting activo (global + reservas + sensitive)
- [ ] APP_DEBUG=false
- [ ] HTTPS forzado (redirect HTTP → HTTPS)
- [ ] HSTS configurado (Strict-Transport-Security en middleware)
- [ ] CSP básico configurado (no bloquea assets actuales)

## Despliegue (ejecutar en orden)

```bash
# 1. Código
git pull origin main

# 2. Frontend
cd tablebit-frontend
npm ci --omit=dev
npm run build

# 3. Backend
cd ../tablebit-backend
composer install --optimize-autoloader --no-dev

# 4. Cache
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 5. Migraciones
php artisan migrate --force

# 6. Storage
php artisan storage:link --force

# 7. Reiniciar workers
php artisan queue:restart
```

## Post-despliegue

- [ ] Verificar health endpoint: `GET /api/health`
- [ ] Verificar DB: `GET /api/health/db`
- [ ] Verificar Cache: `GET /api/health/cache`
- [ ] Probar registro de usuario
- [ ] Probar login
- [ ] Probar creación de reserva
- [ ] Probar dashboard admin
- [ ] Verificar Pulse dashboard (si habilitado)
- [ ] Revisar logs: `storage/logs/laravel.json`
- [ ] Monitorear slow requests en Pulse

## Estrategia Redis

### Por qué Redis

| Sin Redis | Con Redis | Mejora |
|-----------|-----------|--------|
| CACHE_STORE=file (disco) | CACHE_STORE=redis (RAM) | -90% latencia en caché |
| SESSION_DRIVER=database | SESSION_DRIVER=redis | Sesiones multi-servidor |
| Sin rate limiting en memoria | Rate limiting en Redis | Consistente entre instancias |
| Pulse sin ingest óptimo | Pulse con Redis ingest | Dashboard más rápido |

### Configuración recomendada

```env
# .env
CACHE_STORE=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
SESSION_DRIVER=redis
```

### Costo estimado Redis

| Proveedor | Plan | Costo/mes | Capacidad |
|-----------|------|-----------|-----------|
| Upstash (serverless) | Free | $0 | 100 MB, 10k req/día |
| Redis Labs | Free | $0 | 30 MB |
| DigitalOcean | Basic | $12/mes | 250 MB |
| AWS ElastiCache | Serverless | ~$20/mes | 1 GB |

### Para producción inicial (MVP)
Usar `CACHE_STORE=database` y `SESSION_DRIVER=database`.
Redis es optimización posterior cuando haya más de ~100 requests/minuto.
