<?php

namespace App\Events;

use App\Models\Candidate;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CandidateApplied
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Candidate $candidate;

    /**
     * Create a new event instance.
     */
    public function __construct(Candidate $candidate)
    {
        $this->candidate = $candidate;
    }
}