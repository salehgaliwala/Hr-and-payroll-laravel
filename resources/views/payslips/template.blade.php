<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Payslip - {{ $payrollEntry->employee->name }}</title>
    <style>
        body {
            font-family: "DejaVu Sans", sans-serif;
            font-size: 11px;
            margin: 0;
            padding: 20px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #333;
            padding: 0;
        }

        .header {
            text-align: center;
            padding: 15px;
            border-bottom: 2px solid #333;
        }

        .company-name {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .payslip-title {
            font-size: 14px;
            font-weight: bold;
            margin-top: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th, td {
            border: 1px solid #ccc;
            padding: 6px 8px;
            text-align: left;
        }

        th {
            font-weight: bold;
            background-color: #fafafa;
        }

        .section-header {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .amount {
            text-align: right;
        }

        .total-row {
            font-weight: bold;
            background-color: #f5f5f5;
        }

        .net-salary-row {
            font-weight: bold;
            font-size: 13px;
            background-color: #f0f0f0;
        }

        .deduction-row {
            color: #000;
        }

        .earning-row {
            color: #000;
        }

        .highlight {
            background-color: #fffde7;
        }

        .footer {
            text-align: center;
            padding: 10px;
            font-size: 10px;
            border-top: 1px solid #ccc;
            color: #666;
        }

        .formula-box {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 8px 12px;
            margin: 0;
            font-size: 10px;
            color: #495057;
        }
    </style>
</head>

<body>
    <div class="container" id="payslip-content">

        {{-- ===== HEADER ===== --}}
        <div class="header">
            <div class="company-name">
                {{ isset($companySettings['titleText']) ? $companySettings['titleText'] : config('app.name', 'HRM') }}
            </div>
            @if(isset($companySettings['companyAddress']))
                <div style="font-size: 10px; margin-top: 4px;">{{ $companySettings['companyAddress'] }}</div>
            @endif
            <div style="font-size: 10px; margin-top: 3px;">
                @if(isset($companySettings['companyEmail'])) Email: {{ $companySettings['companyEmail'] }} @endif
                @if(isset($companySettings['companyMobile'])) | Phone: {{ $companySettings['companyMobile'] }} @endif
            </div>
            <div class="payslip-title">Salary Slip</div>
            <div style="font-size: 11px; margin-top: 4px;">
                {{ $payrollEntry->payrollRun->pay_period_start->format('F Y') }}
            </div>
        </div>

        {{-- ===== EMPLOYEE INFORMATION ===== --}}
        <table>
            <tr>
                <th colspan="4" class="section-header">Employee Information</th>
            </tr>
            <tr>
                <td width="20%"><strong>Employee Name</strong></td>
                <td width="30%">{{ $payrollEntry->employee->name }}</td>
                <td width="20%"><strong>Employee ID</strong></td>
                <td width="30%">{{ $employeeData->employee_id ?? $payrollEntry->employee->id }}</td>
            </tr>
            <tr>
                <td><strong>Email</strong></td>
                <td>{{ $payrollEntry->employee->email }}</td>
                <td><strong>Pay Period</strong></td>
                <td>
                    {{ $payrollEntry->payrollRun->pay_period_start->format('d M Y') }} -
                    {{ $payrollEntry->payrollRun->pay_period_end->format('d M Y') }}
                </td>
            </tr>
            <tr>
                <td><strong>Pay Date</strong></td>
                <td>{{ $payrollEntry->payrollRun->pay_date->format('d M Y') }}</td>
                <td><strong>Generated On</strong></td>
                <td>{{ now()->format('d M Y') }}</td>
            </tr>
            @if(isset($employeeData->bank_name) || isset($employeeData->account_number))
                <tr>
                    <td><strong>Bank Name</strong></td>
                    <td>{{ $employeeData->bank_name ?? 'N/A' }}</td>
                    <td><strong>Account Number</strong></td>
                    <td>{{ $employeeData->account_number ?? 'N/A' }}</td>
                </tr>
            @endif
        </table>

        {{-- ===== ATTENDANCE SUMMARY ===== --}}
        @if($payrollEntry->working_days > 0)
        @php
            $presentDays     = $payrollEntry->present_days ?? 0;       // full + (half × 0.5)
            $fullPresent     = $payrollEntry->full_present_days ?? 0;
            $halfDays        = $payrollEntry->half_days ?? 0;
            $holidayDays     = $payrollEntry->holiday_days ?? 0;
            $paidLeaveDays   = $payrollEntry->paid_leave_days ?? 0;
            $unpaidLeaveDays = $payrollEntry->unpaid_leave_days ?? 0;
            $absentDays      = $payrollEntry->absent_days ?? 0;
            $lopDays         = $payrollEntry->lop_days ?? 0;
            $effectivePaid   = $payrollEntry->effective_paid_days ?? 0;
        @endphp
        <table>
            <tr>
                <th colspan="8" class="section-header">Attendance Summary</th>
            </tr>
            <tr>
                <th style="text-align:center;">Working Days</th>
                <th style="text-align:center;">Full Present</th>
                <th style="text-align:center;">Half Days</th>
                <th style="text-align:center;">Holidays</th>
                <th style="text-align:center;">Paid Leave</th>
                <th style="text-align:center;">Unpaid Leave</th>
                <th style="text-align:center;">Absent</th>
                <th style="text-align:center;">LOP Days</th>
            </tr>
            <tr>
                <td style="text-align:center;">{{ $payrollEntry->working_days }}</td>
                <td style="text-align:center;">{{ $fullPresent }}</td>
                <td style="text-align:center;">{{ $halfDays }}</td>
                <td style="text-align:center;">{{ $holidayDays }}</td>
                <td style="text-align:center;">{{ $paidLeaveDays }}</td>
                <td style="text-align:center;">{{ $unpaidLeaveDays }}</td>
                <td style="text-align:center;">{{ $absentDays }}</td>
                <td style="text-align:center; font-weight:bold;">{{ $lopDays }}</td>
            </tr>
            <tr class="highlight">
                <td colspan="8">
                    <strong>Present Days</strong> (Full Present + Holidays + Paid Leave + Half Days × 0.5) = <strong>{{ $presentDays }}</strong>
                </td>
            </tr>
            @if($payrollEntry->overtime_hours > 0)
            <tr>
                <td colspan="8">
                    <strong>Overtime:</strong> {{ number_format($payrollEntry->overtime_hours, 2) }} hrs
                    = {{ formatCurrency($payrollEntry->overtime_amount) }}
                </td>
            </tr>
            @endif
        </table>
        @endif

        {{-- ===== SALARY DETAILS ===== --}}
        @php
            $earnings   = $payrollEntry->earnings_breakdown ?? [];
            $deductions = $payrollEntry->deductions_breakdown ?? [];

            // Add overtime to earnings if exists
            if ($payrollEntry->overtime_amount > 0) {
                $earnings['Overtime Amount'] = $payrollEntry->overtime_amount;
            }

            // Add LOP deduction to deductions
            $lopDeduction = $payrollEntry->lop_deduction ?? 0;
            if ($lopDeduction > 0) {
                $deductions['LOP Deduction (' . $lopDays . ' days)'] = $lopDeduction;
            }

            // Add unpaid leave deduction to deductions
            $unpaidLeaveDeduction = $payrollEntry->unpaid_leave_deduction ?? 0;
            if ($unpaidLeaveDeduction > 0) {
                $deductions['Unpaid Leave Deduction'] = $unpaidLeaveDeduction;
            }

            $maxRows        = max(count($earnings), count($deductions), 1);
            $earningsKeys   = array_keys($earnings);
            $deductionsKeys = array_keys($deductions);

            // Total earnings = basic + components + overtime (from breakdown)
            $totalEarningsDisplay = array_sum($earnings);

            // Total deductions = component deductions + LOP + unpaid leave
            $totalDeductionsDisplay = array_sum($deductions);
        @endphp

        <table>
            <tr>
                <th colspan="4" class="section-header">Salary Details</th>
            </tr>
            <tr>
                <th width="40%">Earnings</th>
                <th width="10%" class="amount">Amount</th>
                <th width="40%">Deductions</th>
                <th width="10%" class="amount">Amount</th>
            </tr>

            @for($i = 0; $i < $maxRows; $i++)
            <tr>
                <td class="{{ isset($earningsKeys[$i]) ? 'earning-row' : '' }}">
                    {{ $earningsKeys[$i] ?? '' }}
                </td>
                <td class="amount earning-row">
                    {{ isset($earningsKeys[$i]) ? formatCurrency($earnings[$earningsKeys[$i]]) : '' }}
                </td>
                <td class="{{ isset($deductionsKeys[$i]) ? 'deduction-row' : '' }}">
                    {{ $deductionsKeys[$i] ?? '' }}
                </td>
                <td class="amount deduction-row">
                    {{ isset($deductionsKeys[$i]) ? formatCurrency($deductions[$deductionsKeys[$i]]) : '' }}
                </td>
            </tr>
            @endfor

            <tr class="total-row">
                <td><strong>Total Earnings</strong></td>
                <td class="amount"><strong>{{ formatCurrency($totalEarningsDisplay) }}</strong></td>
                <td><strong>Total Deductions</strong></td>
                <td class="amount"><strong>{{ formatCurrency($totalDeductionsDisplay) }}</strong></td>
            </tr>
        </table>

        {{-- ===== GROSS & NET SUMMARY ===== --}}
        <table>
            <tr>
                <th colspan="2" class="section-header">Salary Summary</th>
            </tr>
            <tr>
                <td width="70%">
                    <strong>Gross Pay</strong>
                    <span style="font-size:10px; color:#666;">
                        (Total Earnings - LOP Deduction - Unpaid Leave Deduction + Overtime)
                    </span>
                </td>
                <td class="amount"><strong>{{ formatCurrency($payrollEntry->gross_pay) }}</strong></td>
            </tr>
            <tr class="deduction-row">
                <td>
                    <strong>Component Deductions</strong>
                    <span style="font-size:10px; color:#666;">(Tax, PF, Insurance etc.)</span>
                </td>
                <td class="amount"><strong>{{ formatCurrency($payrollEntry->total_deductions) }}</strong></td>
            </tr>
            <tr class="net-salary-row">
                <td><strong>Net Salary (Take Home)</strong></td>
                <td class="amount"><strong>{{ formatCurrency($payrollEntry->net_pay) }}</strong></td>
            </tr>
        </table>

        {{-- ===== FOOTER ===== --}}
        <div class="footer">
            <p><strong>This is a computer-generated payslip and does not require a signature.</strong></p>
            <p>For any queries, please contact the HR department.</p>
        </div>

    </div>
</body>

<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
<script>
    window.addEventListener('load', function () {
        var element = document.querySelector('.container');
        var filename = 'payslip-{{ $payrollEntry->employee->name }}-{{ $payrollEntry->payrollRun->pay_period_start->format("M-Y") }}.pdf';
        var opt = {
            margin: 0.3,
            filename: filename,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2, dpi: 192, letterRendering: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save().then(function () {
            setTimeout(function () {
                window.location.href = '{{ route('hr.payslips.index') }}';
            }, 1000);
        });
    });
</script>

</html>
