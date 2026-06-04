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
        Schema::table('candidates', function (Blueprint $table) {
            $table->foreignId('unsuccessful_by')->nullable()->constrained('users')->onDelete('set null')->after('is_employee');
            $table->timestamp('unsuccessful_at')->nullable()->after('unsuccessful_by');
            $table->boolean('rejection_notification_sent')->default(false)->after('unsuccessful_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->dropForeign(['unsuccessful_by']);
            $table->dropColumn(['unsuccessful_by', 'unsuccessful_at', 'rejection_notification_sent']);
        });
    }
};