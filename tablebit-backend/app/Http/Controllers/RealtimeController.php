<?php

namespace App\Http\Controllers;

use App\Services\RealtimeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RealtimeController extends Controller
{
    public function __construct(
        private readonly RealtimeService $realtime,
    ) {}

    public function poll(Request $request): JsonResponse
    {
        $channel = $request->input('channel', 'tablebit.realtime');
        $since = $request->input('since');

        $this->realtime->trackUserPresence($request->user()->id);

        return response()->json([
            'events' => $this->realtime->pollEvents($channel, $since),
            'timestamp' => now()->toIso8601String(),
            'active_users' => $this->realtime->getActiveUsers(),
        ]);
    }
}
