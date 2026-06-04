<?php

namespace App\Providers;

use App\Events\UserCreated;
use App\Listeners\SendUserCreatedEmail;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        UserCreated::class => [
            SendUserCreatedEmail::class,
        ],
        \App\Events\CandidateApplied::class => [
            \App\Listeners\SendApplicationConfirmationListener::class,
        ],
        \App\Events\CandidateRejected::class => [
            \App\Listeners\SendRejectionNotificationListener::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}