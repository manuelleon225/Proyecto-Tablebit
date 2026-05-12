# Reglas de Código Laravel

## PHP Style Guide

### Nomenclatura
- Clases: `PascalCase` (ej: `RestauranteController`)
- Métodos: `camelCase` (ej: `obtenerReservas`)
- Variables: `camelCase` (ej: `$restauranteId`)
- Constantes: `SCREAMING_SNAKE_CASE` (ej: `DURACION_DEFAULT`)
- Tablas/Columnas: `snake_case` (ej: `restaurante_id`)

### Espaciado y Formato
```php
// ✓ Correcto
public function store(Request $request): JsonResponse
{
    $validated = $request->validated();

    return response()->json([
        'message' => 'Reserva creada',
        'data' => $reserva,
    ], 201);
}

// ✗ Evitar
public function store(Request $request){
    $validated=$request->validated();
    return response()->json(['message'=>'Reserva creada','data'=>$reserva],201);
}
```

### Type Hints
- Usar type hints en todos los métodos
- Return types obligatorios
- Nullable types con `?`

```php
public function show(int $id): ?Restaurante
{
    return Restaurante::find($id);
}
```

### DocBlocks
```php
/**
 * Obtiene las reservas activas de un restaurante.
 *
 * @param int $restauranteId
 * @param string $fecha Formato Y-m-d
 * @return Collection<Reservas>
 */
public function obtenerReservasActivas(int $restauranteId, string $fecha): Collection
```

## Controllers

### Estructura
```php
class RestauranteController extends Controller
{
    public function __construct(
        private readonly RestauranteService $restauranteService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $restaurantes = $this->restauranteService->obtenerTodos(
            $request->query('ciudad')
        );

        return response()->json(['data' => $restaurantes]);
    }
}
```

### Reglas
- Usar `__construct` para inyectar servicios
- `private readonly` para dependencias inyectadas
- Response wrapper consistente `{'message': '', 'data': ...}`
- HTTP codes: 200, 201, 400, 401, 403, 404, 422, 500

## Models

### Estructura
```php
class Reservas extends Model
{
    use SoftDeletes;

    protected $table = 'reservas';

    protected $fillable = [
        'cliente_id',
        'restaurante_id',
        // ...
    ];

    protected $casts = [
        'fecha' => 'date',
        'hora' => 'datetime:H:i',
        'cantidad_personas' => 'integer',
    ];

    protected $hidden = ['password', 'deleted_at'];

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'cliente_id');
    }

    public function scopeActivas($query)
    {
        return $query->whereIn('estado', ['pendiente', 'confirmada']);
    }
}
```

### Reglas
- Siempre definir `$table` si el nombre no es plural del modelo
- Definir `$casts` para fechas y números
- Usar `$hidden` para datos sensibles
- Implementar scopes para queries reutilizables
- Usar `with()` para relaciones en queries pesadas

## Services

### Estructura
```php
class ReservaService
{
    private const DURACION_DEFAULT = 90;

    public function __construct(
        private readonly Mesa $mesaModel,
        private readonly Reservas $reservaModel
    ) {}

    public function crearReserva(array $datos): Reservas
    {
        return DB::transaction(function () use ($datos) {
            // Lógica con validaciones
            // Retornar modelo creado
        });
    }
}
```

### Reglas
- Lógica de negocio en Services, no en Controllers
- Usar `DB::transaction()` para operaciones múltiples
- Definir constantes para magic numbers
- Validar inputs antes de procesar

## Migraciones

### Nombrado
```
2026_05_06_000001_add_fields_to_restaurantes.php
2026_05_06_000002_create_horario_dias_table.php
```

### Estructura
```php
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horario_dias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurante_id')
                ->constrained('restaurantes')
                ->onDelete('cascade');
            $table->string('nombre');
            $table->timestamps();

            $table->unique(['restaurante_id', 'dia']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horario_dias');
    }
};
```

### Reglas
- Usar timestamps incrementales para múltiples migraciones del mismo día
- Foreign keys con `constrained()` y `onDelete()`
- Índices únicos con `unique()`
- Verificar columnas existentes antes de modificar

## Policies

### Estructura
```php
class ReservaPolicy
{
    public function viewAny(Usuario $user): bool
    {
        return true;
    }

    public function update(Usuario $user, Reservas $reserva): bool
    {
        if (in_array($user->role, ['superadmin'])) return true;

        return $reserva->cliente_id === $user->id
            || $this->esAdminDelRestaurante($user, $reserva);
    }

    private function esAdminDelRestaurante(Usuario $user, Reservas $reserva): bool
    {
        return in_array($user->role, ['admin', 'admin_restaurante'])
            && $reserva->restaurante->user_id === $user->id;
    }
}
```

### Registro
```php
// AppServiceProvider.php
public function boot(): void
{
    Gate::policy(Reserva::class, ReservaPolicy::class);
    Gate::policy(Restaurante::class, RestaurantePolicy::class);
    Gate::policy(Mesa::class, MesaPolicy::class);
}
```

## Routes

### Agrupación
```php
// Auth público
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:10,1');

// Auth protegido
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/reservas', [ReservaController::class, 'store']);
    Route::get('/mis-reservas', [ReservaController::class, 'misReservas']);

    Route::middleware('role:admin,admin_restaurante,superadmin')->group(function () {
        Route::get('/reservas', [ReservaController::class, 'index']);
        Route::delete('/reservas/{id}', [ReservaController::class, 'destroy']);
    });
});
```

## Testing

### Feature Tests
```php
public function test_customer_can_create_reservation(): void
{
    $customer = Usuario::factory()->create(['role' => 'cliente']);
    $restaurante = Restaurante::factory()->create();

    $response = $this->actingAs($customer)
        ->postJson('/api/reservas', [
            'restaurante_id' => $restaurante->id,
            'fecha' => '2026-06-01',
            'hora' => '20:00',
            'cantidad_personas' => 2,
        ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'message',
            'data' => ['id', 'restaurante_id', 'fecha', 'hora'],
        ]);
}
```