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
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Symfony\Component\Mailer\Bridge\Mailtrap\Transport\MailtrapTransportFactory;
use Symfony\Component\Mailer\Transport\Dsn;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Mail::extend('mailtrap', function (array $config) {
            $dsnString = env('MAILTRAP_DSN', 'mailtrap+api://default');
            return (new MailtrapTransportFactory())->create(Dsn::fromString($dsnString));
        });

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
