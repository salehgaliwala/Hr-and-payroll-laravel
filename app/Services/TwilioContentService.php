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
        $this->sid = config('twilio.sid') ?: getSetting('twilio_sid', '');
        $this->authToken = config('twilio.auth_token') ?: getSetting('twilio_auth_token', '');
        $this->webhookUrl = config('twilio.webhook_url') ?: getSetting('twilio_webhook_url', '');
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

        // 1. Get raw body and strip HTML tags (for WYSIWYG support)
        $rawBody = $template->body_text ?? $template->body;
        $cleanBody = strip_tags(str_replace(['<br>', '<br/>', '<br />', '</p>'], "\n", $rawBody));

        // 2. Identify all placeholders and map them to numbered indices for Twilio
        $placeholders = $template->getPlaceholders();
        $twilioBody = $cleanBody;
        $samples = [];

        foreach ($placeholders as $index => $name) {
            $twilioIndex = $index + 1;
            $twilioBody = str_replace('{{' . $name . '}}', '{{' . $twilioIndex . '}}', $twilioBody);
            $samples[] = $placeholderSamples[$index] ?? (isset($placeholderSamples[$name]) ? $placeholderSamples[$name] : "Sample {$name}");
        }

        $friendlyName = $template->friendly_name ?? $template->name;

        $payload = [
            'friendly_name' => $friendlyName,
            'language' => $template->language,
            'types' => [
                'twilio/text' => [
                    'body' => $twilioBody,
                ],
            ],
        ];

        try {
            Log::debug('Twilio Content API: Submitting template', [
                'friendly_name' => $friendlyName,
                'language' => $template->language,
                'category' => $template->category ?? 'not_set',
                'payload_body_preview' => mb_substr($twilioBody, 0, 200),
            ]);

            $response = Http::withBasicAuth($this->sid, $this->authToken)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post("{$this->baseUrl}/Content", $payload);

            if ($response->successful()) {
                $responseData = $response->json();
                $contentSid = $responseData['sid'] ?? null;

                Log::info('Twilio Content API: Template submitted successfully', [
                    'friendly_name' => $friendlyName,
                    'content_sid' => $contentSid,
                    'full_response' => $responseData,
                ]);

                // Wait a moment for Twilio to process the creation before approval request
                usleep(500000); // 0.5 seconds

                $approvalResult = $this->submitForApproval($contentSid, $template, $placeholderSamples);

                if (!$approvalResult['success']) {
                    return [
                        'success' => false,
                        'content_sid' => $contentSid,
                        'error' => "Content created ({$contentSid}) but approval submission failed: " . $approvalResult['error'],
                    ];
                }

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
     * Submit an existing Content resource for WhatsApp approval.
     *
     * @param string $contentSid
     * @param mixed $template
     * @param array $placeholderSamples
     * @return array
     */
    public function submitForApproval(string $contentSid, $template, array $placeholderSamples = []): array
    {
        if (empty($this->sid) || empty($this->authToken)) {
            return ['success' => false, 'error' => 'Twilio credentials not configured.'];
        }

        // Prepare sample data mapping
        $placeholders = $template->getPlaceholders();
        $samples = [];
        foreach ($placeholders as $index => $name) {
            $samples[] = $placeholderSamples[$index] ?? (isset($placeholderSamples[$name]) ? $placeholderSamples[$name] : "Sample {$name}");
        }

        $friendlyName = $template->friendly_name ?? $template->name;

        $payload = [
            'name' => $friendlyName,
            'category' => $template->category,
        ];

        if (!empty($samples)) {
            $payload['components'] = [
                [
                    'type' => 'BODY',
                    'example' => [
                        'body_text' => [$samples],
                    ],
                ],
            ];
        }

        try {
            Log::debug('Twilio Content API: Submitting for approval', [
                'content_sid' => $contentSid,
                'category' => $template->category,
                'name' => $friendlyName,
                'sample_count' => count($samples),
            ]);

            $response = Http::withBasicAuth($this->sid, $this->authToken)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post("{$this->baseUrl}/Content/{$contentSid}/ApprovalRequests/whatsapp", $payload);

            if ($response->successful()) {
                $responseData = $response->json();
                Log::info('Twilio Content API: Approval requested successfully', [
                    'content_sid' => $contentSid,
                    'full_response' => $responseData,
                ]);
                return ['success' => true];
            }

            $errorBody = $response->body();
            Log::error('Twilio Content API: Approval request failed', [
                'content_sid' => $contentSid,
                'status' => $response->status(),
                'response' => $errorBody,
            ]);

            return [
                'success' => false,
                'error' => "Twilio Approval Error ({$response->status()}): {$errorBody}",
            ];
        } catch (\Exception $e) {
            Log::error('Twilio Content API: Exception during approval submission', [
                'content_sid' => $contentSid,
                'error' => $e->getMessage(),
            ]);
            return ['success' => false, 'error' => $e->getMessage()];
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
     * Fetch the current approval status of a template from Twilio.
     *
     * @param string $contentSid
     * @return array ['success' => bool, 'status' => string|null, 'rejection_reason' => string|null, 'error' => string|null]
     */
    public function fetchTemplateStatus(string $contentSid): array
    {
        if (empty($this->sid) || empty($this->authToken)) {
            return ['success' => false, 'error' => 'Twilio credentials not configured.'];
        }

        try {
            $response = Http::withBasicAuth($this->sid, $this->authToken)
                ->get("{$this->baseUrl}/Content/{$contentSid}/ApprovalRequests");

            if ($response->successful()) {
                $data = $response->json();
                // Twilio returns a list of approval requests. We're interested in 'whatsapp'.
                $whatsappApproval = collect($data['approval_requests'] ?? [])
                    ->where('name', 'whatsapp')
                    ->first();

                if ($whatsappApproval) {
                    return [
                        'success' => true,
                        'status' => $whatsappApproval['status'] ?? 'pending',
                        'rejection_reason' => $whatsappApproval['rejection_reason'] ?? null,
                    ];
                }

                return ['success' => false, 'error' => 'WhatsApp approval request not found for this content.'];
            }

            return ['success' => false, 'error' => "Twilio error: " . $response->body()];
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