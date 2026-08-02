<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use App\Traits\BelongsToTenant;
use Illuminate\Support\Facades\Cache;

class Employee extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'employee_id',
        'department',
        'designation',
        'salary',
        'absent_deduction_per_day',
        'overtime_rate_per_hour',
        'joining_date',
    ];

    protected function casts(): array
    {
        return [
            'salary' => 'float',
            'absent_deduction_per_day' => 'float',
            'overtime_rate_per_hour' => 'float',
            'joining_date' => 'date',
        ];
    }

    protected static function booted(): void
    {
        static::saved(static function ($employee) {
            Cache::forget('api.reports.dashboard');
            Cache::forget('api.dashboard.summary');
            
            // Trigger recalculation for the current month
            $now = now();
            try {
                \App\Models\SalaryRecord::recalculate($employee->id, (int) $now->month, (int) $now->year);
            } catch (\Throwable $e) {
                // Safe to ignore if class/tables are not initialized yet
            }
        });
        
        static::deleted(static function () {
            Cache::forget('api.reports.dashboard');
            Cache::forget('api.dashboard.summary');
        });
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'employee_id');
    }
}
