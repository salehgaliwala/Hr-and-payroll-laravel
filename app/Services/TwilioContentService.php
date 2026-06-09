<?php

namespace App\Services;

use App\Models\WhatsappTemplate;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TwilioContentService
{
    protected string $baseUrl;
    protected string $sid;
    protected string $authToken;
    protected string $webhookUrl;

    public function __construct()
    {
        $this->baseUrl = config('twilio.content_api_base', 'https://content.twilio.com/v1');
        $this->sid = config('twilio.sid');
        $this->authToken = config('twilio.auth_token');
        $this->webhookUrl = config('twilio.webhook_url');
    }

    /**
     * Submit a WhatsApp template to Twilio Content API for Meta approval.
     *
     * @param mixed $template WhatsappTemplate or NotificationTemplate
     * @param array $placeholderSamples Sample values for {{1}}, {{2}}, etc.
     * @return array ['success' => bool, 'content_sid' => string|null, 'error' => string|null]
     */
    public function submitTemplateToTwilio($template, array $placeholderSamples = []): array
    {
        if (empty($this->sid) || empty($this->authToken)) {
            return [
                'success' => false,
                'content_sid' => null,
                'error' => 'Twilio credentials are not configured.',
            ];
        }

        // Prepare sample data: use provided samples or generate defaults
        $placeholders = $template->getPlaceholders();
        $samples = [];
        foreach ($placeholders as $placeholder) {
            $index = (int) $placeholder - 1;
            $samples[] = $placeholderSamples[$index] ?? "Sample {$placeholder}";
        }

        $friendlyName = $template->friendly_name ?? $template->name;
        $bodyText = $template->body_text ?? $template->body;

        $payload = [
            'friendly_name' => $friendlyName,
            'language' => $template->language,
            'types' => [
                'twilio/text' => [
                    'body' => $bodyText,
                ],
            ],
        ];

        // Add approval request with sample data
        if (!empty($samples)) {
            $payload['approval_requests'] = [
                [
                    'name' => $friendlyName,
                    'category' => $template->category,
                    'components' => [
                        [
                            'type' => 'BODY',
                            'text' => $bodyText,
                            'example' => [
                                'body_text' => [$samples],
                            ],
                        ],
                    ],
                ],
            ];
        }

        try {
            $response = Http::withBasicAuth($this->sid, $this->authToken)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post("{$this->baseUrl}/Content", $payload);

            if ($response->successful()) {
                $responseData = $response->json();
                $contentSid = $responseData['sid'] ?? null;

                Log::info('Twilio Content API: Template submitted successfully', [
                    'friendly_name' => $friendlyName,
                    'content_sid' => $contentSid,
                ]);

                return [
                    'success' => true,
                    'content_sid' => $contentSid,
                    'error' => null,
                ];
            }

            $errorBody = $response->body();
            Log::error('Twilio Content API: Submission failed', [
                'friendly_name' => $friendlyName,
                'status' => $response->status(),
                'response' => $errorBody,
            ]);

            return [
                'success' => false,
                'content_sid' => null,
                'error' => "Twilio API error ({$response->status()}): {$errorBody}",
            ];
        } catch (\Exception $e) {
            Log::error('Twilio Content API: Exception during submission', [
                'friendly_name' => $friendlyName,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'content_sid' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Update the webhook URL for receiving template approval status callbacks.
     */
    public function updateWebhookUrl(string $webhookUrl): array
    {
        try {
            $response = Http::withBasicAuth($this->sid, $this->authToken)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post("{$this->baseUrl}/Content/Webhook", [
                    'webhook_url' => $webhookUrl,
                ]);

            if ($response->successful()) {
                return ['success' => true, 'error' => null];
            }

            return [
                'success' => false,
                'error' => "Failed to update webhook: {$response->body()}",
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Handle webhook callback from Twilio Content API.
     */
    public function handleWebhook(array $payload): array
    {
        $contentSid = $payload['content_sid'] ?? $payload['sid'] ?? null;
        $approvalStatus = $payload['approval_status'] ?? $payload['status'] ?? null;

        if (!$contentSid || !$approvalStatus) {
            return ['success' => false, 'error' => 'Invalid webhook payload.'];
        }

        $statusMap = [
            'approved' => 'approved',
            'rejected' => 'rejected',
            'pending' => 'pending',
            'submitted' => 'pending',
        ];

        $newStatus = $statusMap[$approvalStatus] ?? 'pending';

        $template = \App\Models\WhatsappTemplate::where('twilio_content_sid', $contentSid)->first();
        if ($template) {
            $updateData = ['status' => $newStatus];
            if ($newStatus === 'rejected' && !empty($payload['rejection_reason'])) {
                $updateData['rejection_reason'] = $payload['rejection_reason'];
            }
            $template->update($updateData);
        } else {
            $template = \App\Models\NotificationTemplate::where('twilio_content_sid', $contentSid)->first();
            if ($template) {
                $updateData = ['approval_status' => $newStatus];
                if ($newStatus === 'rejected' && !empty($payload['rejection_reason'])) {
                    $updateData['rejection_reason'] = $payload['rejection_reason'];
                }
                // If approved, we might NOT automatically enable it, but the requirement said
                // "remain disabled and uneditable until a successful approval callback/response is received"
                // It doesn't explicitly say to enable it, but typically approved templates are ready to use.
                // I'll leave is_active as it was or maybe set it if appropriate.
                // For now, just update approval_status.
                $template->update($updateData);
            }
        }

        if (!$template) {
            Log::warning('Twilio webhook: Template not found', ['content_sid' => $contentSid]);
            return ['success' => false, 'error' => 'Template not found.'];
        }

        Log::info('Twilio webhook: Template status updated', [
            'content_sid' => $contentSid,
            'status' => $newStatus,
            'model' => get_class($template),
        ]);

        return ['success' => true, 'error' => null];
    }
}