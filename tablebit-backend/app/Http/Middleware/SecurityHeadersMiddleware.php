<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeadersMiddleware
{
    private array $headers = [];

    public function __construct()
    {
        $isSecure = config('app.env') === 'production';

        $this->headers = [
            'X-Frame-Options' => 'DENY',
            'X-Content-Type-Options' => 'nosniff',
            'Referrer-Policy' => 'strict-origin-when-cross-origin',
            'Permissions-Policy' => 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
            'X-XSS-Protection' => '0',
        ];

        if ($isSecure) {
            $this->headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
        }

        $this->headers['Content-Security-Policy'] = $this->buildCSP($isSecure);
    }

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        foreach ($this->headers as $key => $value) {
            $response->headers->set($key, $value);
        }

        return $response;
    }

    private function buildCSP(bool $isSecure): string
    {
        $connectSrc = $isSecure
            ? "https://api.tu-dominio.com"
            : "http://localhost:8000 http://localhost:5173 http://localhost:3000";

        return implode('; ', [
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https:",
            "connect-src 'self' {$connectSrc}",
            "frame-ancestors 'none'",
            "form-action 'self'",
            "base-uri 'self'",
        ]);
    }
}
