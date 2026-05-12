<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class RequestContextMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = (string) Str::uuid();
        $request->attributes->set('request_id', $requestId);

        Log::withContext([
            'request_id' => $requestId,
            'method' => $request->method(),
            'endpoint' => $request->path(),
        ]);

        $startTime = microtime(true);

        $response = $next($request);

        $duration = round((microtime(true) - $startTime) * 1000, 2);

        $user = $request->user();
        $statusCode = $response->getStatusCode();

        $context = [
            'request_id' => $requestId,
            'method' => $request->method(),
            'endpoint' => $request->path(),
            'status_code' => $statusCode,
            'duration_ms' => $duration,
            'user_id' => $user?->id,
        ];

        if ($statusCode >= 500) {
            Log::error('Server Error', $context);
        } elseif ($statusCode >= 400 && $statusCode < 500 && !in_array($statusCode, [401, 404])) {
            Log::warning('Client Error', $context);
        }

        if ($duration > 1000) {
            Log::warning('Slow Request', array_merge($context, ['threshold_ms' => 1000]));
        }

        $response->headers->set('X-Request-ID', $requestId);

        return $response;
    }
}
