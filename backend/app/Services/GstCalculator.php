<?php

namespace App\Services;

/**
 * Computes GST amounts from subtotal and configured percentages.
 * intra_state: CGST + SGST on subtotal
 * inter_state: IGST on subtotal
 */
class GstCalculator
{
    /**
     * @param  array{cgst_percent?: float, sgst_percent?: float, igst_percent?: float}  $rates
     * @return array{cgst: float, sgst: float, igst: float, total_amount: float}
     */
    public static function compute(float $subtotal, string $taxMode, array $rates): array
    {
        $cgstPct = (float) ($rates['cgst_percent'] ?? 9);
        $sgstPct = (float) ($rates['sgst_percent'] ?? 9);
        $igstPct = (float) ($rates['igst_percent'] ?? 18);

        if ($taxMode === 'inter_state') {
            $igst = round($subtotal * ($igstPct / 100), 2);

            return [
                'cgst' => 0.0,
                'sgst' => 0.0,
                'igst' => $igst,
                'total_amount' => round($subtotal + $igst, 2),
            ];
        }

        $cgst = round($subtotal * ($cgstPct / 100), 2);
        $sgst = round($subtotal * ($sgstPct / 100), 2);

        return [
            'cgst' => $cgst,
            'sgst' => $sgst,
            'igst' => 0.0,
            'total_amount' => round($subtotal + $cgst + $sgst, 2),
        ];
    }
}
