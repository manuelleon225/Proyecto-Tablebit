<?php

namespace App\Providers;

use App\Models\Restaurante;
use App\Models\Reservas;
use App\Models\Mesa;
use App\Policies\RestaurantePolicy;
use App\Policies\ReservaPolicy;
use App\Policies\MesaPolicy;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    protected $policies = [
        Restaurante::class => RestaurantePolicy::class,
        Reservas::class => ReservaPolicy::class,
        Mesa::class => MesaPolicy::class,
    ];

    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        //
    }
}
