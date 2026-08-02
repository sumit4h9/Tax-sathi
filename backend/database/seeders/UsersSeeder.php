<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Demo Admin',
                'role' => 'admin',
                'password' => Hash::make('password'),
            ]
        );

        $staff = [
            [
                'name' => 'Priya Sharma', 
                'email' => 'priya@example.com',
                'employee_id' => 'EMP001',
                'department' => 'HR',
                'designation' => 'HR Manager',
                'salary' => 45000,
                'absent_deduction_per_day' => 1500,
                'overtime_rate_per_hour' => 250,
                'joining_date' => '2025-03-01'
            ],
            [
                'name' => 'Rahul Verma', 
                'email' => 'rahul@example.com',
                'employee_id' => 'EMP002',
                'department' => 'Engineering',
                'designation' => 'Senior Developer',
                'salary' => 65000,
                'absent_deduction_per_day' => 2000,
                'overtime_rate_per_hour' => 350,
                'joining_date' => '2024-06-15'
            ],
            [
                'name' => 'Anita Patel', 
                'email' => 'anita@example.com',
                'employee_id' => 'EMP003',
                'department' => 'Marketing',
                'designation' => 'Marketing Specialist',
                'salary' => 35000,
                'absent_deduction_per_day' => 1200,
                'overtime_rate_per_hour' => 180,
                'joining_date' => '2025-01-10'
            ],
            [
                'name' => 'Vikram Singh', 
                'email' => 'vikram@example.com',
                'employee_id' => 'EMP004',
                'department' => 'Finance',
                'designation' => 'Financial Analyst',
                'salary' => 50000,
                'absent_deduction_per_day' => 1800,
                'overtime_rate_per_hour' => 300,
                'joining_date' => '2024-11-20'
            ],
            [
                'name' => 'Sneha Reddy', 
                'email' => 'sneha@example.com',
                'employee_id' => 'EMP005',
                'department' => 'Operations',
                'designation' => 'Operations Coordinator',
                'salary' => 38000,
                'absent_deduction_per_day' => 1300,
                'overtime_rate_per_hour' => 200,
                'joining_date' => '2025-05-01'
            ],
        ];

        foreach ($staff as $index => $row) {
            User::query()->updateOrCreate(
                ['email' => $row['email']],
                [
                    'name' => $row['name'],
                    'role' => 'staff',
                    'password' => Hash::make('password'),
                    'employee_id' => $row['employee_id'],
                    'department' => $row['department'],
                    'designation' => $row['designation'],
                    'salary' => $row['salary'],
                    'absent_deduction_per_day' => $row['absent_deduction_per_day'],
                    'overtime_rate_per_hour' => $row['overtime_rate_per_hour'],
                    'joining_date' => $row['joining_date'],
                ]
            );
        }
    }
}
