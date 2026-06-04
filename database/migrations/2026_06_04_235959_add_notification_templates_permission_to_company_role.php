<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create the permission if it doesn't exist
        $permission = Permission::firstOrCreate(
            ['name' => 'manage-notification-templates', 'guard_name' => 'web'],
            [
                'module' => 'notification_templates',
                'label' => 'Manage Notification Templates',
                'description' => 'Can manage notification templates and settings',
            ]
        );

        // Assign the permission to the company role
        $companyRole = Role::where('name', 'company')->where('guard_name', 'web')->first();
        if ($companyRole && !$companyRole->hasPermissionTo('manage-notification-templates')) {
            $companyRole->givePermissionTo($permission);
        }

        // Reset cache again to reflect changes immediately
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove the permission from the company role
        $companyRole = Role::where('name', 'company')->where('guard_name', 'web')->first();
        if ($companyRole) {
            $companyRole->revokePermissionTo('manage-notification-templates');
        }

        // Delete the permission
        Permission::where('name', 'manage-notification-templates')->where('guard_name', 'web')->delete();

        // Reset cache
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
};