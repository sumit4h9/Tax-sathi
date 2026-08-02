<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        $userId = $this->route('employee'); // api resource route parameter

        return [
            'name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique(User::class, 'email')->ignore($userId),
            ],
            'role' => 'sometimes|in:admin,staff',
            'employee_id' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique(User::class, 'employee_id')->ignore($userId),
            ],
            'department' => 'sometimes|string|max:255',
            'designation' => 'sometimes|string|max:255',
            'salary' => 'sometimes|numeric|min:0',
            'absent_deduction_per_day' => 'sometimes|numeric|min:0',
            'overtime_rate_per_hour' => 'sometimes|numeric|min:0',
            'joining_date' => 'sometimes|date',
        ];
    }
}
