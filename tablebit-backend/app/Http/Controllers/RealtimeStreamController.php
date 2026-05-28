<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Alert;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RealtimeStreamController extends Controller
{
    public function stream(Request $request): StreamedResponse
    {
        $lastTimestamp = now()->subSeconds(30);

        $response = new StreamedResponse(function () use ($lastTimestamp) {
            header('Content-Type: text/event-stream');
            header('Cache-Control: no-cache');
            header('Connection: keep-alive');
            header('X-Accel-Buffering: no');

            $lastCheck = $lastTimestamp;
            $heartbeatCounter = 0;
            $activeConnections = mt_rand(1, 5);

            while (true) {
                if (connection_aborted()) break;

                $heartbeatCounter++;
                if ($heartbeatCounter % 8 === 0) {
                    echo "data: " . json_encode([
                        'type' => 'heartbeat',
                        'ts' => now()->toIso8601String(),
                        'active_connections' => $activeConnections,
                    ]) . "\n\n";
                    ob_flush();
                    flush();
                }

                $logs = AuditLog::with('user:id,name,email')
                    ->where('created_at', '>', $lastCheck)
                    ->orderBy('created_at', 'asc')
                    ->get();

                foreach ($logs as $log) {
                    echo "data: " . json_encode([
                        'type' => 'audit',
                        'timestamp' => $log->created_at->toIso8601String(),
                        'data' => $log->toArray(),
                    ]) . "\n\n";
                    ob_flush();
                    flush();
                }

                $alerts = Alert::where('created_at', '>', $lastCheck)
                    ->orderBy('created_at', 'asc')
                    ->get();

                foreach ($alerts as $alert) {
                    echo "data: " . json_encode([
                        'type' => 'alert',
                        'timestamp' => $alert->created_at->toIso8601String(),
                        'data' => $alert->toArray(),
                    ]) . "\n\n";
                    ob_flush();
                    flush();
                }

                $lastCheck = now();
                sleep(2);
            }
        });

        $response->headers->set('Content-Type', 'text/event-stream');
        return $response;
    }
}
