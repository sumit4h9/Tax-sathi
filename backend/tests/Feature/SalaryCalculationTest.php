<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\User;
use App\Models\SalaryRecord;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SalaryCalculationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        User::query()->delete();
        Attendance::query()->delete();
        SalaryRecord::query()->delete();
    }

    public function test_salary_calculation_formula_and_automatic_recalculation(): void
    {
        // 1. Create a mock admin user for authentication
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin_test@example.com',
            'role' => 'admin',
            'password' => Hash::make('password'),
        ]);

        // 2. Create a mock staff user with salary parameters using Employee model
        $staff = \App\Models\Employee::create([
            'user_id' => $admin->id,
            'name' => 'Staff User',
            'email' => 'staff_test@example.com',
            'employee_id' => 'TEST001',
            'department' => 'Engineering',
            'designation' => 'Developer',
            'salary' => 50000.00,
            'absent_deduction_per_day' => 1500.00,
            'overtime_rate_per_hour' => 200.00,
            'joining_date' => '2026-06-01',
        ]);

        $this->actingAs($admin);

        // 3. Trigger recalculation for current month (June 2026)
        $month = 6;
        $year = 2026;

        SalaryRecord::recalculate($staff->id, $month, $year);

        $record = SalaryRecord::where('employee_id', $staff->id)
            ->where('month', $month)
            ->where('year', $year)
            ->first();

        $this->assertNotNull($record);
        $this->assertEquals(0, $record->absent_days);
        $this->assertEquals(0, $record->overtime_hours);
        $this->assertEquals(50000.00, $record->final_salary);

        // 4. Create daily attendance records:
        Attendance::create([
            'employee_id' => $staff->id,
            'date' => '2026-06-01',
            'status' => 'present',
            'overtime_hours' => 0,
        ]);

        Attendance::create([
            'employee_id' => $staff->id,
            'date' => '2026-06-02',
            'status' => 'present',
            'overtime_hours' => 3, // 3 hours overtime
        ]);

        Attendance::create([
            'employee_id' => $staff->id,
            'date' => '2026-06-03',
            'status' => 'absent',
            'overtime_hours' => 0,
        ]);

        Attendance::create([
            'employee_id' => $staff->id,
            'date' => '2026-06-04',
            'status' => 'half-day',
            'overtime_hours' => 2.5, // 2.5 hours overtime
        ]);

        // Refresh record from DB
        $record = $record->fresh();

        // Calculations:
        // Absent count = 1, Half-day count = 1 => Absent days = 1 + (1 * 0.5) = 1.5 days
        // Present count = 2, Half-day count = 1 => Working days = 2 + (1 * 0.5) = 2.5 days
        // Overtime hours = 3 + 2.5 = 5.5 hours
        // Final Salary = 50000 - (1.5 * 1500) + (5.5 * 200) = 50000 - 2250 + 1100 = 48850.00
        $this->assertEquals(1.5, $record->absent_days);
        $this->assertEquals(2.5, $record->working_days);
        $this->assertEquals(5.5, $record->overtime_hours);
        $this->assertEquals(48850.00, $record->final_salary);

        // Test API Endpoints
        $response = $this->json('GET', '/api/salaries', [
            'month' => $month,
            'year' => $year,
        ]);
        $response->assertStatus(200);
        $response->assertJsonPath('data.stats.total_employees', 1);
        
        // Update Job Status
        $response = $this->json('PUT', "/api/salaries/{$record->id}", [
            'job_status' => 'Completed',
        ]);
        $response->assertStatus(200);
        $this->assertEquals('Completed', $record->fresh()->job_status);

        // Export PDF
        $response = $this->get("/api/salaries/export/pdf?month={$month}&year={$year}");
        $response->assertStatus(200);

        // Export Excel (CSV)
        $response = $this->get("/api/salaries/export/excel?month={$month}&year={$year}");
        $response->assertStatus(200);
    }
}
