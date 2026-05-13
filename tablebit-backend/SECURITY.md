# TableBit — Seguridad

## Autenticación

- **Mecanismo:** Laravel Sanctum (token-based)
- **Expiración:** 7 días (configurable en `config/sanctum.php`)
- **Almacenamiento:** localStorage (frontend) + `personal_access_tokens` (backend)
- **Refresh:** Ninguno — al expirar, el usuario debe re-autenticarse

## Autorización

### Policies

| Policy | Métodos | Reglas |
|--------|---------|--------|
| `ReservaPolicy` | view, create, update, delete, cancel | Superadmin total; admin_restaurante solo su restaurante; cliente solo sus reservas |
| `RestaurantePolicy` | create, update, delete, manageMesas, manageReservas | Superadmin total; admin cualquier restaurante; admin_restaurante solo el suyo |
| `MesaPolicy` | create, update, delete | Superadmin total; admin_restaurante solo mesas de su restaurante |

### RoleMiddleware

Ruta protegida con: `middleware('role:admin,admin_restaurante,superadmin')`

## Rate Limiting

| Limitador | Requests/minuto | Uso |
|-----------|----------------|-----|
| `global` | 120 | Rutas generales autenticadas |
| `reservas` | 20 | Creación/modificación de reservas |
| `sensitive` | 5 | Actualización de perfil |
| Auth (hardcoded) | 10 | Login/Register |
| Disponibilidad | 30 | Consulta de disponibilidad |

## Headers de Seguridad

Aplicados via `SecurityHeadersMiddleware`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`: restringido
- `Strict-Transport-Security`: HSTS (1 año)
- `Content-Security-Policy`: básico

## Base de Datos

- Consultas: Eloquent ORM (prepared statements nativos)
- Índices: Foreign keys, campos de búsqueda frecuente
- Soft deletes: Tabla `reservas`
- Contraseñas: Hash con bcrypt (12 rounds)
- Validación: FormRequests (server-side) + Zod (client-side)

## CORS

Configurado vía Laravel CORS middleware. En producción:
- Orígenes restringidos a dominios específicos
- Métodos permitidos: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Headers: Content-Type, Authorization, X-Requested-With

## Recomendaciones Producción

1. `APP_DEBUG=false`
2. `APP_ENV=production`
3. HTTPS forzado (redirect + HSTS)
4. `SESSION_SECURE_COOKIE=true`
5. `SESSION_DOMAIN=.dominio.com`
6. CORS restringido al origen exacto del frontend
7. Logs: `LOG_CHANNEL=json`, `LOG_LEVEL=error`
8. Auditoría periódica de tokens activos
