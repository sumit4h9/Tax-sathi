<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\User;
use Illuminate\Database\Seeder;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::query()->pluck('id');
        $statuses = ['present', 'present', 'present', 'absent', 'half-day'];
        $start = now()->startOfMonth();
        $end = now();

        foreach ($users as $userId) {
            for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
                if ($date->isWeekend()) {
                    continue;
                }

                $status = $statuses[array_rand($statuses)];
                $overtime = $status === 'present' && random_int(0, 4) === 0
                    ? random_int(0, 3)
                    : 0;

                Attendance::query()->updateOrCreate(
                    [
                        'user_id' => $userId,
                        'date' => $date->toDateString(),
                    ],
                    [
                        'status' => $status,
                        'overtime_hours' => $overtime,
                    ]
                );
            }
        }
    }
}
