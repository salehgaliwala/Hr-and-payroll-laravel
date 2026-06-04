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
        Schema::create('whatsapp_templates', function (Blueprint $table) {
            $table->id();
            $table->string('twilio_content_sid', 100)->nullable()->index();
            $table->string('friendly_name');
            $table->string('category'); // UTILITY, AUTHENTICATION, MARKETING
            $table->string('language')->default('en');
            $table->text('body_text');
            $table->string('status')->default('draft'); // draft, pending, approved, rejected
            $table->text('rejection_reason')->nullable();
            $table->text('sample_data')->nullable(); // JSON array of sample values for placeholders
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whatsapp_templates');
    }
};