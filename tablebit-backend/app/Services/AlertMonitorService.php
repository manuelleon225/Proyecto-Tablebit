<?php
namespace App\Services;

class AlertMonitorService {
    public function __construct(
        private readonly AlertService $alertService,
        private readonly SystemLogger $logger,
    ) {}

    public function run(): void {
        try {
            $alerts = $this->alertService->evaluateSystemHealth();
            if (!empty($alerts)) {
                $this->logger->info('AlertMonitor', ['alerts_created' => count($alerts)]);
            }
        } catch (\Exception $e) {
            $this->logger->error('AlertMonitor failed: ' . $e->getMessage());
        }
    }
}
