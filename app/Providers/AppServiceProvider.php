<?php

namespace App\Providers;

use App\Models\User;
use App\Models\Plan;
use App\Observers\UserObserver;
use App\Observers\PlanObserver;
use App\Providers\AssetServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\App\Services\WebhookService::class);
        
        // Register our AssetServiceProvider
        $this->app->register(AssetServiceProvider::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Fix for MySQL key length issue with older MySQL versions
        Schema::defaultStringLength(191);

        // Register the UserObserver
        User::observe(UserObserver::class);
        
        // Register the PlanObserver
        Plan::observe(PlanObserver::class);

        // Configure dynamic storage disks
        try {
            // \App\Services\DynamicStorageService::configureDynamicDisks();
        } catch (\Exception $e) {
            // Silently fail during migrations or when database is not ready
        }
    }
}