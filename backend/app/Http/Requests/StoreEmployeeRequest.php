<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique(User::class, 'email')],
            'role' => 'required|in:admin,staff',
            'employee_id' => ['required', 'string', 'max:255', Rule::unique(User::class, 'employee_id')],
            'department' => 'required|string|max:255',
            'designation' => 'required|string|max:255',
            'salary' => 'required|numeric|min:0',
            'absent_deduction_per_day' => 'required|numeric|min:0',
            'overtime_rate_per_hour' => 'required|numeric|min:0',
            'joining_date' => 'required|date',
        ];
    }
}
