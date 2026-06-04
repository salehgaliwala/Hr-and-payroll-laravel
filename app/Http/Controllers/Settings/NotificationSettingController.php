<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotificationSettingController extends Controller
{
    protected NotificationService $notificationService;

    public function __construct()
    {
        $this->notificationService = new NotificationService();
    }

    /**
     * Show the notification settings page.
     */
    public function index()
    {
        $settings = [
            'email_notification_enabled' => getSetting('email_notification_enabled', '1'),
            'whatsapp_notification_enabled' => getSetting('whatsapp_notification_enabled', '0'),
            'email_from_address' => getSetting('email_from_address', ''),
            'email_from_name' => getSetting('email_from_name', ''),
            'twilio_sid' => getSetting('twilio_sid', ''),
            'twilio_auth_token' => getSetting('twilio_auth_token', ''),
            'twilio_whatsapp_from' => getSetting('twilio_whatsapp_from', ''),
            'email_host' => getSetting('email_host', ''),
            'email_port' => getSetting('email_port', ''),
            'email_username' => getSetting('email_username', ''),
            'email_encryption' => getSetting('email_encryption', 'tls'),
            'email_driver' => getSetting('email_driver', 'smtp'),
        ];

        // Mask sensitive values
        if (!empty($settings['twilio_auth_token'])) {
            $settings['twilio_auth_token'] = '••••••••••••';
        }

        return inertia('hr/recruitment/notification-settings/index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update notification settings.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'email_notification_enabled' => 'boolean',
            'whatsapp_notification_enabled' => 'boolean',
            'twilio_sid' => 'nullable|string',
            'twilio_auth_token' => 'nullable|string',
            'twilio_whatsapp_from' => 'nullable|string',
        ]);

        updateSetting('email_notification_enabled', $validated['email_notification_enabled'] ?? false ? '1' : '0');
        updateSetting('whatsapp_notification_enabled', $validated['whatsapp_notification_enabled'] ?? false ? '1' : '0');

        if (!empty($validated['twilio_sid'])) {
            updateSetting('twilio_sid', $validated['twilio_sid']);
        }

        if (!empty($validated['twilio_auth_token']) && $validated['twilio_auth_token'] !== '••••••••••••') {
            updateSetting('twilio_auth_token', $validated['twilio_auth_token']);
        }

        if (!empty($validated['twilio_whatsapp_from'])) {
            updateSetting('twilio_whatsapp_from', $validated['twilio_whatsapp_from']);
        }

        return redirect()->back()->with('success', __('Notification settings updated successfully'));
    }

    /**
     * Send a test email.
     */
    public function testEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->with('error', $validator->errors()->first());
        }

        $result = $this->notificationService->sendTestEmail($request->email);

        if ($result['success']) {
            return redirect()->back()->with('success', __('Test email sent successfully to :email', ['email' => $request->email]));
        }

        return redirect()->back()->with('error', __('Failed to send test email: :error', ['error' => $result['error']]));
    }

    /**
     * Send a test WhatsApp message.
     */
    public function testWhatsApp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->with('error', $validator->errors()->first());
        }

        $result = $this->notificationService->sendTestWhatsApp($request->phone);

        if ($result['success']) {
            return redirect()->back()->with('success', __('Test WhatsApp message sent successfully to :phone', ['phone' => $request->phone]));
        }

        return redirect()->back()->with('error', __('Failed to send test WhatsApp message: :error', ['error' => $result['error']]));
    }
}