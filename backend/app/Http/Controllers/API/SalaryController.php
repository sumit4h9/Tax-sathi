<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\SalaryRecord;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use App\Services\SnsService;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SalaryController extends Controller
{
    /**
     * Get all salary records and summary statistics for a selected month/year.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'month' => ['required', 'integer', 'min:1', 'max:12'],
            'year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'search' => ['nullable', 'string'],
        ]);

        $month = $request->integer('month');
        $year = $request->integer('year');
        $search = $request->input('search');

        // Ensure all active employees have a salary record for this month/year
        $employees = Employee::query()->get();
        foreach ($employees as $emp) {
            $exists = SalaryRecord::where('employee_id', $emp->id)
                ->where('month', $month)
                ->where('year', $year)
                ->exists();
            if (!$exists) {
                SalaryRecord::recalculate($emp->id, $month, $year);
            }
        }

        // Query salary records
        $query = SalaryRecord::query()
            ->with(['employee'])
            ->where('month', $month)
            ->where('year', $year);

        // Apply Search Filter
        if (!empty($search)) {
            $query->whereHas('employee', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%")
                  ->orWhere('department', 'like', "%{$search}%");
            });
        }

        $records = $query->get();

        // Calculate statistics over ALL records for this month/year (or completed ones for payroll)
        $allMonthRecords = SalaryRecord::query()
            ->with(['employee'])
            ->where('month', $month)
            ->where('year', $year)
            ->get();

        $totalEmployees = $employees->count();
        $completedJobs = $allMonthRecords->where('job_status', 'Completed')->count();
        $inProgressJobs = $allMonthRecords->where('job_status', 'In Progress')->count();

        // Total Payroll (Final Salary of completed jobs)
        $totalPayroll = (float) $allMonthRecords->where('job_status', 'Completed')->sum('final_salary');

        // Total Overtime Payments (for completed jobs)
        $totalOvertimePayments = 0.0;
        foreach ($allMonthRecords->where('job_status', 'Completed') as $rec) {
            $rate = (float) ($rec->employee->overtime_rate_per_hour ?? 0);
            $totalOvertimePayments += $rec->overtime_hours * $rate;
        }

        // Total Deductions (for completed jobs)
        $totalDeductions = 0.0;
        foreach ($allMonthRecords->where('job_status', 'Completed') as $rec) {
            $deduction = (float) ($rec->employee->absent_deduction_per_day ?? 0);
            $totalDeductions += $rec->absent_days * $deduction;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'records' => $records,
                'stats' => [
                    'total_employees' => $totalEmployees,
                    'completed_jobs' => $completedJobs,
                    'in_progress_jobs' => $inProgressJobs,
                    'total_payroll' => round($totalPayroll, 2),
                    'total_overtime_payments' => round($totalOvertimePayments, 2),
                    'total_deductions' => round($totalDeductions, 2),
                ]
            ],
            'message' => ''
        ]);
    }

    /**
     * Update the job completion status of a salary record.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'job_status' => ['required', 'string', 'in:Completed,In Progress'],
        ]);

        $record = SalaryRecord::findOrFail($id);
        $record->job_status = $request->input('job_status');
        $record->save();

        return response()->json([
            'success' => true,
            'data' => $record->load('employee'),
            'message' => 'Status updated successfully'
        ]);
    }

    /**
     * Get individual salary details and history for an employee.
     */
    public function employeeDetail(string $employeeId): JsonResponse
    {
        $employee = Employee::findOrFail($employeeId);

        $records = SalaryRecord::query()
            ->where('employee_id', $employeeId)
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'employee' => $employee,
                'history' => $records
            ],
            'message' => ''
        ]);
    }

    /**
     * Export completed monthly salary report to PDF.
     */
    public function exportPdf(Request $request)
    {
        $request->validate([
            'month' => ['required', 'integer', 'min:1', 'max:12'],
            'year' => ['required', 'integer', 'min:2000', 'max:2100'],
        ]);

        $month = $request->integer('month');
        $year = $request->integer('year');

        $records = SalaryRecord::query()
            ->with(['employee'])
            ->where('month', $month)
            ->where('year', $year)
            ->where('job_status', 'Completed')
            ->get();

        $monthName = date('F', mktime(0, 0, 0, $month, 10));

        $totalPayroll = (float) $records->sum('final_salary');
        $totalOvertime = 0.0;
        $totalDeductions = 0.0;

        foreach ($records as $r) {
            $totalOvertime += $r->overtime_hours * (float) ($r->employee->overtime_rate_per_hour ?? 0);
            $totalDeductions += $r->absent_days * (float) ($r->employee->absent_deduction_per_day ?? 0);
        }

        $pdf = Pdf::loadView('pdf.salary_report', [
            'records' => $records,
            'month' => $month,
            'year' => $year,
            'monthName' => $monthName,
            'totalPayroll' => $totalPayroll,
            'totalOvertime' => $totalOvertime,
            'totalDeductions' => $totalDeductions,
        ]);

        $filename = "Salary_Report_{$monthName}_{$year}.pdf";
        $s3Path = "salaries/{$year}/{$monthName}/{$filename}";

        if (config('filesystems.default') === 's3' || request()->boolean('s3')) {
            Storage::disk('s3')->put($s3Path, $pdf->output(), 'private');

            $snsTopic = config('services.sns.topic_arn');
            if ($snsTopic) {
                app(SnsService::class)->publishToTopic(
                    $snsTopic,
                    "Salary Report PDF Generated: {$monthName} {$year}",
                    "Salary Report for {$monthName} {$year} (Total Payroll: ₹{$totalPayroll}) PDF uploaded to S3 path: {$s3Path}"
                );
            }

            $presignedUrl = Storage::disk('s3')->temporaryUrl($s3Path, now()->addMinutes(30));

            return response()->json([
                'message' => 'Salary Report PDF uploaded to AWS S3 successfully',
                'download_url' => $presignedUrl,
                's3_path' => $s3Path,
            ]);
        }

        return $pdf->download($filename);
    }

    /**
     * Export completed monthly salary report to CSV/Excel.
     */
    public function exportExcel(Request $request): StreamedResponse
    {
        $request->validate([
            'month' => ['required', 'integer', 'min:1', 'max:12'],
            'year' => ['required', 'integer', 'min:2000', 'max:2100'],
        ]);

        $month = $request->integer('month');
        $year = $request->integer('year');
        $monthName = date('F', mktime(0, 0, 0, $month, 10));

        $records = SalaryRecord::query()
            ->with(['employee'])
            ->where('month', $month)
            ->where('year', $year)
            ->where('job_status', 'Completed')
            ->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=Salary_Report_{$monthName}_{$year}.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use ($records) {
            $file = fopen('php://output', 'w');
            
            // Header rows
            fputcsv($file, ['Employee ID', 'Employee Name', 'Department', 'Designation', 'Monthly Salary (INR)', 'Absent Days', 'Overtime Hours', 'Final Salary (INR)']);

            foreach ($records as $row) {
                fputcsv($file, [
                    $row->employee->employee_id ?? '—',
                    $row->employee->name ?? '—',
                    $row->employee->department ?? '—',
                    $row->employee->designation ?? '—',
                    $row->employee->salary ?? 0,
                    $row->absent_days,
                    $row->overtime_hours,
                    $row->final_salary
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
