<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvoiceResource;
use App\Models\Attendance;
use App\Models\Invoice;
use App\Models\Employee;
use App\Models\SalaryRecord;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function summary()
    {
        $payload = Cache::remember('api.dashboard.summary', now()->addMinutes(15), function () {
            $now = now();
            $month = (int) $now->month;
            $year = (int) $now->year;
            $daysInMonth = (int) $now->daysInMonth;

            $employeeCount = Employee::query()->count();
            $totalInvoices = Invoice::query()->count();

            $revenueQuery = Invoice::query()->where(function ($q) {
                $q->where('direction', 'outbound')->orWhereNull('direction');
            });

            $totalRevenue = round((float) $revenueQuery->sum('total_amount'), 2);

            $monthAttendance = Attendance::query()
                ->forMonth($month, $year)
                ->get();

            $presentDays = $monthAttendance->where('status', 'present')->count()
                + ($monthAttendance->where('status', 'half-day')->count() * 0.5);

            $totalWorkingSlots = max(1, $employeeCount * $daysInMonth);
            $attendancePercentage = round(($presentDays / $totalWorkingSlots) * 100, 1);

            $recent = Invoice::query()
                ->with('firm')
                ->orderByDesc('date')
                ->orderByDesc('id')
                ->limit(5)
                ->get();

            // Calculate salary stats for current month
            // Make sure all employees have a salary record recalculated
            $employees = Employee::all();
            foreach ($employees as $emp) {
                $exists = SalaryRecord::where('employee_id', $emp->id)
                    ->where('month', $month)
                    ->where('year', $year)
                    ->exists();
                if (!$exists) {
                    SalaryRecord::recalculate($emp->id, $month, $year);
                }
            }

            $currentSalaries = SalaryRecord::query()
                ->with('employee')
                ->where('month', $month)
                ->where('year', $year)
                ->get();

            $completedJobs = $currentSalaries->where('job_status', 'Completed')->count();
            $inProgressJobs = $currentSalaries->where('job_status', 'In Progress')->count();
            $totalPayroll = (float) $currentSalaries->where('job_status', 'Completed')->sum('final_salary');

            $totalOvertimePayments = 0.0;
            foreach ($currentSalaries->where('job_status', 'Completed') as $rec) {
                $rate = (float) ($rec->employee->overtime_rate_per_hour ?? 0);
                $totalOvertimePayments += $rec->overtime_hours * $rate;
            }

            $totalDeductions = 0.0;
            foreach ($currentSalaries->where('job_status', 'Completed') as $rec) {
                $deduction = (float) ($rec->employee->absent_deduction_per_day ?? 0);
                $totalDeductions += $rec->absent_days * $deduction;
            }

            return [
                'total_invoices' => $totalInvoices,
                'total_employees' => $employeeCount,
                'attendance_percentage_this_month' => min(100, $attendancePercentage),
                'total_revenue' => $totalRevenue,
                'completed_jobs' => $completedJobs,
                'in_progress_jobs' => $inProgressJobs,
                'total_payroll' => round($totalPayroll, 2),
                'total_overtime_payments' => round($totalOvertimePayments, 2),
                'total_deductions' => round($totalDeductions, 2),
                'recent_invoices' => InvoiceResource::collection($recent)->resolve(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $payload,
            'message' => '',
        ]);
    }
}
