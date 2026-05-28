<?php
namespace App\Services;
use App\Models\Alert;
use App\Models\AuditLog;

class AlertService {
    private const COOLDOWN_MINUTES = 5;

    public function evaluateSystemHealth(): array {
        $alerts = [];
        $now = now();

        $recentAuthFails = AuditLog::where('action', 'auth_failure')
            ->where('created_at', '>=', $now->copy()->subMinute())->count();
        if ($recentAuthFails > 10) {
            $alerts[] = $this->triggerAlert('critical', 'auth', "{$recentAuthFails} auth failures in 1 min");
        } elseif ($recentAuthFails === 0) {
            $this->autoResolve('auth', 'critical');
        }

        $recentImageFails = AuditLog::where('action', 'image_upload')
            ->where('created_at', '>=', $now->copy()->subMinutes(5))->count();
        if ($recentImageFails > 5) {
            $alerts[] = $this->triggerAlert('warning', 'images', "High image upload failure rate");
        } elseif ($recentImageFails === 0) {
            $this->autoResolve('images', 'warning');
        }

        return $alerts;
    }

    public function triggerAlert(string $type, string $source, string $message, ?array $metadata = null): Alert {
        $existing = Alert::where('type', $type)->where('source', $source)
            ->where('status', 'active')
            ->where('created_at', '>=', now()->subMinutes(self::COOLDOWN_MINUTES))
            ->first();
        if ($existing) return $existing;

        return Alert::create(compact('type', 'source', 'message', 'metadata'));
    }

    public function resolveAlert(int $id): void {
        Alert::where('id', $id)->update(['status' => 'resolved', 'resolved_at' => now()]);
    }

    public function autoResolve(string $source, string $type): void {
        Alert::where('source', $source)->where('type', $type)
            ->where('status', 'active')
            ->update(['status' => 'resolved', 'resolved_at' => now()]);
    }

    public function getActiveAlerts() {
        return Alert::where('status', 'active')->orderBy('created_at', 'desc')->get();
    }

    public function getAllAlerts() {
        return Alert::orderBy('created_at', 'desc')->paginate(50);
    }
}
