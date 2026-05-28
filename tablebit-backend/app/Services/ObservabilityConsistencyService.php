<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Alert;

class ObservabilityConsistencyService
{
    public function __construct(
        private readonly ObservabilityService $observability,
    ) {}

    public function check(): array
    {
        $issues = [];

        // Check SSE lag
        $lastLog = AuditLog::orderBy('created_at', 'desc')->first();
        if ($lastLog && $lastLog->created_at->diffInSeconds(now()) > 5) {
            $issues[] = 'SSE lag detected: last audit log > 5s ago';
        }

        // Check alert orphans (resolved but still active in cache)
        $orphanAlerts = Alert::where('status', 'active')
            ->where('created_at', '<', now()->subHours(24))
            ->count();
        if ($orphanAlerts > 0) {
            $issues[] = "{$orphanAlerts} alerts active >24h — possible orphans";
            Alert::where('status', 'active')
                ->where('created_at', '<', now()->subHours(24))
                ->update(['status' => 'resolved', 'resolved_at' => now()]);
        }

        return [
            'issues' => $issues,
            'healthy' => empty($issues),
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
