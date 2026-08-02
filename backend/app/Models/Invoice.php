<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

use App\Traits\BelongsToTenant;

class Invoice extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'user_id',
        'firm_id',
        'direction',
        'tax_mode',
        'cgst_percent',
        'sgst_percent',
        'igst_percent',
        'invoice_number',
        'date',
        'subtotal',
        'cgst',
        'sgst',
        'igst',
        'total_amount',
        'pdf_path',
        'seller',
        'customer',
        'meta',
        'freight',
        'cutting_charges',
        'round_off',
    ];

    protected static function booted(): void
    {
        static::saved(static function () {
            Cache::forget('api.reports.dashboard');
            Cache::forget('api.dashboard.summary');
        });
        static::deleted(static function () {
            Cache::forget('api.reports.dashboard');
            Cache::forget('api.dashboard.summary');
        });
    }

    public function firm()
    {
        return $this->belongsTo(Firm::class);
    }

    public function scopeForMonth($query, int $month, int $year)
    {
        $start = sprintf('%04d-%02d-01', $year, $month);
        $end = sprintf('%04d-%02d-%02d', $year, $month, (int) date('t', strtotime($start)));

        return $query->where('date', '>=', $start)->where('date', '<=', $end);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'subtotal' => 'float',
            'cgst' => 'float',
            'sgst' => 'float',
            'igst' => 'float',
            'total_amount' => 'float',
            'cgst_percent' => 'float',
            'sgst_percent' => 'float',
            'igst_percent' => 'float',
            'freight' => 'float',
            'cutting_charges' => 'float',
            'round_off' => 'float',
            'seller' => 'array',
            'customer' => 'array',
            'meta' => 'array',
        ];
    }
}
