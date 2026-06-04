<?php

namespace App\Services;

use App\Mail\TestMail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailNotificationService
{
    /**
     * Send an email with dynamic configuration.
     *
     * @param string $to Recipient email address
     * @param string $subject Email subject
     * @param string $body Email body (HTML)
     * @return array ['success' => bool, 'error' => string|null]
     */
    public function send(string $to, string $subject, string $body): array
    {
        try {
            // Configure mail settings from database for this request
            $this->applyMailConfig();

            Mail::html($body, function ($message) use ($to, $subject) {
                $message->to($to)
                    ->subject($subject)
                    ->from(
                        getSetting('email_from_address', config('mail.from.address')),
                        getSetting('email_from_name', config('mail.from.name'))
                    );
            });

            Log::info('Email sent successfully', ['to' => $to, 'subject' => $subject]);
            return ['success' => true, 'error' => null];
        } catch (\Exception $e) {
            Log::error('Email sending failed', [
                'to' => $to,
                'subject' => $subject,
                'error' => $e->getMessage(),
            ]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send a test email.
     */
    public function sendTest(string $to): array
    {
        try {
            $this->applyMailConfig();

            Mail::to($to)->send(new TestMail());

            return ['success' => true, 'error' => null];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Apply mail configuration from settings for a single mail request.
     */
    protected function applyMailConfig(): void
    {
        config([
            'mail.default' => getSetting('email_driver', 'smtp'),
            'mail.mailers.smtp.host' => getSetting('email_host', 'smtp.example.com'),
            'mail.mailers.smtp.port' => getSetting('email_port', '587'),
            'mail.mailers.smtp.encryption' => getSetting('email_encryption', 'tls') === 'none' ? null : getSetting('email_encryption', 'tls'),
            'mail.mailers.smtp.username' => getSetting('email_username', 'user@example.com'),
            'mail.mailers.smtp.password' => getSetting('email_password', ''),
            'mail.from.address' => getSetting('email_from_address', config('mail.from.address')),
            'mail.from.name' => getSetting('email_from_name', config('mail.from.name')),
        ]);
    }
}