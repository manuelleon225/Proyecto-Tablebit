<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Alert;
use Illuminate\Support\Facades\Cache;

class ObservabilityService
{
    private const CACHE_KEY = 'observability_snapshot:v2';
    private const CACHE_TTL = 10;
    private const METRICS_CACHE_KEY = 'observability_metrics_hash';

    public function __construct(
        private readonly AnalyticsService $analytics,
        private readonly AlertService $alerts,
    ) {}

    public function getDashboardSnapshot(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            $healthScore = $this->analytics->healthScore();
            $summary = $this->analytics->getSummary();
            $activeAlerts = $this->alerts->getActiveAlerts();
            $recentLogs = AuditLog::with('user:id,name,email')
                ->orderBy('created_at', 'desc')
                ->limit(20)
                ->get();

            return [
                'health_score' => $healthScore,
                'summary' => $summary,
                'active_alerts' => $activeAlerts,
                'recent_logs' => $recentLogs,
                'last_events' => $this->getRecentEvents(20),
                'cached_at' => now()->toIso8601String(),
            ];
        });
    }

    public function invalidateSnapshot(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    public function getRecentEvents(int $limit = 50): array
    {
        $logs = AuditLog::orderBy('created_at', 'desc')->limit($limit)->get()->map(function ($log) {
            return [
                'type' => 'audit',
                'timestamp' => $log->created_at->toIso8601String(),
                'message' => $log->action,
                'source' => 'audit_logs',
                'data' => ['id' => $log->id, 'action' => $log->action, 'entity_type' => $log->entity_type],
            ];
        });

        $alerts = Alert::where('status', 'active')->orderBy('created_at', 'desc')->limit($limit)->get()->map(function ($alert) {
            return [
                'type' => 'alert',
                'timestamp' => $alert->created_at->toIso8601String(),
                'message' => $alert->message,
                'source' => 'alerts',
                'data' => ['id' => $alert->id, 'type' => $alert->type, 'source' => $alert->source],
            ];
        });

        return $logs->concat($alerts)->sortByDesc('timestamp')->values()->take($limit)->toArray();
    }

    public function getCacheMetrics(): array
    {
        return [
            'cache_key' => self::CACHE_KEY,
            'cache_ttl' => self::CACHE_TTL,
            'has_cached_snapshot' => Cache::has(self::CACHE_KEY),
        ];
    }
}
