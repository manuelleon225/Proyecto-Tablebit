<?php
namespace App\Services;
use App\Models\AuditLog;
use App\Models\Alert;
use App\Models\SystemMetric;
use Illuminate\Support\Facades\DB;

class AnalyticsService {
    public function getSummary(): array {
        $today = now()->startOfDay();
        $totalLogs = AuditLog::where('created_at', '>=', $today)->count();
        $imageUploads = AuditLog::where('action', 'image_upload')->where('created_at', '>=', $today)->count();
        $imageDeletes = AuditLog::where('action', 'image_delete')->where('created_at', '>=', $today)->count();
        $activeAlerts = Alert::where('status', 'active')->count();
        $errorLogs = AuditLog::where('created_at', '>=', $today)->where('action', 'like', '%error%')->count();

        return [
            'total_logs_today' => $totalLogs,
            'image_uploads_today' => $imageUploads,
            'image_deletes_today' => $imageDeletes,
            'active_alerts' => $activeAlerts,
            'error_count' => $errorLogs,
        ];
    }

    public function getRange(string $from, string $to): array {
        return [
            'logs_by_action' => AuditLog::whereBetween('created_at', [$from, $to])
                ->select('action', DB::raw('count(*) as total'))
                ->groupBy('action')->orderByDesc('total')->get(),
            'alerts_by_type' => Alert::whereBetween('created_at', [$from, $to])
                ->select('type', DB::raw('count(*) as total'))
                ->groupBy('type')->orderByDesc('total')->get(),
            'logs_by_day' => AuditLog::whereBetween('created_at', [$from, $to])
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as total'))
                ->groupBy('date')->orderBy('date')->get(),
        ];
    }

    public function healthScore(): array {
        $activeCritical = Alert::where('status', 'active')->where('type', 'critical')->count();
        $activeWarning = Alert::where('status', 'active')->where('type', 'warning')->count();
        $totalToday = AuditLog::where('created_at', '>=', now()->startOfDay())->count();
        $errorsToday = AuditLog::where('created_at', '>=', now()->startOfDay())
            ->where('action', 'like', '%error%')->count();
        $errorRate = $totalToday > 0 ? ($errorsToday / $totalToday) * 100 : 0;

        $score = 100;
        $score -= $activeCritical * 20;
        $score -= $activeWarning * 5;
        if ($errorRate > 10) $score -= 15;
        elseif ($errorRate > 5) $score -= 5;

        return [
            'score' => max(0, min(100, $score)),
            'active_critical' => $activeCritical,
            'active_warning' => $activeWarning,
            'error_rate' => round($errorRate, 1),
            'status' => $score >= 80 ? 'healthy' : ($score >= 50 ? 'degraded' : 'critical'),
        ];
    }
}
