<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatsappTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'twilio_content_sid',
        'friendly_name',
        'category',
        'language',
        'body_text',
        'status',
        'rejection_reason',
        'sample_data',
        'created_by',
    ];

    protected $casts = [
        'sample_data' => 'array',
    ];

    const CATEGORIES = ['UTILITY', 'AUTHENTICATION', 'MARKETING'];
    const STATUSES = ['draft', 'pending', 'approved', 'rejected'];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Extract placeholders like {{1}}, {{2}} from body_text.
     */
    public function getPlaceholders(): array
    {
        preg_match_all('/\{\{(\d+)\}\}/', $this->body_text, $matches);
        return $matches[1] ?? [];
    }

    /**
     * Get status color for UI display.
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'draft' => 'gray',
            'pending' => 'yellow',
            'approved' => 'green',
            'rejected' => 'red',
            default => 'gray',
        };
    }
}