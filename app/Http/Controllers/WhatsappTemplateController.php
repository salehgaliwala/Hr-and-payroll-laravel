<?php

namespace App\Http\Controllers;

use App\Models\WhatsappTemplate;
use App\Services\TwilioContentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class WhatsappTemplateController extends Controller
{
    protected TwilioContentService $twilioContentService;

    public function __construct()
    {
        $this->twilioContentService = new TwilioContentService();
    }

    /**
     * Display a listing of WhatsApp templates.
     */
    public function index(Request $request)
    {
        if (!Auth::user()->can('manage-notification-templates')) {
            return redirect()->back()->with('error', __('Permission Denied.'));
        }

        $query = WhatsappTemplate::with('creator')
            ->whereIn('created_by', getCompanyAndUsersId());

        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && !empty($request->search)) {
            $query->where('friendly_name', 'like', '%' . $request->search . '%');
        }

        $templates = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return Inertia::render('hr/recruitment/whatsapp-templates/index', [
            'templates' => $templates,
            'filters' => $request->all(['status', 'search', 'per_page']),
            'categories' => WhatsappTemplate::CATEGORIES,
        ]);
    }

    /**
     * Store a newly created WhatsApp template and submit to Twilio.
     */
    public function store(Request $request)
    {
        if (!Auth::user()->can('manage-notification-templates')) {
            return redirect()->back()->with('error', __('Permission Denied.'));
        }

        $validator = Validator::make($request->all(), [
            'friendly_name' => 'required|string|max:255',
            'category' => 'required|in:' . implode(',', WhatsappTemplate::CATEGORIES),
            'language' => 'required|string|max:10',
            'body_text' => 'required|string',
            'sample_data' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        // Create the template locally
        $template = WhatsappTemplate::create([
            'friendly_name' => $request->friendly_name,
            'category' => $request->category,
            'language' => $request->language ?: 'en',
            'body_text' => $request->body_text,
            'sample_data' => $request->sample_data,
            'status' => 'draft',
            'created_by' => Auth::id(),
        ]);

        // Submit to Twilio Content API
        $result = $this->twilioContentService->submitTemplateToTwilio(
            $template,
            $request->sample_data ?? []
        );

        Log::debug('WhatsappTemplateController: Twilio submission result', [
            'template_id' => $template->id,
            'template_name' => $template->friendly_name,
            'result_success' => $result['success'],
            'result_content_sid' => $result['content_sid'],
            'result_error' => $result['error'],
            'twilio_sid_configured' => !empty(config('twilio.sid')) || !empty(getSetting('twilio_sid', '')),
            'twilio_auth_configured' => !empty(config('twilio.auth_token')) || !empty(getSetting('twilio_auth_token', '')),
        ]);

        if ($result['success']) {
            $template->update([
                'twilio_content_sid' => $result['content_sid'],
                'status' => 'pending',
            ]);

            Log::info('WhatsappTemplateController: Template submitted to Twilio successfully', [
                'template_id' => $template->id,
                'twilio_content_sid' => $result['content_sid'],
            ]);
        } else {
            Log::warning('WhatsappTemplateController: Template submission to Twilio failed', [
                'template_id' => $template->id,
                'template_name' => $template->friendly_name,
                'error' => $result['error'],
            ]);

            // Keep as draft with a note that submission failed
            session()->flash('warning', __('Template saved locally but submission to Twilio failed: :error', [
                'error' => $result['error'],
            ]));
        }

        return redirect()->route('hr.recruitment.whatsapp-templates.index')
            ->with('success', __('WhatsApp template created successfully'));
    }

    /**
     * Update the specified WhatsApp template.
     */
    public function update(Request $request, WhatsappTemplate $whatsappTemplate)
    {
        if (!in_array($whatsappTemplate->created_by, getCompanyAndUsersId())) {
            return redirect()->back()->with('error', __('Permission Denied.'));
        }

        if (!Auth::user()->can('manage-notification-templates')) {
            return redirect()->back()->with('error', __('Permission Denied.'));
        }

        // Only draft templates can be edited
        if ($whatsappTemplate->status !== 'draft') {
            return redirect()->back()->with('error', __('Only draft templates can be edited.'));
        }

        $validator = Validator::make($request->all(), [
            'friendly_name' => 'required|string|max:255',
            'category' => 'required|in:' . implode(',', WhatsappTemplate::CATEGORIES),
            'language' => 'required|string|max:10',
            'body_text' => 'required|string',
            'sample_data' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $whatsappTemplate->update([
            'friendly_name' => $request->friendly_name,
            'category' => $request->category,
            'language' => $request->language ?: 'en',
            'body_text' => $request->body_text,
            'sample_data' => $request->sample_data,
        ]);

        return redirect()->route('hr.recruitment.whatsapp-templates.index')
            ->with('success', __('WhatsApp template updated successfully'));
    }

    /**
     * Remove the specified WhatsApp template.
     */
    public function destroy(WhatsappTemplate $whatsappTemplate)
    {
        if (!in_array($whatsappTemplate->created_by, getCompanyAndUsersId())) {
            return redirect()->back()->with('error', __('Permission Denied.'));
        }

        if (!Auth::user()->can('manage-notification-templates')) {
            return redirect()->back()->with('error', __('Permission Denied.'));
        }

        $whatsappTemplate->delete();

        return redirect()->back()->with('success', __('WhatsApp template deleted successfully'));
    }

    /**
     * Preview a WhatsApp template with sample data.
     */
    public function preview(WhatsappTemplate $whatsappTemplate)
    {
        if (!in_array($whatsappTemplate->created_by, getCompanyAndUsersId())) {
            return response()->json(['error' => 'Permission Denied.'], 403);
        }

        $previewBody = $whatsappTemplate->body_text;
        $sampleData = $whatsappTemplate->sample_data ?? [];

        // Replace {{1}}, {{2}} with sample data if available
        foreach ($sampleData as $index => $value) {
            $placeholder = '{{' . ($index + 1) . '}}';
            $previewBody = str_replace($placeholder, $value, $previewBody);
        }

        return response()->json([
            'preview_body' => $previewBody,
            'template' => $whatsappTemplate,
        ]);
    }

    /**
     * Handle webhook callback from Twilio Content API.
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->all();
        $result = $this->twilioContentService->handleWebhook($payload);

        if ($result['success']) {
            return response()->json(['status' => 'ok']);
        }

        return response()->json(['error' => $result['error']], 400);
    }
}