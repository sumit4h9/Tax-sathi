<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

use App\Traits\BelongsToTenant;

class Firm extends Model
{
    use BelongsToTenant;

    protected $fillable = ['user_id', 'name', 'gstin', 'address', 'phone'];

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
}
