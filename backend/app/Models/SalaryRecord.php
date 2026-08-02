<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

use App\Traits\BelongsToTenant;

class SalaryRecord extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'user_id',
        'employee_id',
        'month',
        'year',
        'absent_days',
        'overtime_hours',
        'final_salary',
        'working_days',
        'job_status',
    ];

    protected function casts(): array
    {
        return [
            'month' => 'integer',
            'year' => 'integer',
            'absent_days' => 'float',
            'overtime_hours' => 'float',
            'final_salary' => 'float',
            'working_days' => 'float',
        ];
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    /**
     * Recalculate salary for the given employee, month, and year.
     */
    public static function recalculate(string $employeeId, int $month, int $year): ?self
    {
        // Get employee using Employee model (TenantScope applies automatically if authenticated)
        $employee = Employee::find($employeeId);
        if (!$employee) {
            return null;
        }

        // Fetch attendances for this month and year
        $attendances = Attendance::query()
            ->where('employee_id', $employeeId)
            ->forMonth($month, $year)
            ->get();

        $presentCount = $attendances->where('status', 'present')->count();
        $absentCount = $attendances->where('status', 'absent')->count();
        $halfDayCount = $attendances->where('status', 'half-day')->count();
        $overtimeHours = (float) $attendances->sum('overtime_hours');

        // Absent days = absent count + 0.5 * half-day count
        $absentDays = $absentCount + ($halfDayCount * 0.5);
        
        // Working days = present count + 0.5 * half-day count
        $workingDays = $presentCount + ($halfDayCount * 0.5);

        // Salary variables
        $salary = (float) ($employee->salary ?? 0);
        $deductionPerDay = (float) ($employee->absent_deduction_per_day ?? 0);
        $overtimeRate = (float) ($employee->overtime_rate_per_hour ?? 0);

        // Formula: Final Salary = Monthly Salary - (Absent Days * Per Day Absent Deduction) + (Overtime Hours * Per Hour Overtime Amount)
        $finalSalary = $salary - ($absentDays * $deductionPerDay) + ($overtimeHours * $overtimeRate);
        if ($finalSalary < 0) {
            $finalSalary = 0.0;
        }

        // Update or create the salary record manually to avoid insertOrIgnore
        $record = self::where('employee_id', $employeeId)
            ->where('month', $month)
            ->where('year', $year)
            ->first();

        if ($record) {
            $record->update([
                'absent_days' => $absentDays,
                'overtime_hours' => $overtimeHours,
                'final_salary' => $finalSalary,
                'working_days' => $workingDays,
            ]);
        } else {
            $record = self::create([
                'employee_id' => $employeeId,
                'month' => $month,
                'year' => $year,
                'absent_days' => $absentDays,
                'overtime_hours' => $overtimeHours,
                'final_salary' => $finalSalary,
                'working_days' => $workingDays,
            ]);
        }

        return $record;
    }
}
