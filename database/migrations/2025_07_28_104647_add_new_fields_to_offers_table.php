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
        Schema::table('offers', function (Blueprint $table) {
            $table->foreignId('manager_id')->nullable()->after('approved_by')->constrained('users')->onDelete('set null');
            $table->string('probation_period')->nullable()->after('manager_id');
            $table->string('notice_period')->nullable()->after('probation_period');
            $table->string('working_hrs')->nullable()->after('notice_period');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->dropForeign(['manager_id']);
            $table->dropColumn(['manager_id', 'probation_period', 'notice_period', 'working_hrs']);
        });
    }
};
