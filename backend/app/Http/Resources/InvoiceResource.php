<?php

namespace App\Http\Resources;

use App\Support\ApiDate;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Invoice */
class InvoiceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'firm_id' => $this->firm_id,
            'direction' => $this->direction,
            'tax_mode' => $this->tax_mode,
            'cgst_percent' => $this->cgst_percent,
            'sgst_percent' => $this->sgst_percent,
            'igst_percent' => $this->igst_percent,
            'invoice_number' => $this->invoice_number,
            'date' => ApiDate::format($this->resource->getAttributes()['date'] ?? null),
            'subtotal' => $this->subtotal,
            'cgst' => $this->cgst,
            'sgst' => $this->sgst,
            'igst' => $this->igst,
            'total_amount' => $this->total_amount,
            'freight' => $this->freight,
            'cutting_charges' => $this->cutting_charges,
            'round_off' => $this->round_off,
            'seller' => $this->seller,
            'customer' => $this->customer,
            'meta' => $this->meta,
            'pdf_path' => $this->pdf_path,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'firm' => new FirmResource($this->whenLoaded('firm')),
            'items' => InvoiceItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
