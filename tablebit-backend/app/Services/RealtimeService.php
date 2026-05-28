<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RealtimeService
{
    private const PREFIX = 'realtime:';
    private const TTL = 120;

    public function trackUserPresence(int $userId): void
    {
        Cache::put(self::PREFIX . "presence:{$userId}", true, now()->addSeconds(self::TTL));
        Cache::put(self::PREFIX . "last_seen:{$userId}", now()->toIso8601String(), now()->addDay());
    }

    public function getActiveUsers(): int
    {
        $keys = Cache::get(self::PREFIX . 'active_keys') ?? [];
        return count($keys);
    }

    public function getLastSeen(int $userId): ?string
    {
        return Cache::get(self::PREFIX . "last_seen:{$userId}");
    }

    public function isUserOnline(int $userId): bool
    {
        return Cache::has(self::PREFIX . "presence:{$userId}");
    }

    public function publishEvent(string $channel, string $type, array $payload = []): void
    {
        $event = [
            'type' => $type,
            'channel' => $channel,
            'payload' => $payload,
            'timestamp' => now()->toIso8601String(),
        ];

        $queue = Cache::get(self::PREFIX . "events:{$channel}", []);
        array_push($queue, $event);
        if (count($queue) > 100) array_shift($queue);
        Cache::put(self::PREFIX . "events:{$channel}", $queue, now()->addMinutes(5));

        Log::debug("[Realtime] {$type} on {$channel}", $payload);
    }

    public function pollEvents(string $channel, ?string $since = null): array
    {
        $events = Cache::get(self::PREFIX . "events:{$channel}", []);
        if ($since) {
            $events = array_filter($events, function ($e) use ($since) {
                return $e['timestamp'] > $since;
            });
        }
        return array_values($events);
    }
}
