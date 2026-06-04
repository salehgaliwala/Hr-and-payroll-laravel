<?php

namespace App\Http\Controllers;

use App\Models\NotificationTemplate;
use App\Models\WhatsappTemplate;
use App\Services\TwilioContentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class NotificationTemplateController extends Controller
{
    protected TwilioContentService $twilioContentService;

    public function __construct()
    {
        $this->twilioContentService = new TwilioContentService();
    }

    /**
     * Display a listing of notification templates.
     */
    public function index(Request $request)
    {
        if (!Auth::user()->can('manage-notification-templates')) {
            return redirect()->back()->with('error', __('Permission Denied.'));
        }

        $query = NotificationTemplate::with('creator')
            ->whereIn('created_by', getCompanyAndUsersId());

        if ($request->has('type') && !empty($request->type)) {
            $query->where('type', $request->type);
        }

        if ($request->has('purpose') && !empty($request->purpose)) {
            $query->where('purpose', $request->purpose);
        }

        if ($request->has('status_key') && !empty($request->status_key)) {
            $query->where('status_key', $request->status_key);
        }

        if ($request->has('search') && !empty($request->search)) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $templates = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 10);

        return Inertia::render('hr/recruitment/notification-templates/index', [
            'templates' => $templates,
            'filters' => $request->all(['type', 'purpose', 'status_key', 'search', 'per_page']),
            'statusOptions' => NotificationTemplate::getStatusOptions(),
        ]);
    }

    /**
     * Show the form for creating a new notification template.
     */
    public function create()
    {
        if (!Auth::user()->can('manage-notification-templates')) {
            return redirect()->back()->with('error', __('Permission Denied.'));
        }

        $availablePlaceholders = [
            'candidate_name',
            'job_title',
            'application_date',
            'company_name',
            'candidate_email',
            'candidate_phone',
        ];

        return Inertia::render('hr/recruitment/notification-templates/create', [
            'availablePlaceholders' => $availablePlaceholders,
            'statusOptions' => NotificationTemplate::getStatusOptions(),
            'categories' => WhatsappTemplate::CATEGORIES,
        ]);
    }

    /**
     * Store a newly created notification template in storage.
     */
    public function store(Request $request)
    {
        if (!Auth::user()->can('manage-notification-templates')) {
            return redirect()->back()->with('error', __('Permission Denied.'));
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|in:email,whatsapp',
            'purpose' => 'required|string|max:255',
            'subject' => 'nullable|required_if:type,email|string|max:500',
            'body' => 'required|string',
            'status_key' => 'nullable|string|max:50',
            'category' => 'nullable|required_if:type,whatsapp|in:' . implode(',', WhatsappTemplate::CATEGORIES),
            'language' => 'nullable|string|max:10',
            'sample_data' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $isWhatsapp = $request->type === 'whatsapp';

        $template = NotificationTemplate::create([
            'name' => $request->name,
            'type' => $request->type,
            'category' => $request->category,
            'language' => $request->language ?: 'en',
            'purpose' => $request->purpose,
            'status_key' => $request->status_key === 'none' ? null : $request->status_key,
            'subject' => $request->subject,
            'body' => $request->body,
            'is_active' => $isWhatsapp ? false : true,
            'approval_status' => $isWhatsapp ? NotificationTemplate::APPROVAL_PENDING : NotificationTemplate::APPROVAL_APPROVED,
            'created_by' => Auth::id(),
        ]);

        if ($isWhatsapp) {
            $twilioSid = config('twilio.sid') ?: getSetting('twilio_sid', '');
            if (!empty($twilioSid)) {
                $result = $this->twilioContentService->submitTemplateToTwilio(
                    $template,
                    $request->sample_data ?? []
                );

                if ($result['success']) {
                    $template->update([
                        'twilio_content_sid' => $result['content_sid'],
                    ]);
                } else {
                    session()->flash('warning', __('Template saved locally but submission to Twilio failed: :error', [
                        'error' => $result['error'],
                    ]));
                }
            }
        }

        return redirect()->route('hr.recruitment.notification-templates.index')
            ->with('success', __('Notification template created successfully'));
    }

    /**
     * Show the form for editing a notification template.
     */
    public function edit(NotificationTemplate $notificationTemplate)
    {
        if (!in_array($notificationTemplate->created_by, getCompanyAndUsersId())) {
            return abort(404);
        }

        if (!Auth::user()->can('manage-notification-templates')) {
            return redirect()->back()->with('error', __('Permission Denied.'));
        }

        $availablePlaceholders = [
            'candidate_name',
            'job_title',
            'application_date',
            'company_name',
            'candidate_email',
            'candidate_phone',
        ];

        return Inertia::render('hr/recruitment/notification-templates/edit', [
            'template' => $notificationTemplate,
            'availablePlaceholders' => $availablePlaceholders,
            'statusOptions' => NotificationTemplate::getStatusOptions(),
        ]);
    }

    /**
     * Update the specified notification template.
     */
    public function update(Request $request, NotificationTemplate $notificationTemplate)
    {
        if (!in_array($notificationTemplate->created_by, getCompanyAndUsersId())) {
            return redirect()->back()->with('error', __('Permission Denied.'));
        }

        if (!Auth::user()->can('manage-notification-templates')) {
            return redirect()->back()->with('error', __('Permission Denied.'));
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'subject' => 'nullable|string|max:500',
            'body' => 'required|string',
            'is_active' => 'boolean',
            'status_key' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $notificationTemplate->update([
            'name' => $request->name,
            'subject' => $request->subject,
            'body' => $request->body,
            'is_active' => $request->boolean('is_active', true),
            'status_key' => $request->status_key === 'none' ? null : $request->status_key,
        ]);

        return redirect()->route('hr.recruitment.notification-templates.index')
            ->with('success', __('Notification template updated successfully'));
    }

    /**
     * Toggle template active status.
     */
    public function toggleStatus(NotificationTemplate $notificationTemplate)
    {
        if (!in_array($notificationTemplate->created_by, getCompanyAndUsersId())) {
            return redirect()->back()->with('error', __('Permission Denied.'));
        }

        if (!Auth::user()->can('manage-notification-templates')) {
            return redirect()->back()->with('error', __('Permission Denied.'));
        }

        $notificationTemplate->update([
            'is_active' => !$notificationTemplate->is_active,
        ]);

        return redirect()->back()->with('success', __('Template status updated successfully'));
    }

    /**
     * Preview a notification template with sample data.
     */
    public function preview(Request $request, NotificationTemplate $notificationTemplate)
    {
        if (!in_array($notificationTemplate->created_by, getCompanyAndUsersId())) {
            return response()->json(['error' => 'Permission Denied.'], 403);
        }

        $sampleData = [
            'candidate_name' => 'John Doe',
            'job_title' => 'Software Engineer',
            'application_date' => now()->format('Y-m-d'),
            'company_name' => getSetting('titleText', 'Company'),
            'candidate_email' => 'john@example.com',
            'candidate_phone' => '+1234567890',
        ];

        $renderedBody = $notificationTemplate->parseBody($sampleData);
        $renderedSubject = $notificationTemplate->type === 'email'
            ? $notificationTemplate->parseBody($sampleData)
            : null;

        return response()->json([
            'subject' => $renderedSubject ?? $notificationTemplate->subject,
            'body' => $renderedBody,
            'template' => $notificationTemplate,
        ]);
    }
}