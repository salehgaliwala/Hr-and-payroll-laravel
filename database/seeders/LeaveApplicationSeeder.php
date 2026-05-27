<?php

namespace Database\Seeders;

use App\Models\LeaveApplication;
use App\Models\LeavePolicy;
use App\Models\LeaveType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class LeaveApplicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all companies
        $companies = User::where('type', 'company')->get();

        if ($companies->isEmpty()) {
            $this->command->warn('No company users found. Please run DefaultCompanySeeder first.');

            return;
        }

        // Leave application patterns pool
        // Leave types reference from LeaveTypeSeeder:
        // Annual Leave, Sick Leave, Maternity Leave, Paternity Leave, Emergency Leave,
        // Bereavement Leave, Study Leave, Compensatory Leave, Personal Leave, Marriage Leave
        $monthlyLeavePatterns = [
            1 => ['leave_type' => 'Annual Leave',       'days' => 2, 'reason' => 'New Year vacation',              'status' => 'approved'],
            2 => ['leave_type' => 'Sick Leave',          'days' => 1, 'reason' => 'Fever and cold symptoms',         'status' => 'approved'],
            3 => ['leave_type' => 'Personal Leave',      'days' => 1, 'reason' => 'Personal appointment',            'status' => 'approved'],
            4 => ['leave_type' => 'Annual Leave',        'days' => 1, 'reason' => 'Family vacation',                 'status' => 'approved'],
            5 => ['leave_type' => 'Emergency Leave',     'days' => 1, 'reason' => 'Family emergency',                'status' => 'approved'],
            6 => ['leave_type' => 'Compensatory Leave',  'days' => 2, 'reason' => 'Compensatory off for overtime',   'status' => 'approved'],
            7 => ['leave_type' => 'Sick Leave',          'days' => 2, 'reason' => 'Medical checkup and recovery',    'status' => 'approved'],
            8 => ['leave_type' => 'Study Leave',         'days' => 2, 'reason' => 'Professional development course', 'status' => 'approved'],
            9 => ['leave_type' => 'Annual Leave',        'days' => 2, 'reason' => 'Festival celebration',            'status' => 'approved'],
            10 => ['leave_type' => 'Bereavement Leave',   'days' => 2, 'reason' => 'Family bereavement',              'status' => 'approved'],
            11 => ['leave_type' => 'Marriage Leave',      'days' => 3, 'reason' => 'Wedding ceremony',                'status' => 'approved'],
            12 => ['leave_type' => 'Annual Leave',        'days' => 2, 'reason' => 'Year end vacation',               'status' => 'approved'],
        ];

        $currentYear = date('Y');

        foreach ($companies as $company) {
            // Get employees for this company
            $employees = User::where('type', 'employee')->where('created_by', $company->id)->get();

            if ($employees->isEmpty()) {
                $this->command->warn('No employees found for company: '.$company->name.'. Please run EmployeeSeeder first.');

                continue;
            }

            // Get leave types and policies for this company
            $leaveTypes = LeaveType::where('created_by', $company->id)->get();
            $leavePolicies = LeavePolicy::where('created_by', $company->id)->get();

            if ($leaveTypes->isEmpty() || $leavePolicies->isEmpty()) {
                $this->command->warn('No leave types or policies found for company: '.$company->name.'. Please run LeaveTypeSeeder and LeavePolicySeeder first.');

                continue;
            }

            // Get managers for approval
            $managers = User::whereIn('type', ['manager', 'hr'])->where('created_by', $company->id)->get();

            // Select total employees - 1
            $totalEmployees = $employees->count();
            $selectedEmployees = $employees->take(max(1, $totalEmployees - 1));

            // Outer loop: month first, then employees inside
            for ($month = 1; $month <= 6; $month++) {

                foreach ($selectedEmployees as $empIndex => $employee) {
                    // Pick a random pattern per employee so different employees get different leave types
                    $pattern = $monthlyLeavePatterns[array_rand($monthlyLeavePatterns)];

                    // Find matching leave type and policy for this employee's random pattern
                    $leaveType = $leaveTypes->where('name', $pattern['leave_type'])->first();
                    if (! $leaveType) {
                        $leaveType = $leaveTypes->first();
                    }

                    $leavePolicy = $leavePolicies->where('leave_type_id', $leaveType->id)->first();
                    if (! $leavePolicy) {
                        $leavePolicy = $leavePolicies->first();
                    }

                    // Pick a random approver per employee
                    $approver = $managers->isNotEmpty() ? $managers->random() : null;

                    // Calculate leave dates (avoid weekends and vary dates per employee)
                    $baseDay = 5 + ($empIndex * 3) + ($month * 2);
                    $startCarbon = Carbon::create($currentYear, $month, min($baseDay, 28));

                    // Skip weekends for start date
                    while ($startCarbon->isWeekend()) {
                        $startCarbon->addDay();
                    }

                    // Calculate end date by counting only working days
                    // End date must be the last working day before any weekend gap
                    $endCarbon = $startCarbon->copy();
                    $workingDaysCount = 1;
                    while ($workingDaysCount < $pattern['days']) {
                        $nextDay = $endCarbon->copy()->addDay();
                        // Stop if next day is a weekend — don't span over it
                        if ($nextDay->isWeekend()) {
                            break;
                        }
                        $endCarbon->addDay();
                        $workingDaysCount++;
                    }

                    $startDate = Carbon::parse($startCarbon->format('Y-m-d'));
                    $endDate   = Carbon::parse($endCarbon->format('Y-m-d'));

                    // Count only working days (Mon-Fri), exclude weekends
                    $leaveDays = 0;
                    for ($d = $startDate->copy(); $d->lte($endDate); $d->addDay()) {
                        if (!$d->isWeekend()) {
                            $leaveDays++;
                        }
                    }

                    // Skip if no working days in range
                    if ($leaveDays === 0) {
                        continue;
                    }

                    // Check if leave application already exists
                    if (LeaveApplication::where('employee_id', $employee->id)
                        ->where('start_date', $startDate)
                        ->where('leave_type_id', $leaveType->id)
                        ->exists()
                    ) {
                        continue;
                    }

                    try {
                        LeaveApplication::create([
                            'employee_id' => $employee->id,
                            'leave_type_id' => $leaveType->id,
                            'leave_policy_id' => $leavePolicy->id,
                            'start_date' => $startDate,
                            'end_date' => $endDate,
                            'total_days' => $leaveDays,
                            'reason' => $pattern['reason'],
                            'attachment' => randomImage(),
                            'status' => $pattern['status'],
                            'manager_comments' => $pattern['status'] === 'approved' ? 'Leave approved as per company policy' : null,
                            'approved_by' => $pattern['status'] === 'approved' ? $approver?->id : null,
                            'approved_at' => $pattern['status'] === 'approved' ? now() : null,
                            'created_by' => $employee->id,
                        ]);
                    } catch (\Exception $e) {
                        $this->command->error('Failed to create leave application for employee: '.$employee->name.' in month: '.$month.' for company: '.$company->name);

                        continue;
                    }
                }
            }
        }

        $this->command->info('LeaveApplication seeder completed successfully!');
    }
}
