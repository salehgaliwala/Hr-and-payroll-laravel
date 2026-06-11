<?php

namespace App\Services;

use App\Models\Candidate;
use App\Models\NotificationLog;
use App\Models\NotificationTemplate;
use Illuminate\Support\Facades\Auth;

class NotificationService
{
    protected EmailNotificationService $emailService;
    protected WhatsAppService $whatsAppService;

    public function __construct()
    {
        $this->emailService = new EmailNotificationService();
        $this->whatsAppService = new WhatsAppService();
    }

    /**
     * Build shared data payload for a candidate.
     */
    protected function buildCandidateData(Candidate $candidate): array
    {
        $offer = $candidate->job ? \App\Models\Offer::where('candidate_id', $candidate->id)
            ->where('job_id', $candidate->job_id)
            ->orderBy('created_at', 'desc')
            ->first() : null;

        $interview = $candidate->interviews()->orderBy('scheduled_date', 'desc')->orderBy('scheduled_time', 'desc')->first();

        return [
            'candidate_name' => $candidate->full_name,
            'first_name' => $candidate->first_name,
            'job_title' => $candidate->job?->title ?? 'N/A',
            'Job_title' => $candidate->job?->title ?? 'N/A',
            'application_date' => $candidate->application_date?->format('Y-m-d') ?? now()->format('Y-m-d'),
            'company_name' => getSetting('titleText', 'Company'),
            'candidate_email' => $candidate->email,
            'candidate_phone' => $candidate->phone ?? 'N/A',
            'department' => $candidate->department?->name ?? ($offer?->department?->name ?? 'N/A'),

            // Offer related
            'start_date' => $offer?->start_date?->format('Y-m-d') ?? 'N/A',
            'manager_name' => $offer?->manager?->name ?? 'N/A',
            'salary' => $offer?->salary ?? 'N/A',
            'bonus' => $offer?->bonus ?? 'N/A',
            'benefits' => $offer?->benefits ?? 'N/A',
            'probation_period' => $offer?->probation_period ?? 'N/A',
            'notice_period' => $offer?->notice_period ?? 'N/A',
            'working_hours' => $offer?->working_hrs ?? 'N/A',

            // Interview related
            'date' => $interview?->scheduled_date?->format('Y-m-d') ?? 'N/A',
            'day' => $interview?->scheduled_date?->format('l') ?? 'N/A',
            'time' => $interview?->scheduled_time ?? 'N/A',
            'interview_type' => $interview?->interviewType?->name ?? 'N/A',
            'daration' => $interview?->duration ?? 'N/A',
        ];
    }

    /**
     * Send notification for a specific candidate status key.
     * Looks up the active template by type + status_key.
     */
    public function sendByStatus(Candidate $candidate, string $statusKey): void
    {
        $data = $this->buildCandidateData($candidate);

        // Send email
        if (getSetting('email_notification_enabled', true)) {
            $emailTemplate = NotificationTemplate::active()
                ->byType('email')
                ->where('status_key', $statusKey)
                ->first();

            if ($emailTemplate) {
                $subject = $emailTemplate->parseSubject($data);
                $body = $emailTemplate->parseBody($data);
                $result = $this->emailService->send($candidate->email, $subject, $body);
                $this->logNotification($candidate->id, 'email', $statusKey, $emailTemplate->id, $result, $candidate->email);
            }
        }

        // Send WhatsApp
        if (getSetting('whatsapp_notification_enabled', true) && $candidate->phone) {
            $whatsappTemplate = NotificationTemplate::active()
                ->byType('whatsapp')
                ->where('status_key', $statusKey)
                ->first();

            if ($whatsappTemplate) {
                if ($whatsappTemplate->twilio_content_sid) {
                    // Using Content API (pre-approved template)
                    // ContentVariables must use numeric keys (1, 2, 3...) matching the {{1}}, {{2}}
                    // placeholders that were stored in Twilio's Content API template body.
                    $placeholders = $whatsappTemplate->getPlaceholders();
                    $contentVariables = [];
                    foreach ($placeholders as $index => $placeholder) {
                        $value = (string) ($data[$placeholder] ?? "N/A");
                        // Twilio Content API does not allow newlines, tabs or multiple spaces in WhatsApp variable values
                        $value = str_replace(["\r", "\n", "\t"], ' ', $value);
                        $value = preg_replace('/\s+/', ' ', $value);
                        $contentVariables[$index + 1] = trim($value);
                    }
                    $result = $this->whatsAppService->sendWithContentTemplate($candidate->phone, $whatsappTemplate, $contentVariables);
                } else {
                    // Plain text fallback
                    $message = $whatsappTemplate->parseBody($data);
                    $result = $this->whatsAppService->send($candidate->phone, $message);
                }
                $this->logNotification($candidate->id, 'whatsapp', $statusKey, $whatsappTemplate->id, $result, $candidate->phone);
            }
        }
    }

    /**
     * Send application confirmation notifications (email + WhatsApp).
     * Uses status_key = 'applied'.
     */
    public function sendApplicationConfirmation(Candidate $candidate): void
    {
        $this->sendByStatus($candidate, 'applied');
    }

    /**
     * Send rejection notifications (email + WhatsApp).
     * Uses status_key = 'rejected'.
     */
    public function sendRejectionNotification(Candidate $candidate): void
    {
        $this->sendByStatus($candidate, 'rejected');

        $candidate->update(['rejection_notification_sent' => true]);
    }

    /**
     * Send a test email.
     */
    public function sendTestEmail(string $to): array
    {
        return $this->emailService->sendTest($to);
    }

    /**
     * Send a test WhatsApp message.
     */
    public function sendTestWhatsApp(string $to): array
    {
        return $this->whatsAppService->sendTest($to);
    }

    /**
     * Log a notification attempt.
     */
    protected function logNotification(int $candidateId, string $type, string $purpose, ?int $templateId, array $result, string $sentTo): void
    {
        NotificationLog::create([
            'candidate_id' => $candidateId,
            'type' => $type,
            'purpose' => $purpose,
            'template_id' => $templateId,
            'status' => $result['success'] ? 'sent' : 'failed',
            'error_message' => $result['error'],
            'sent_to' => $sentTo,
            'sent_by' => Auth::id(),
            'sent_at' => now(),
        ]);
    }
}