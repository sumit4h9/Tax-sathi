<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('status') && is_string($this->input('status'))) {
            $this->merge([
                'status' => strtolower(str_replace('_', '-', $this->input('status'))),
            ]);
        }
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'employee_id' => ['sometimes', 'string', Rule::exists(\App\Models\Employee::class, 'id')],
            'user_id' => ['sometimes', 'string', Rule::exists(\App\Models\Employee::class, 'id')], // Fallback
            'date' => ['required', 'date'],
            'status' => ['required', 'in:present,absent,half-day'],
            'overtime_hours' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
        ];
    }
}
