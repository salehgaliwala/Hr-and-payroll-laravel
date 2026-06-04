<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'category',
        'language',
        'purpose',
        'status_key',
        'subject',
        'body',
        'placeholders',
        'twilio_content_sid',
        'approval_status',
        'rejection_reason',
        'is_active',
        'created_by',
    ];

    const APPROVAL_DRAFT = 'draft';
    const APPROVAL_PENDING = 'pending';
    const APPROVAL_APPROVED = 'approved';
    const APPROVAL_REJECTED = 'rejected';

    protected $casts = [
        'placeholders' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get available candidate statuses that templates can map to.
     * Keys are stored in DB, values are translatable labels.
     */
    public static function getStatusOptions(): array
    {
        return [
            'applied'   => __('Applied'),
            'screening' => __('Screening'),
            'interview' => __('Interview'),
            'offered'   => __('Offered'),
            'hired'     => __('Hired'),
            'rejected'  => __('Rejected'),
            'on_hold'   => __('On Hold'),
        ];
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function notificationLogs()
    {
        return $this->hasMany(NotificationLog::class, 'template_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByPurpose($query, $purpose)
    {
        return $query->where('purpose', $purpose);
    }

    public function parseBody(array $data): string
    {
        $body = $this->body;
        foreach ($data as $key => $value) {
            $body = str_replace('{{' . $key . '}}', $value, $body);
        }
        return $body;
    }

    public function parseSubject(array $data): string
    {
        $subject = $this->subject ?? '';
        foreach ($data as $key => $value) {
            $subject = str_replace('{{' . $key . '}}', $value, $subject);
        }
        return $subject;
    }

    /**
     * Extract placeholders like {{1}}, {{2}} from body.
     */
    public function getPlaceholders(): array
    {
        preg_match_all('/\{\{(\d+)\}\}/', $this->body, $matches);
        return $matches[1] ?? [];
    }
}
