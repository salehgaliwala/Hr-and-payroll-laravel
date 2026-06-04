<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_id')->constrained('candidates')->onDelete('cascade');
            $table->string('type'); // email, whatsapp
            $table->string('purpose'); // application_confirmation, application_rejection
            $table->foreignId('template_id')->nullable()->constrained('notification_templates')->onDelete('set null');
            $table->string('status'); // sent, failed
            $table->text('error_message')->nullable();
            $table->string('sent_to'); // email or phone number
            $table->foreignId('sent_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('sent_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};