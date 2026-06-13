<?php

namespace Tests\Unit;

use App\Models\Candidate;
use App\Models\Offer;
use App\Observers\OfferObserver;
use App\Services\NotificationService;
use PHPUnit\Framework\TestCase;
use Mockery;

class NotificationTriggersUnitTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_offer_observer_triggers_notification_when_accepted()
    {
        $candidate = Mockery::mock(Candidate::class);

        $offer = Mockery::mock(Offer::class);
        $offer->shouldReceive('wasChanged')->with('status')->andReturn(true);
        $offer->shouldReceive('getAttribute')->with('status')->andReturn('Accepted');
        $offer->shouldReceive('getAttribute')->with('candidate')->andReturn($candidate);

        $notificationService = Mockery::mock(NotificationService::class);
        $notificationService->shouldReceive('sendHiredNotification')->once()->with($candidate);

        $observer = new OfferObserver($notificationService);
        $observer->updated($offer);

        $this->assertTrue(true);
    }

    public function test_offer_observer_does_not_trigger_notification_when_not_accepted()
    {
        $offer = Mockery::mock(Offer::class);
        $offer->shouldReceive('wasChanged')->with('status')->andReturn(true);
        $offer->shouldReceive('getAttribute')->with('status')->andReturn('Negotiating');

        $notificationService = Mockery::mock(NotificationService::class);
        $notificationService->shouldReceive('sendHiredNotification')->never();

        $observer = new OfferObserver($notificationService);
        $observer->updated($offer);

        $this->assertTrue(true);
    }

    public function test_offer_observer_does_not_trigger_notification_when_status_not_changed()
    {
        $offer = Mockery::mock(Offer::class);
        $offer->shouldReceive('wasChanged')->with('status')->andReturn(false);

        $notificationService = Mockery::mock(NotificationService::class);
        $notificationService->shouldReceive('sendHiredNotification')->never();

        $observer = new OfferObserver($notificationService);
        $observer->updated($offer);

        $this->assertTrue(true);
    }
}
