<?php

namespace App\Events;

use App\Models\Candidate;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CandidateRejected
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Candidate $candidate;
    public ?int $rejectedBy;

    /**
     * Create a new event instance.
     */
    public function __construct(Candidate $candidate, ?int $rejectedBy = null)
    {
        $this->candidate = $candidate;
        $this->rejectedBy = $rejectedBy;
    }
}