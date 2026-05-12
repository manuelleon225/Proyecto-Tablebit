<?php

namespace App\Providers;

use App\Models\Restaurante;
use App\Models\Reservas;
use App\Models\Mesa;
use App\Policies\RestaurantePolicy;
use App\Policies\ReservaPolicy;
use App\Policies\MesaPolicy;
use Illuminate\Support\Facades\Gate;
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
    }
}
