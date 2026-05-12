<?php

use Laravel\Pulse\Recorders\SlowJobs;
use Laravel\Pulse\Recorders\SlowOutGoingRequests;
use Laravel\Pulse\Recorders\SlowQueries;
use Laravel\Pulse\Recorders\SlowRequests;

return [

    'enabled' => env('PULSE_ENABLED', false),

    'domain' => env('PULSE_DOMAIN'),

    'path' => env('PULSE_PATH', 'pulse'),

    'dashboard' => [
        'store' => env('PULSE_DASHBOARD_STORE'),
    ],

    'ingest' => [
        'driver' => env('PULSE_INGEST_DRIVER', 'database'),
        'trim' => [
            'keep' => env('PULSE_TRIM_KEEP', 7),
        ],
    ],

    'recorders' => [
        SlowRequests::class => [
            'enabled' => env('PULSE_SLOW_REQUESTS_ENABLED', true),
            'threshold' => env('PULSE_SLOW_REQUESTS_THRESHOLD', 500),
        ],

        SlowQueries::class => [
            'enabled' => env('PULSE_SLOW_QUERIES_ENABLED', true),
            'threshold' => env('PULSE_SLOW_QUERIES_THRESHOLD', 300),
        ],

        SlowJobs::class => [
            'enabled' => env('PULSE_SLOW_JOBS_ENABLED', false),
            'threshold' => env('PULSE_SLOW_JOBS_THRESHOLD', 1000),
        ],

        SlowOutGoingRequests::class => [
            'enabled' => env('PULSE_OUTGOING_REQUESTS_ENABLED', false),
            'threshold' => env('PULSE_OUTGOING_REQUESTS_THRESHOLD', 1000),
        ],
    ],

    'capture' => [
        'exception_context' => env('PULSE_CAPTURE_EXCEPTION_CONTEXT', false),
    ],

];
