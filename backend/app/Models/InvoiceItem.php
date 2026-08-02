<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class InvoiceItem extends Model
{
    protected $fillable = [
        'invoice_id',
        'description',
        'quantity',
        'rate',
        'amount',
        'sno',
        'pl',
        'th',
        'hrs',
        'set',
        'total_hrs',
        'hsn_sac',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rate' => 'float',
            'amount' => 'float',
            'quantity' => 'float',
            'pl' => 'float',
            'th' => 'float',
            'hrs' => 'float',
            'set' => 'float',
            'total_hrs' => 'float',
        ];
    }
}
