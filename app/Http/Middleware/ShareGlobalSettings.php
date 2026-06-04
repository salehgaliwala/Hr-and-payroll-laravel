<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Artisan;

class ShareGlobalSettings
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // Ensure storage link exists
        $this->ensureStorageLink();

        // Skip during installation
        if (!$request->is('install/*') && !$request->is('update/*') && file_exists(storage_path('installed'))) {
            // Share settings with all Inertia responses
            Inertia::share([
                'globalSettings' => function () {
                    $settings = settings();

                    // Strip sensitive keys — never expose credentials to frontend
                    $sensitiveKeys = [
                        'email_password', 'email_username', 'email_host', 'email_port',
                        'email_encryption', 'email_driver', 'email_from_address', 'email_from_name',
                        'twilio_sid', 'twilio_auth_token', 'twilio_whatsapp_from',
                    ];

                    return array_diff_key($settings, array_flip($sensitiveKeys));
                }
            ]);
        }

        return $next($request);
    }

    /**
     * Ensure storage symlink exists
     */
    private function ensureStorageLink()
    {
        if (!File::exists(public_path('storage'))) {
            try {
                Artisan::call('storage:link');
            } catch (\Exception $e) {
                // Silently fail if unable to create link
            }
        }
    }
}