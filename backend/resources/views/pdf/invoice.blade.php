@php
    use App\Support\NumberToWords;

    $seller = $invoice->seller ?? [];
    $customer = $invoice->customer ?? [];
    $meta = $invoice->meta ?? [];

    if (empty($customer['name']) && $invoice->firm) {
        $customer['name'] = $invoice->firm->name;
        $customer['gst'] = $customer['gst'] ?? $invoice->firm->gstin;
        $customer['address1'] = $customer['address1'] ?? $invoice->firm->address;
    }

    $sellerName = $seller['name'] ?? config('app.name');
    $sellerGst = $seller['gst'] ?? '';
    $sellerPan = $seller['pan'] ?? '';
    $sellerState = $seller['state'] ?? '';
    $sellerStateCode = $seller['state_code'] ?? '';

    $displayDate = $meta['display_date'] ?? $invoice->date;
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) $displayDate)) {
        $displayDate = \Carbon\Carbon::parse($displayDate)->format('d/m/Y');
    }

    $freight = (float) ($invoice->freight ?? 0);
    $cutting = (float) ($invoice->cutting_charges ?? 0);
    $roundOff = (float) ($invoice->round_off ?? 0);
    $totalQty = $invoice->items->sum('quantity');
    $amountInWords = NumberToWords::rupees((float) $invoice->total_amount);

    $fmt = fn ($n, $dec = 2) => number_format((float) $n, $dec);
    $fmtIn = fn ($n, $dec = 2) => number_format((float) $n, $dec, '.', ',');
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        @page { size: A4; margin: 10mm; }
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 9px; color: #000; margin: 0; padding: 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; }
    </style>
