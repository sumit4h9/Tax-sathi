<?php

namespace Database\Seeders;

use App\Models\Firm;
use Illuminate\Database\Seeder;

class FirmsSeeder extends Seeder
{
    public function run(): void
    {
        $firms = [
            [
                'name' => 'Acme Corporation',
                'gstin' => '22AAAAA0000A1Z5',
                'address' => '123 Business Park, Mumbai, MH',
                'phone' => '+91 98765 43210',
            ],
            [
                'name' => 'Bright Retail Pvt Ltd',
                'gstin' => '27BBBBB1111B2Z6',
                'address' => '45 MG Road, Pune, MH',
                'phone' => '+91 91234 56780',
            ],
            [
                'name' => 'Nova Tech Solutions',
                'gstin' => '29CCCCC2222C3Z7',
                'address' => '88 IT Hub, Bengaluru, KA',
                'phone' => '+91 99887 76655',
            ],
        ];

        foreach ($firms as $firm) {
            Firm::query()->firstOrCreate(['name' => $firm['name']], $firm);
        }
    }
}
