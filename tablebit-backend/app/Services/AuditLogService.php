<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogService
{
    public function log(
        string $action,
        ?string $entityType = null,
        ?int $entityId = null,
        ?array $metadata = null,
        ?int $userId = null,
        ?string $ipAddress = null
    ): void {
        AuditLog::create([
            'user_id' => $userId,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'metadata' => $metadata,
            'ip_address' => $ipAddress ?? request()->ip(),
        ]);
    }

    public function logFromRequest(
        Request $request,
        string $action,
        ?string $entityType = null,
        ?int $entityId = null,
        ?array $metadata = null
    ): void {
        $this->log(
            $action,
            $entityType,
            $entityId,
            $metadata,
            $request->user()?->id,
            $request->ip()
        );
    }
}