</head>
<body>
    <table style="border: 2px solid #000;">
        <tbody>
            <tr>
                <td style="padding: 8px 10px; width: 30%; vertical-align: top;">
                    <div style="font-weight: bold;">GST No. : {{ $sellerGst }}</div>
                    <div style="font-weight: bold;">PAN No : {{ $sellerPan }}</div>
                </td>
                <td style="padding: 4px 10px; width: 40%; text-align: center; vertical-align: middle;">
                    <div style="font-size: 18px; font-weight: bold; text-decoration: underline; margin-bottom: 2px;">TAX INVOICE</div>
                    <div style="font-size: 9px; margin-bottom: 2px;">(Invoice Under GST Rule-7,Section-31)</div>
                    <div style="font-size: 10px; font-weight: bold;">Original for Recipient</div>
                </td>
                <td style="padding: 8px 10px; width: 30%; text-align: right; vertical-align: top;">
                    <div style="font-weight: bold;">State : {{ $sellerState }}</div>
                    <div style="font-weight: bold;">State Code : {{ $sellerStateCode }}</div>
                </td>
            </tr>

            <tr>
                <td colspan="3" style="padding: 6px 10px; text-align: center;">
                    <div style="font-size: 14px; font-weight: bold; margin-bottom: 2px;">{{ $sellerName }}</div>
                    @if(!empty($seller['address1']))<div style="font-size: 9px;">{{ $seller['address1'] }}</div>@endif
                    @if(!empty($seller['address2']))<div style="font-size: 9px;">{{ $seller['address2'] }}</div>@endif
                    @if(!empty($seller['address3']))<div style="font-size: 9px; margin-bottom: 2px;">{{ $seller['address3'] }}</div>@endif
                    @if(!empty($seller['phone']) || !empty($seller['email']))
                        <div style="font-size: 9px;">
                            @if(!empty($seller['phone']))Ph. No. : {{ $seller['phone'] }}@endif
                            @if(!empty($seller['email'])) Email : {{ $seller['email'] }}@endif
                        </div>
                    @endif
                </td>
            </tr>

            <tr>
                <td colspan="2" style="padding: 8px 10px; width: 55%; vertical-align: top;">
                    <div style="font-weight: bold; margin-bottom: 4px;">CUSTOMER'S NAME &amp; ADDRESS</div>
                    <div style="font-weight: bold; font-size: 10px;">{{ $customer['name'] ?? '' }}</div>
                    @if(!empty($customer['address1']))<div>{{ $customer['address1'] }}</div>@endif
                    @if(!empty($customer['address2']))<div>{{ $customer['address2'] }}</div>@endif
                    @if(!empty($customer['address3']))<div style="margin-bottom: 4px;">{{ $customer['address3'] }}</div>@endif
                    <div><span style="font-weight: bold;">GST No.</span> : {{ $customer['gst'] ?? '' }}</div>
                    <div><span style="font-weight: bold;">PAN No.</span> : {{ $customer['pan'] ?? '' }}</div>
                    <div>
                        <span style="font-weight: bold;">State</span> : {{ $customer['state'] ?? '' }}
                        <span style="font-weight: bold;">State Code :</span> {{ $customer['state_code'] ?? '' }}
                    </div>
                </td>
                <td style="padding: 8px 10px; width: 45%; vertical-align: top;">
                    <table style="width: 100%; border: none;">
                        <tbody>
                            <tr>
                                <td style="border: none; padding-bottom: 3px;"><b>INVOICE NO.:</b></td>
                                <td style="border: none; padding-bottom: 3px;">{{ $invoice->invoice_number }}</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding-bottom: 3px;"><b>Date :</b></td>
                                <td style="border: none; padding-bottom: 3px;">{{ $displayDate }}</td>
                                <td style="border: none; text-align: right; padding-bottom: 3px;">{{ $meta['time'] ?? '' }}</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding-bottom: 3px;"><b>Vendor Code :</b></td>
                                <td colspan="2" style="border: none; padding-bottom: 3px;">{{ $meta['vendor_code'] ?? '' }}</td>
                            </tr>
                            <tr>
                                <td colspan="3" style="border: none; padding-bottom: 3px;"><b>Date / Time of Prepare :</b> {{ $meta['date_time_prepare'] ?? '' }}</td>
                            </tr>
                            <tr>
                                <td colspan="3" style="border: none; padding-bottom: 3px;"><b>Date /Time of Removal :</b> {{ $meta['date_time_removal'] ?? '' }}</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding-bottom: 3px;"><b>Party Ch. No. :</b></td>
                                <td style="border: none; padding-bottom: 3px;">{{ $meta['party_ch_no'] ?? '' }}</td>
                                <td style="border: none; text-align: right; padding-bottom: 3px;">{{ $meta['party_ch_date'] ?? '' }}</td>
                            </tr>
                            <tr>
                                <td colspan="2" style="border: none; padding-bottom: 3px;"><b>PO No. &amp; Date :</b> {{ $meta['po_no'] ?? '' }}</td>
                                <td style="border: none; text-align: right; padding-bottom: 3px;">{{ $meta['po_date'] ?? '' }}</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding-bottom: 3px;"><b>Transport :</b></td>
                                <td colspan="2" style="border: none; padding-bottom: 3px;">{{ $meta['transport'] ?? '' }}</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding-bottom: 3px;"><b>Vehicle No. :</b></td>
                                <td colspan="2" style="border: none; padding-bottom: 3px;">{{ $meta['vehicle_no'] ?? '' }}</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding-bottom: 3px;"><b>Apx Weight :</b></td>
                                <td colspan="2" style="border: none; padding-bottom: 3px;">{{ $meta['apx_weight'] ?? '' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>

            <tr>
                <td colspan="3" style="padding: 0;">
                    <table style="width: 100%;">
                        <thead>
                            <tr style="font-size: 9px; font-weight: bold; text-align: center;">
                                <th style="padding: 4px 2px; width: 4%;">S.NO.</th>
                                <th style="padding: 4px 2px; width: 20%;">DESCRIPTION OF GOODS</th>
                                <th style="padding: 4px 2px; width: 7%;">PL</th>
                                <th style="padding: 4px 2px; width: 7%;">TH</th>
                                <th style="padding: 4px 2px; width: 7%;">HRS</th>
                                <th style="padding: 4px 2px; width: 6%;">SET</th>
                                <th style="padding: 4px 2px; width: 8%;">Total HRS</th>
                                <th style="padding: 4px 2px; width: 9%;">HSN / SAC</th>
                                <th style="padding: 4px 2px; width: 6%;">QTY</th>
                                <th style="padding: 4px 2px; width: 10%;">RATE</th>
                                <th style="padding: 4px 2px; width: 12%;">AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($invoice->items as $item)
                            <tr style="font-size: 8px;">
                                <td style="padding: 4px 2px; text-align: center;">{{ $item->sno ?? $loop->iteration }}</td>
                                <td style="padding: 4px 4px; font-size: 7px; white-space: pre-line; line-height: 1.3;">{{ $item->description }}</td>
                                <td style="padding: 4px 2px; text-align: right;">{{ $fmt($item->pl ?? 0) }}</td>
                                <td style="padding: 4px 2px; text-align: right;">{{ $fmt($item->th ?? 0) }}</td>
                                <td style="padding: 4px 2px; text-align: right;">{{ $fmt($item->hrs ?? 0) }}</td>
                                <td style="padding: 4px 2px; text-align: right;">{{ $fmt($item->set ?? 0) }}</td>
                                <td style="padding: 4px 2px; text-align: right;">{{ $fmt($item->total_hrs ?? 0) }}</td>
                                <td style="padding: 4px 2px; text-align: center;">{{ $item->hsn_sac ?? '-' }}</td>
                                <td style="padding: 4px 2px; text-align: right;">{{ $fmt($item->quantity) }}</td>
                                <td style="padding: 4px 2px; text-align: right;">{{ number_format((float) $item->rate, 3) }}</td>
                                <td style="padding: 4px 2px; text-align: right;">{{ $fmtIn($item->amount) }}</td>
                            </tr>
                            @endforeach
                            <tr style="font-size: 9px; font-weight: bold;">
                                <td colspan="2" style="padding: 4px 4px;">JOB WORK ONLY</td>
                                <td colspan="6" style="padding: 4px 2px;"></td>
                                <td colspan="2" style="padding: 4px 2px; text-align: right;">TOTAL : {{ $fmt($totalQty) }}</td>
                                <td style="padding: 4px 2px; text-align: right;">{{ $fmtIn($invoice->subtotal) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>

            <tr>
                <td colspan="2" style="padding: 8px 10px; width: 55%; vertical-align: top;">
                    <div style="margin-bottom: 4px;"><b>E-Way Form No. :</b> {{ $meta['e_way_no'] ?? '' }}</div>
                    <div style="margin-bottom: 8px;"><b>No. of Cartons :</b> {{ $meta['cartons'] ?? '' }}</div>
                    <div style="margin-bottom: 2px; font-weight: bold;">Total Invoice Value (in words) Rs.</div>
                    <div style="font-weight: bold; font-size: 10px; margin-bottom: 10px;">{{ $amountInWords }}</div>
                    @if(!empty($seller['bank']))
                        <div style="margin-bottom: 1px;"><b>Bank :</b> {{ $seller['bank'] }}</div>
                    @endif
                    @if(!empty($seller['branch']))
                        <div style="margin-bottom: 1px;"><b>Branch :</b> {{ $seller['branch'] }}</div>
                    @endif
                    @if(!empty($seller['account_no']))
                        <div style="margin-bottom: 1px;"><b>A/c No :</b> {{ $seller['account_no'] }}</div>
                    @endif
                    @if(!empty($seller['ifsc']))
                        <div><b>IFSC Code :</b> {{ $seller['ifsc'] }}</div>
                    @endif
                </td>
                <td style="padding: 8px 10px; width: 45%; vertical-align: top;">
                    <table style="width: 100%; border: none;">
                        <tbody>
                            <tr>
                                <td style="border: none; padding-bottom: 2px;">Freight</td>
                                <td style="border: none; text-align: right; padding-bottom: 2px;">{{ $fmt($freight) }}</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding-bottom: 2px;">Cutting / Other Charges</td>
                                <td style="border: none; text-align: right; padding-bottom: 2px;">{{ $fmt($cutting) }}</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding-bottom: 2px;">Taxable Amount</td>
                                <td style="border: none; text-align: right; padding-bottom: 2px;">{{ $fmt($invoice->subtotal) }}</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding-bottom: 2px;">CGST @ {{ $fmt($invoice->cgst_percent ?? 0, 1) }}%</td>
                                <td style="border: none; text-align: right; padding-bottom: 2px;">{{ $fmt($invoice->cgst) }}</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding-bottom: 2px;">SGST @ {{ $fmt($invoice->sgst_percent ?? 0, 1) }}%</td>
                                <td style="border: none; text-align: right; padding-bottom: 2px;">{{ $fmt($invoice->sgst) }}</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding-bottom: 2px;">IGST @ {{ $fmt($invoice->igst_percent ?? 0, 1) }}%</td>
                                <td style="border: none; text-align: right; padding-bottom: 2px;">{{ $fmt($invoice->igst) }}</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding-bottom: 4px;">Round off</td>
                                <td style="border: none; text-align: right; padding-bottom: 4px;">{{ $fmt($roundOff) }}</td>
                            </tr>
                            <tr style="font-weight: bold;">
                                <td style="border: none; border-top: 1px solid #000; padding-top: 4px;">Grand Total (Rs.)</td>
                                <td style="border: none; border-top: 1px solid #000; text-align: right; padding-top: 4px;">{{ $fmtIn($invoice->total_amount) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>

            <tr>
                <td colspan="3" style="padding: 8px 10px; font-size: 7.5px;">
                    <div style="margin-bottom: 6px;">
                        <div style="font-weight: bold; margin-bottom: 2px;">TERMS &amp; CONDITIONS :</div>
                        <div>1. Interest @18% P.A. will be charged extra on all the bills outstanding if payment made after due date.</div>
                        <div>2. Our Responsibility ceases as the goods leave our premises</div>
                        <div>3. All Disputes subject to FARIDABAD Jurisdiction only</div>
                    </div>
                    <div style="margin-bottom: 6px;"><b>Tax Payable on Reverse Charges :</b> N. A.</div>
                    <table style="width: 100%; border: none;">
                        <tr>
                            <td style="border: none; width: 60%; vertical-align: top;">
                                <div style="font-weight: bold; margin-bottom: 2px;">DECLARATION :</div>
                                <div>Certified that Particulrars given above are true &amp; correct under GST Act 2017 and amount indicated represent the price actualy charged and that there is no flow of additional consideration directly or indirectly from buyer.</div>
                            </td>
                            <td style="border: none; width: 35%; text-align: right; font-size: 9px; vertical-align: top;">
                                <div style="margin-bottom: 30px;">Authorised Signatory</div>
                                <div style="font-weight: bold;">For {{ $sellerName }}</div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</body>
</html>
