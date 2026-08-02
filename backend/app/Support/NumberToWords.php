<?php

namespace App\Support;

class NumberToWords
{
    private const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

    private const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    private const TEENS = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    public static function convert(int $num): string
    {
        if ($num === 0) {
            return 'Zero';
        }

        $words = '';

        if ($num >= 10000000) {
            $words .= self::convert(intdiv($num, 10000000)).' Crore ';
            $num %= 10000000;
        }
        if ($num >= 100000) {
            $words .= self::convert(intdiv($num, 100000)).' Lakh ';
            $num %= 100000;
        }
        if ($num >= 1000) {
            $words .= self::convert(intdiv($num, 1000)).' Thousand ';
            $num %= 1000;
        }
        if ($num >= 100) {
            $words .= self::ONES[intdiv($num, 100)].' Hundred ';
            $num %= 100;
        }
        if ($num >= 20) {
            $words .= self::TENS[intdiv($num, 10)].' ';
            $num %= 10;
        }
        if ($num >= 10) {
            $words .= self::TEENS[$num - 10].' ';

            return trim($words);
        }
        if ($num > 0) {
            $words .= self::ONES[$num].' ';
        }

        return trim($words);
    }

    public static function rupees(float $amount): string
    {
        $rounded = (int) round($amount);

        return self::convert($rounded).' Only';
    }
}
