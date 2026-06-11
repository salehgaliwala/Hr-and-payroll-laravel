<?php

namespace App\Services;

use App\Models\NotificationLog;
use App\Models\NotificationTemplate;
use App\Models\WhatsappTemplate;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected string $sid;
    protected string $authToken;
    protected string $from;

    public function __construct()
    {
        $this->sid = config('twilio.sid') ?: getSetting('twilio_sid', '');
        $this->authToken = config('twilio.auth_token') ?: getSetting('twilio_auth_token', '');
        $this->from = config('twilio.whatsapp_from') ?: getSetting('twilio_whatsapp_from', '');
    }

    /**
     * Send a WhatsApp message using Twilio's API.
     *
     * @param string $to Recipient phone number (E.164 format)
     * @param string $message Message body text
     * @return array ['success' => bool, 'error' => string|null]
     */
    public function send(string $to, string $message): array
    {
        if (empty($this->sid) || empty($this->authToken) || empty($this->from)) {
            return [
                'success' => false,
                'error' => 'Twilio WhatsApp credentials are not configured.',
            ];
        }

        // Ensure phone numbers are in E.164 format with whatsapp: prefix
        $from = $this->from;
        if (!str_starts_with($from, 'whatsapp:')) {
            $from = 'whatsapp:' . $from;
        }

        $toNumber = $to;
        if (!str_starts_with($toNumber, 'whatsapp:')) {
            $toNumber = 'whatsapp:' . $toNumber;
        }

        try {
            $response = Http::withBasicAuth($this->sid, $this->authToken)
                ->asForm()
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$this->sid}/Messages.json", [
                    'From' => $from,
                    'To' => $toNumber,
                    'Body' => $message,
                ]);

            if ($response->successful()) {
                Log::info('WhatsApp message sent successfully', [
                    'to' => $to,
                    'sid' => $response->json('sid'),
                ]);

                return ['success' => true, 'error' => null];
            }

            $errorMsg = $response->json('message') ?: $response->body();
            Log::error('WhatsApp message sending failed', [
                'to' => $to,
                'error' => $errorMsg,
            ]);

            return ['success' => false, 'error' => $errorMsg];
        } catch (\Exception $e) {
            Log::error('WhatsApp exception', ['to' => $to, 'error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send a WhatsApp message using a Twilio Content API template (pre-approved).
     *
     * @param string $to Recipient phone number
     * @param mixed $template WhatsappTemplate or NotificationTemplate
     * @param array $contentVariables Values for {{1}}, {{2}} placeholders
     * @return array ['success' => bool, 'error' => string|null]
     */
    public function sendWithContentTemplate(string $to, $template, array $contentVariables = []): array
    {
        $status = $template instanceof WhatsappTemplate ? $template->status : $template->approval_status;

        if ($status !== 'approved') {
            return [
                'success' => false,
                'error' => 'Template is not approved. Current status: ' . $status,
            ];
        }

        if (empty($template->twilio_content_sid)) {
            return [
                'success' => false,
                'error' => 'Template has no Twilio Content SID.',
            ];
        }

        if (empty($this->sid) || empty($this->authToken) || empty($this->from)) {
            return [
                'success' => false,
                'error' => 'Twilio WhatsApp credentials are not configured.',
            ];
        }

        $from = $this->from;
        if (!str_starts_with($from, 'whatsapp:')) {
            $from = 'whatsapp:' . $from;
        }

        $toNumber = $to;
        if (!str_starts_with($toNumber, 'whatsapp:')) {
            $toNumber = 'whatsapp:' . $toNumber;
        }

        try {
            $contentVariablesJson = json_encode($contentVariables, JSON_FORCE_OBJECT);

            Log::debug('Sending WhatsApp template message', [
                'to' => $toNumber,
                'from' => $from,
                'content_sid' => $template->twilio_content_sid,
                'content_variables' => $contentVariablesJson,
            ]);

            $params = [
                'From' => $from,
                'To' => $toNumber,
                'ContentSid' => $template->twilio_content_sid,
            ];

            if (!empty($contentVariables)) {
                $params['ContentVariables'] = $contentVariablesJson;
            }

            $response = Http::withBasicAuth($this->sid, $this->authToken)
                ->asForm()
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$this->sid}/Messages.json", $params);

            if ($response->successful()) {
                Log::info('WhatsApp template message sent successfully', [
                    'to' => $to,
                    'template' => $template->friendly_name ?? $template->name,
                    'sid' => $response->json('sid'),
                ]);

                return ['success' => true, 'error' => null];
            }

            $errorMsg = $response->json('message') ?: $response->body();
            Log::error('WhatsApp template message sending failed', [
                'to' => $to,
                'template' => $template->friendly_name ?? $template->name,
                'error' => $errorMsg,
            ]);

            return ['success' => false, 'error' => $errorMsg];
        } catch (\Exception $e) {
            Log::error('WhatsApp template exception', [
                'to' => $to,
                'template' => $template->friendly_name ?? $template->name,
                'error' => $e->getMessage(),
            ]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send a test WhatsApp message.
     */
    public function sendTest(string $to): array
    {
        return $this->send($to, 'This is a test message from your HR System. Your WhatsApp notification settings are working correctly.');
    }
}