<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Imagen;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function alerts(): JsonResponse
    {
        $service = app(\App\Services\AlertService::class);
        return response()->json($service->getActiveAlerts());
    }

    public function resolveAlert(int $id): JsonResponse
    {
        $service = app(\App\Services\AlertService::class);
        $service->resolveAlert($id);
        return response()->json(['message' => 'Alerta resuelta']);
    }


    public function auditLogs(Request $request): JsonResponse
    {
        $query = AuditLog::with('user:id,name,email');

        if ($request->filled('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $query->orderBy('created_at', 'desc');

        $perPage = min((int) $request->input('per_page', 25), 100);
        $logs = $query->paginate($perPage);

        return response()->json($logs);
    }

    public function analyticsSummary(): JsonResponse
    {
        return response()->json(app(\App\Services\AnalyticsService::class)->getSummary());
    }

    public function analyticsRange(Request $request): JsonResponse
    {
        $request->validate(['from' => 'required|date', 'to' => 'required|date|after_or_equal:from']);
        return response()->json(app(\App\Services\AnalyticsService::class)->getRange($request->from, $request->to));
    }

    public function systemHealthScore(): JsonResponse
    {
        return response()->json(app(\App\Services\AnalyticsService::class)->healthScore());
    }

    public function systemHealth(): JsonResponse
    {
        $last24h = now()->subDay();

        $totalLogs = AuditLog::where('created_at', '>=', $last24h)->count();
        $imageUploads = AuditLog::where('action', 'image_upload')->where('created_at', '>=', $last24h)->count();
        $imageDeletes = AuditLog::where('action', 'image_delete')->where('created_at', '>=', $last24h)->count();
        $imageReorders = AuditLog::where('action', 'image_reorder')->where('created_at', '>=', $last24h)->count();

        $totalImages = Imagen::count();
        $totalImageSize = Imagen::sum('tamanio_kb');

        return response()->json([
            'period_hours' => 24,
            'total_logs' => $totalLogs,
            'image_uploads' => $imageUploads,
            'image_deletes' => $imageDeletes,
            'image_reorders' => $imageReorders,
            'total_images' => $totalImages,
            'total_image_size_kb' => round($totalImageSize, 0),
        ]);
    }

    public function observabilitySnapshot(): JsonResponse
    {
        return response()->json(app(\App\Services\ObservabilityService::class)->getDashboardSnapshot());
    }
}
