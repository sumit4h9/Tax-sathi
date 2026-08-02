<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Http\Resources\UserResource;
use App\Models\Attendance;
use App\Models\User;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function index()
    {
        // TenantScope automatically limits this to the logged-in user's employees.
        $employees = \App\Models\Employee::query()
            ->orderBy('name')
            ->get();

        return UserResource::collection($employees);
    }

    public function store(StoreEmployeeRequest $request)
    {
        $employee = \App\Models\Employee::query()->create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'employee_id' => $request->validated('employee_id'),
            'department' => $request->validated('department'),
            'designation' => $request->validated('designation'),
            'salary' => $request->validated('salary'),
            'absent_deduction_per_day' => $request->validated('absent_deduction_per_day'),
            'overtime_rate_per_hour' => $request->validated('overtime_rate_per_hour'),
            'joining_date' => $request->validated('joining_date'),
        ]);

        return response()->json((new UserResource($employee))->resolve(), 201);
    }

    public function show(string $employeeId)
    {
        $employee = \App\Models\Employee::query()->findOrFail($employeeId);

        return response()->json((new UserResource($employee))->resolve());
    }

    public function update(UpdateEmployeeRequest $request, string $employeeId)
    {
        $employee = \App\Models\Employee::query()->findOrFail($employeeId);

        $employee->fill($request->validated());
        $employee->save();

        return response()->json((new UserResource($employee))->resolve());
    }

    public function destroy(Request $request, string $employeeId)
    {
        $employee = \App\Models\Employee::query()->findOrFail($employeeId);

        Attendance::query()->where('employee_id', (string) $employee->id)->delete();
        \App\Models\SalaryRecord::query()->where('employee_id', (string) $employee->id)->delete();
        $employee->delete();

        return response()->json(['message' => 'Employee removed']);
    }
}
