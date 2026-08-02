<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkMarkAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $records = $this->input('records', []);

        if (! is_array($records)) {
            return;
        }

        $normalized = array_map(static function ($row) {
            if (! is_array($row)) {
                return $row;
            }

            if (! isset($row['employee_id']) && isset($row['user_id'])) {
                $row['employee_id'] = $row['user_id'];
            }

            if (isset($row['status']) && is_string($row['status'])) {
                $row['status'] = strtolower(str_replace('_', '-', $row['status']));
            }

            return $row;
        }, $records);

        $this->merge(['records' => $normalized]);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.employee_id' => ['required', 'string', Rule::exists(\App\Models\Employee::class, 'id')],
            'records.*.status' => ['required', 'in:present,absent,half-day'],
            'records.*.overtime_hours' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
        ];
    }
}
