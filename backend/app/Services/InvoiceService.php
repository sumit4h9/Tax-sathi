<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceItem;

class InvoiceService
{
    /**
     * @param  array<string, mixed>  $payload  Validated request data (firm_id, items, tax fields, etc.)
     */
    public function create(array $payload): Invoice
    {
        [$lines, $subtotal] = $this->buildLines($payload['items']);
        $tax = $this->computeTax($payload, $subtotal);
        $extras = $this->extras($payload);
        $grandTotal = $tax['total_amount'] + $extras['freight'] + $extras['cutting_charges'];
        $roundOff = round($grandTotal) - $grandTotal;
        $finalTotal = round($grandTotal);

        $invoice = Invoice::query()->create([
            'firm_id' => $payload['firm_id'],
            'direction' => $payload['direction'] ?? 'outbound',
            'tax_mode' => $payload['tax_mode'] ?? 'intra_state',
            'cgst_percent' => $tax['cgst_percent'],
            'sgst_percent' => $tax['sgst_percent'],
            'igst_percent' => $tax['igst_percent'],
            'invoice_number' => $payload['invoice_number'],
            'date' => $payload['date'],
            'subtotal' => round($subtotal, 2),
            'cgst' => $tax['cgst'],
            'sgst' => $tax['sgst'],
            'igst' => $tax['igst'],
            'freight' => $extras['freight'],
            'cutting_charges' => $extras['cutting_charges'],
            'round_off' => round($roundOff, 2),
            'total_amount' => $finalTotal,
            'seller' => $payload['seller'] ?? null,
            'customer' => $payload['customer'] ?? null,
            'meta' => $payload['meta'] ?? null,
        ]);

        $this->persistItems($invoice, $lines);

        return $invoice->fresh(['firm', 'items']);
    }

    /**
     * @param  array<string, mixed>  $payload  Validated request data
     */
    public function update(Invoice $invoice, array $payload): Invoice
    {
        [$lines, $subtotal] = $this->buildLines($payload['items']);
        $tax = $this->computeTax($payload, $subtotal, $invoice);
        $extras = $this->extras($payload);
        $grandTotal = $tax['total_amount'] + $extras['freight'] + $extras['cutting_charges'];
        $roundOff = round($grandTotal) - $grandTotal;
        $finalTotal = round($grandTotal);

        $invoice->update([
            'firm_id' => $payload['firm_id'],
            'direction' => $payload['direction'] ?? $invoice->direction ?? 'outbound',
            'tax_mode' => $payload['tax_mode'] ?? $invoice->tax_mode ?? 'intra_state',
            'cgst_percent' => $tax['cgst_percent'],
            'sgst_percent' => $tax['sgst_percent'],
            'igst_percent' => $tax['igst_percent'],
            'invoice_number' => $payload['invoice_number'],
            'date' => $payload['date'],
            'subtotal' => round($subtotal, 2),
            'cgst' => $tax['cgst'],
            'sgst' => $tax['sgst'],
            'igst' => $tax['igst'],
            'freight' => $extras['freight'],
            'cutting_charges' => $extras['cutting_charges'],
            'round_off' => round($roundOff, 2),
            'total_amount' => $finalTotal,
            'seller' => $payload['seller'] ?? null,
            'customer' => $payload['customer'] ?? null,
            'meta' => $payload['meta'] ?? null,
        ]);

        $invoice->items()->delete();
        $this->persistItems($invoice, $lines);

        return $invoice->fresh(['firm', 'items']);
    }

    /**
     * @param  array<int, array<string, mixed>>  $itemsPayload
     * @return array{0: array<int, array<string, mixed>>, 1: float}
     */
    private function buildLines(array $itemsPayload): array
    {
        $subtotal = 0.0;
        $lines = [];

        foreach ($itemsPayload as $index => $item) {
            $amount = (float) $item['quantity'] * (float) $item['rate'];
            $subtotal += $amount;
            $lines[] = [
                'sno' => $item['sno'] ?? ($index + 1),
                'description' => $item['description'],
                'quantity' => (float) $item['quantity'],
                'rate' => (float) $item['rate'],
                'amount' => round($amount, 2),
                'pl' => isset($item['pl']) ? (float) $item['pl'] : null,
                'th' => isset($item['th']) ? (float) $item['th'] : null,
                'hrs' => isset($item['hrs']) ? (float) $item['hrs'] : null,
                'set' => isset($item['set']) ? (float) $item['set'] : null,
                'total_hrs' => isset($item['total_hrs']) ? (float) $item['total_hrs'] : null,
                'hsn_sac' => $item['hsn_sac'] ?? '-',
            ];
        }

        return [$lines, $subtotal];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{cgst: float, sgst: float, igst: float, total_amount: float, cgst_percent: ?float, sgst_percent: ?float, igst_percent: ?float}
     */
    private function computeTax(array $payload, float $subtotal, ?Invoice $invoice = null): array
    {
        $taxMode = $payload['tax_mode'] ?? $invoice?->tax_mode ?? 'intra_state';
        $rates = [
            'cgst_percent' => $payload['cgst_percent'] ?? $invoice?->cgst_percent,
            'sgst_percent' => $payload['sgst_percent'] ?? $invoice?->sgst_percent,
            'igst_percent' => $payload['igst_percent'] ?? $invoice?->igst_percent,
        ];

        $tax = GstCalculator::compute((float) $subtotal, $taxMode, $rates);

        return array_merge($tax, $rates);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{freight: float, cutting_charges: float}
     */
    private function extras(array $payload): array
    {
        return [
            'freight' => round((float) ($payload['freight'] ?? 0), 2),
            'cutting_charges' => round((float) ($payload['cutting_charges'] ?? 0), 2),
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $lines
     */
    private function persistItems(Invoice $invoice, array $lines): void
    {
        foreach ($lines as $line) {
            $line['invoice_id'] = $invoice->id;
            InvoiceItem::query()->create($line);
        }
    }
}
