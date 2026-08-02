<?php

namespace Database\Seeders;

use App\Models\Firm;
use App\Models\Invoice;
use App\Services\InvoiceService;
use Illuminate\Database\Seeder;

class InvoicesSeeder extends Seeder
{
    public function run(): void
    {
        $service = app(InvoiceService::class);
        $firms = Firm::query()->pluck('id')->all();

        if ($firms === []) {
            return;
        }

        $samples = [
            [
                'invoice_number' => 'INV-2026-1001',
                'date' => now()->subDays(2)->toDateString(),
                'direction' => 'outbound',
                'tax_mode' => 'intra_state',
                'cgst_percent' => 9,
                'sgst_percent' => 9,
                'items' => [
                    ['description' => 'Web development services', 'quantity' => 1, 'rate' => 45000],
                    ['description' => 'Hosting (annual)', 'quantity' => 1, 'rate' => 12000],
                ],
            ],
            [
                'invoice_number' => 'INV-2026-1002',
                'date' => now()->subDays(5)->toDateString(),
                'direction' => 'outbound',
                'tax_mode' => 'inter_state',
                'igst_percent' => 18,
                'items' => [
                    ['description' => 'GST consulting', 'quantity' => 10, 'rate' => 2500],
                ],
            ],
            [
                'invoice_number' => 'INV-2026-1003',
                'date' => now()->subDays(8)->toDateString(),
                'direction' => 'outbound',
                'tax_mode' => 'intra_state',
                'cgst_percent' => 9,
                'sgst_percent' => 9,
                'items' => [
                    ['description' => 'Office supplies', 'quantity' => 5, 'rate' => 1800],
                    ['description' => 'Printer cartridges', 'quantity' => 4, 'rate' => 950],
                ],
            ],
            [
                'invoice_number' => 'INV-2026-1004',
                'date' => now()->subDays(12)->toDateString(),
                'direction' => 'inbound',
                'tax_mode' => 'intra_state',
                'cgst_percent' => 9,
                'sgst_percent' => 9,
                'items' => [
                    ['description' => 'Raw materials purchase', 'quantity' => 20, 'rate' => 3200],
                ],
            ],
            [
                'invoice_number' => 'INV-2026-1005',
                'date' => now()->subDay()->toDateString(),
                'direction' => 'outbound',
                'tax_mode' => 'intra_state',
                'cgst_percent' => 9,
                'sgst_percent' => 9,
                'items' => [
                    ['description' => 'Annual maintenance contract', 'quantity' => 1, 'rate' => 85000],
                ],
            ],
            [
                'invoice_number' => 'INV-2026-1006',
                'date' => now()->toDateString(),
                'direction' => 'outbound',
                'tax_mode' => 'intra_state',
                'cgst_percent' => 9,
                'sgst_percent' => 9,
                'items' => [
                    ['description' => 'Training workshop', 'quantity' => 2, 'rate' => 15000],
                ],
            ],
        ];

        foreach ($samples as $index => $sample) {
            if (Invoice::query()->where('invoice_number', $sample['invoice_number'])->exists()) {
                continue;
            }
            $firmId = $firms[$index % count($firms)];
            $payload = array_merge($sample, ['firm_id' => $firmId]);
            $service->create($payload);
        }
    }
}
