<?php

namespace App\Console\Commands;

use App\Models\NotificationTemplate;
use App\Models\WhatsappTemplate;
use App\Services\TwilioContentService;
use Illuminate\Console\Command;

class SyncTwilioTemplates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'twilio:sync-templates';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize WhatsApp template approval statuses from Twilio';

    /**
     * Execute the console command.
     */
    public function handle(TwilioContentService $twilioService)
    {
        $this->info('Starting WhatsApp template status synchronization...');

        // 1. Sync WhatsappTemplate models
        $whatsappTemplates = WhatsappTemplate::where('status', 'pending')
            ->whereNotNull('twilio_content_sid')
            ->get();

        foreach ($whatsappTemplates as $template) {
            $this->syncTemplate($twilioService, $template);
        }

        // 2. Sync NotificationTemplate models
        $notificationTemplates = NotificationTemplate::where('type', 'whatsapp')
            ->where('approval_status', NotificationTemplate::APPROVAL_PENDING)
            ->whereNotNull('twilio_content_sid')
            ->get();

        foreach ($notificationTemplates as $template) {
            $this->syncTemplate($twilioService, $template);
        }

        $this->info('Synchronization completed.');
    }

    private function syncTemplate(TwilioContentService $twilioService, $template)
    {
        $this->comment("Checking template: {$template->twilio_content_sid}");

        $result = $twilioService->fetchTemplateStatus($template->twilio_content_sid);

        if (!$result['success']) {
            $this->error("Failed to fetch status for {$template->twilio_content_sid}: {$result['error']}");
            return;
        }

        $newStatus = $result['status'];
        $rejectionReason = $result['rejection_reason'];

        if ($template instanceof WhatsappTemplate) {
            $oldStatus = $template->status;
            if ($oldStatus !== $newStatus) {
                $template->update([
                    'status' => $newStatus,
                    'rejection_reason' => $rejectionReason,
                ]);
                $this->info("Updated WhatsappTemplate {$template->id}: {$oldStatus} -> {$newStatus}");
            }
        } else {
            $oldStatus = $template->approval_status;
            if ($oldStatus !== $newStatus) {
                $template->update([
                    'approval_status' => $newStatus,
                    'rejection_reason' => $rejectionReason,
                ]);
                $this->info("Updated NotificationTemplate {$template->id}: {$oldStatus} -> {$newStatus}");
            }
        }
    }
}
