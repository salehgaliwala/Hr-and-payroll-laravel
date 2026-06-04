<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('notification_templates', function (Blueprint $table) {
            $table->string('category')->nullable()->after('type');
            $table->string('language')->default('en')->after('category');
            $table->string('twilio_content_sid', 100)->nullable()->index()->after('language');
            $table->string('approval_status')->default('approved')->after('twilio_content_sid');
            $table->text('rejection_reason')->nullable()->after('approval_status');
        });

        // Set initial approval_status based on type
        DB::table('notification_templates')->where('type', 'whatsapp')->update(['approval_status' => 'pending']);
        DB::table('notification_templates')->where('type', '!=', 'whatsapp')->update(['approval_status' => 'approved']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notification_templates', function (Blueprint $table) {
            $table->dropColumn(['category', 'language', 'twilio_content_sid', 'approval_status', 'rejection_reason']);
        });
    }
};
