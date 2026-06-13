<?php

namespace App\Observers;

use App\Models\Offer;
use App\Services\NotificationService;

class OfferObserver
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService = null)
    {
        $this->notificationService = $notificationService ?? new NotificationService();
    }

    /**
     * Handle the Offer "updated" event.
     */
    public function updated(Offer $offer): void
    {
        // Requirement 2: Trigger notification only if status changes to 'Accepted'
        if ($offer->wasChanged('status') && $offer->status === 'Accepted') {
            $candidate = $offer->candidate;
            if ($candidate) {
                $this->notificationService->sendHiredNotification($candidate);
            }
        }
    }
}
