<?php

namespace App\Providers;

use App\Models\Restaurante;
use App\Models\Reservas;
use App\Models\Mesa;
use App\Policies\RestaurantePolicy;
use App\Policies\ReservaPolicy;
use App\Policies\MesaPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Restaurante::class, RestaurantePolicy::class);
        Gate::policy(Reservas::class, ReservaPolicy::class);
        Gate::policy(Mesa::class, MesaPolicy::class);

        RateLimiter::for('global', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('reservas', function (Request $request) {
            return Limit::perMinute(20)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('sensitive', function (Request $request) {
            return Limit::perMinute(5)->by($request->user()?->id ?: $request->ip());
        });
    }
}
