<?php

namespace Database\Seeders;

use App\Models\NotificationTemplate;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find the first company user (or superadmin) to assign as creator
        $user = User::where('type', 'company')->first();

        if (!$user) {
            $user = User::where('type', 'superadmin')->first();
        }

        if (!$user) {
            return;
        }

        $templates = [
            [
                'name' => 'Application Confirmation Email',
                'type' => 'email',
                'purpose' => 'application_confirmation',
                'status_key' => 'applied',
                'subject' => 'Application Received - {{job_title}} at {{company_name}}',
                'body' => '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b77f; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 20px; background: #f9f9f9; border: 1px solid #ddd; }
        .footer { padding: 15px; text-align: center; font-size: 12px; color: #888; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Application Received!</h2>
        </div>
        <div class="content">
            <p>Dear {{candidate_name}},</p>
            <p>Thank you for applying for the position of <strong>{{job_title}}</strong> at {{company_name}}.</p>
            <p>We have received your application successfully on {{application_date}}.</p>
            <p>Our recruitment team will review your qualifications and experience. If your profile matches our requirements, we will contact you for the next steps.</p>
            <h4>Application Summary:</h4>
            <ul>
                <li><strong>Position:</strong> {{job_title}}</li>
                <li><strong>Applied Date:</strong> {{application_date}}</li>
                <li><strong>Email:</strong> {{candidate_email}}</li>
                <li><strong>Phone:</strong> {{candidate_phone}}</li>
            </ul>
            <p>We appreciate your interest in joining our team!</p>
            <p>Best regards,<br>{{company_name}} Recruitment Team</p>
        </div>
        <div class="footer">
            <p>&copy; {{company_name}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>',
                'placeholders' => json_encode(['candidate_name', 'job_title', 'application_date', 'company_name', 'candidate_email', 'candidate_phone']),
                'is_active' => true,
            ],
            [
                'name' => 'Application Confirmation WhatsApp',
                'type' => 'whatsapp',
                'purpose' => 'application_confirmation',
                'status_key' => 'applied',
                'subject' => null,
                'body' => "Hi {{candidate_name}},\n\nThank you for applying for {{job_title}} at {{company_name}}!\n\nWe've received your application (dated: {{application_date}}) and our team will review it shortly.\n\nIf your profile matches our requirements, we will reach out to you.\n\nBest regards,\n{{company_name}} Recruitment Team",
                'placeholders' => json_encode(['candidate_name', 'job_title', 'application_date', 'company_name', 'candidate_email', 'candidate_phone']),
                'is_active' => true,
            ],
            [
                'name' => 'Application Rejection Email',
                'type' => 'email',
                'purpose' => 'application_rejection',
                'status_key' => 'rejected',
                'subject' => 'Update on Your Application - {{job_title}} at {{company_name}}',
                'body' => '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 20px; background: #f9f9f9; border: 1px solid #ddd; }
        .footer { padding: 15px; text-align: center; font-size: 12px; color: #888; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Application Status Update</h2>
        </div>
        <div class="content">
            <p>Dear {{candidate_name}},</p>
            <p>Thank you for your interest in the <strong>{{job_title}}</strong> position at {{company_name}} and for taking the time to apply.</p>
            <p>After careful consideration, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match our current requirements for this role.</p>
            <p>Please do not be discouraged. We encourage you to apply for future positions that match your skills and experience.</p>
            <p>We wish you the best in your job search and future career endeavors.</p>
            <p>Best regards,<br>{{company_name}} Recruitment Team</p>
        </div>
        <div class="footer">
            <p>&copy; {{company_name}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>',
                'placeholders' => json_encode(['candidate_name', 'job_title', 'application_date', 'company_name', 'candidate_email', 'candidate_phone']),
                'is_active' => true,
            ],
            [
                'name' => 'Application Rejection WhatsApp',
                'type' => 'whatsapp',
                'purpose' => 'application_rejection',
                'status_key' => 'rejected',
                'subject' => null,
                'body' => "Hi {{candidate_name}},\n\nThank you for applying for {{job_title}} at {{company_name}}.\n\nAfter careful review, we regret to inform you that we have decided to proceed with other candidates whose qualifications better match our current requirements.\n\nWe encourage you to apply for future opportunities that align with your skills.\n\nWe wish you all the best in your job search.\n\nBest regards,\n{{company_name}} Recruitment Team",
                'placeholders' => json_encode(['candidate_name', 'job_title', 'application_date', 'company_name', 'candidate_email', 'candidate_phone']),
                'is_active' => true,
            ],
        ];

        foreach ($templates as $templateData) {
            NotificationTemplate::create(array_merge($templateData, [
                'created_by' => $user->id,
            ]));
        }

        $this->command->info('Notification templates seeded successfully!');
    }
}