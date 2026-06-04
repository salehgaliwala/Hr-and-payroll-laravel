<?php

namespace App\Listeners;

use App\Events\CandidateRejected;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class SendRejectionNotificationListener implements ShouldQueue
{
    protected NotificationService $notificationService;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        $this->notificationService = new NotificationService();
    }

    /**
     * Handle the event.
     */
    public function handle(CandidateRejected $event): void
    {
        try {
            // Check if rejection notification was already sent
            if ($event->candidate->rejection_notification_sent) {
                Log::info('Rejection notification already sent for candidate', [
                    'candidate_id' => $event->candidate->id,
                ]);
                return;
            }

            $this->notificationService->sendRejectionNotification($event->candidate);
        } catch (\Exception $e) {
            Log::error('Failed to send rejection notification', [
                'candidate_id' => $event->candidate->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}