<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\User */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'employee_id' => $this->employee_id,
            'department' => $this->department,
            'designation' => $this->designation,
            'salary' => $this->salary,
            'absent_deduction_per_day' => $this->absent_deduction_per_day,
            'overtime_rate_per_hour' => $this->overtime_rate_per_hour,
            'joining_date' => $this->joining_date ? $this->joining_date->toDateString() : null,
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
