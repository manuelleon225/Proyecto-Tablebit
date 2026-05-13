# TableBit — API Reference

**Base URL:** `http://localhost:8000/api` (dev) o `https://api.tudominio.com` (prod)

**Auth:** Bearer token via `Authorization: Bearer {token}` header.

---

## Autenticación

### `POST /api/register`
```json
// Request
{ "name": "string", "email": "string", "password": "string" }
// Response 201
{ "user": {...}, "token": "string" }
```

### `POST /api/login`
```json
// Request
{ "email": "string", "password": "string" }
// Response 200
{ "user": {...}, "token": "string" }
```

### `POST /api/logout`
```json
// Headers: Authorization: Bearer {token}
// Response 200
{ "message": "Logout correcto" }
```

---

## Restaurantes

### `GET /api/restaurantes`
Listado completo (activos). Array plano.

### `GET /api/restaurantes/{id}`
Detalle con mesas, imágenes, horarios, rating.
```json
{ "restaurante": {...}, "rating_promedio": 4.5, "total_resenas": 10, "abierto_ahora": true }
```

### `GET /api/buscar-restaurantes`
Búsqueda con filtros: `?nombre=`, `?ciudad=`, `?tipo_comida=`, `?ordenar=rating|nombre|capacidad`

### `GET /api/restaurantes/{id}/public`
Detalle público con reseñas recientes.

### `GET /api/mis-restaurantes` (auth: admin+)
Restaurantes del usuario autenticado.

---

## Reservas

### `POST /api/disponibilidad`
```json
// Request
{ "restaurante_id": 1, "fecha": "2026-05-15", "hora": "20:00", "personas": 4, "duracion": 90 }
// Response
{ "disponible": true, "mesas": [...], "total_disponibles": 3 }
```

### `POST /api/reserva-automatica` (auth)
```json
// Request
{ "restaurante_id": 1, "fecha": "2026-05-15", "hora": "20:00", "cantidad_personas": 4, "duracion": 90 }
// Response 201
{ "message": "Reserva confirmada automáticamente", "reserva": {...} }
```

### `GET /api/mis-reservas` (auth)
Reservas del usuario. Filtros: `?estado=`, `?futuras=true`

### `PATCH /api/reservas/{id}/cancelar` (auth)
Cancela una reserva propia.

### `GET /api/reservas` (auth: admin+)
Listado paginado de todas las reservas. Filtros: `?restaurante_id=`, `?estado=`, `?fecha=`

---

## Dashboard

### `GET /api/dashboard/restaurante/{id}` (auth: admin+)
Analytics: reservas_hoy, ocupacion, horas_pico, reservas_por_dia/semana, etc.

### `GET /api/calendario/restaurante/{id}` (auth: admin+)
```json
// Params: ?fecha_inicio=2026-05-01&fecha_fin=2026-05-31
{ "eventos": [{ "id": 1, "title": "Cliente", "start": "...", "extendedProps": {...} }] }
```

---

## Mesas

### `GET /api/mesas/restaurante/{id}`
### `POST /api/mesas` (auth: admin+)
### `PUT /api/mesas/{id}` (auth: admin+)
### `DELETE /api/mesas/{id}` (auth: admin+)

---

## Health

### `GET /api/health`
`{"status":"ok","services":{"api":"healthy","database":"healthy","cache":"healthy"}}`

### `GET /api/health/db`
### `GET /api/health/cache`

---

## Códigos HTTP

| Código | Significado |
|--------|------------|
| 200 | OK |
| 201 | Creado |
| 400 | Bad Request |
| 401 | No autenticado |
| 403 | No autorizado (rol) |
| 404 | No encontrado |
| 422 | Error de validación |
| 429 | Rate limit excedido |
| 500 | Error interno |
