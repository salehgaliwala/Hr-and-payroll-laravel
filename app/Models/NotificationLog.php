<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'candidate_id',
        'type',
        'purpose',
        'template_id',
        'status',
        'error_message',
        'sent_to',
        'sent_by',
        'sent_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }

    public function template()
    {
        return $this->belongsTo(NotificationTemplate::class, 'template_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sent_by');
    }
}