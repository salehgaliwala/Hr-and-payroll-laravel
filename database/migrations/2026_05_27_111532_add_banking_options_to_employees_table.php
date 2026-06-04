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
        Schema::table('employees', function (Blueprint $table) {
            $table->string('banking_option')->default('bank_account')->after('emergency_contact_number');
            $table->string('wallet_provider')->nullable()->after('banking_option');
            $table->string('wallet_phone')->nullable()->after('wallet_provider');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn(['banking_option', 'wallet_provider', 'wallet_phone']);
        });
    }
};
