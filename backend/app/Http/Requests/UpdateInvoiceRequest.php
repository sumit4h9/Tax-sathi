<?php

namespace App\Http\Requests;

use App\Models\Firm;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $invoiceId = $this->route('invoice');

        return [
            'firm_id' => ['required', 'string', Rule::exists(Firm::class, 'id')],
            'invoice_number' => [
                'required',
                'string',
                Rule::unique('invoices', 'invoice_number')->ignore($invoiceId),
            ],
            'date' => 'required|date',
            'direction' => 'sometimes|in:outbound,inbound',
            'tax_mode' => 'sometimes|in:intra_state,inter_state',
            'cgst_percent' => 'nullable|numeric|min:0|max:100',
            'sgst_percent' => 'nullable|numeric|min:0|max:100',
            'igst_percent' => 'nullable|numeric|min:0|max:100',
            'freight' => 'nullable|numeric|min:0',
            'cutting_charges' => 'nullable|numeric|min:0',
            'seller' => 'nullable|array',
            'seller.name' => 'nullable|string|max:255',
            'seller.gst' => 'nullable|string|max:50',
            'seller.pan' => 'nullable|string|max:20',
            'seller.address1' => 'nullable|string|max:255',
            'seller.address2' => 'nullable|string|max:255',
            'seller.address3' => 'nullable|string|max:255',
            'seller.state' => 'nullable|string|max:100',
            'seller.state_code' => 'nullable|string|max:10',
            'seller.phone' => 'nullable|string|max:30',
            'seller.email' => 'nullable|string|max:255',
            'seller.bank' => 'nullable|string|max:255',
            'seller.branch' => 'nullable|string|max:255',
            'seller.account_no' => 'nullable|string|max:50',
            'seller.ifsc' => 'nullable|string|max:20',
            'customer' => 'nullable|array',
            'customer.name' => 'nullable|string|max:255',
            'customer.gst' => 'nullable|string|max:50',
            'customer.pan' => 'nullable|string|max:20',
            'customer.address1' => 'nullable|string|max:255',
            'customer.address2' => 'nullable|string|max:255',
            'customer.address3' => 'nullable|string|max:255',
            'customer.state' => 'nullable|string|max:100',
            'customer.state_code' => 'nullable|string|max:10',
            'meta' => 'nullable|array',
            'meta.time' => 'nullable|string|max:30',
            'meta.vendor_code' => 'nullable|string|max:50',
            'meta.date_time_prepare' => 'nullable|string|max:50',
            'meta.date_time_removal' => 'nullable|string|max:50',
            'meta.party_ch_no' => 'nullable|string|max:50',
            'meta.party_ch_date' => 'nullable|string|max:30',
            'meta.po_no' => 'nullable|string|max:50',
            'meta.po_date' => 'nullable|string|max:30',
            'meta.transport' => 'nullable|string|max:255',
            'meta.vehicle_no' => 'nullable|string|max:50',
            'meta.apx_weight' => 'nullable|string|max:30',
            'meta.e_way_no' => 'nullable|string|max:50',
            'meta.cartons' => 'nullable|string|max:30',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.rate' => 'required|numeric|min:0',
            'items.*.sno' => 'nullable|integer|min:1',
            'items.*.pl' => 'nullable|numeric|min:0',
            'items.*.th' => 'nullable|numeric|min:0',
            'items.*.hrs' => 'nullable|numeric|min:0',
            'items.*.set' => 'nullable|numeric|min:0',
            'items.*.total_hrs' => 'nullable|numeric|min:0',
            'items.*.hsn_sac' => 'nullable|string|max:30',
        ];
    }
}
