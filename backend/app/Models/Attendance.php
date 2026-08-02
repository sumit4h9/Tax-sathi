<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

use App\Traits\BelongsToTenant;

class Attendance extends Model
{
    use BelongsToTenant;

    protected $fillable = ['user_id', 'employee_id', 'date', 'status', 'overtime_hours'];

    protected static function booted(): void
    {
        $recalculate = static function (Attendance $attendance) {
            Cache::forget('api.reports.dashboard');
            Cache::forget('api.dashboard.summary');

            if ($attendance->employee_id && $attendance->date) {
                $time = strtotime($attendance->date);
                if ($time) {
                    $month = (int) date('n', $time);
                    $year = (int) date('Y', $time);
                    try {
                        \App\Models\SalaryRecord::recalculate($attendance->employee_id, $month, $year);
                    } catch (\Throwable $e) {
                        // Safe to ignore
                    }
                }
            }
        };

        static::saved($recalculate);
        static::deleted($recalculate);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    /**
     * Filter by calendar month when `date` is stored as Y-m-d (MongoDB string dates).
     */
    public function scopeForMonth($query, int $month, int $year)
    {
        $start = sprintf('%04d-%02d-01', $year, $month);
        $end = sprintf('%04d-%02d-%02d', $year, $month, (int) date('t', strtotime($start)));

        return $query->where('date', '>=', $start)->where('date', '<=', $end);
    }

    public function scopeForYear($query, int $year)
    {
        return $query->where('date', '>=', "{$year}-01-01")->where('date', '<=', "{$year}-12-31");
    }

    public function scopeForDate($query, string $date)
    {
        return $query->where('date', $date);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'overtime_hours' => 'float',
        ];
    }
}
