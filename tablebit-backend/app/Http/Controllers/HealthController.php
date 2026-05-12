<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
            'services' => [
                'api' => 'healthy',
                'database' => $this->checkDatabase(),
                'cache' => $this->checkCache(),
            ],
        ]);
    }

    public function db(): JsonResponse
    {
        $dbStatus = $this->checkDatabase();

        if ($dbStatus !== 'healthy') {
            return response()->json([
                'status' => 'degraded',
                'timestamp' => now()->toIso8601String(),
                'service' => 'database',
                'error' => $dbStatus,
            ], 503);
        }

        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
            'service' => 'database',
            'connection' => config('database.default'),
        ]);
    }

    public function cache(): JsonResponse
    {
        $cacheStatus = $this->checkCache();

        if ($cacheStatus !== 'healthy') {
            return response()->json([
                'status' => 'degraded',
                'timestamp' => now()->toIso8601String(),
                'service' => 'cache',
                'error' => $cacheStatus,
            ], 503);
        }

        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
            'service' => 'cache',
            'driver' => config('cache.default'),
        ]);
    }

    private function checkDatabase(): string
    {
        try {
            DB::connection()->getPdo();
            return 'healthy';
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    private function checkCache(): string
    {
        try {
            Cache::store()->set('health_check', true, 1);
            Cache::store()->forget('health_check');
            return 'healthy';
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }
}
