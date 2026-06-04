<?php

namespace App\Listeners;

use App\Events\CandidateApplied;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class SendApplicationConfirmationListener implements ShouldQueue
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
    public function handle(CandidateApplied $event): void
    {
        try {
            $this->notificationService->sendApplicationConfirmation($event->candidate);
        } catch (\Exception $e) {
            Log::error('Failed to send application confirmation', [
                'candidate_id' => $event->candidate->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}