<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\InvoiceItem */
class InvoiceItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_id' => $this->invoice_id,
            'description' => $this->description,
            'quantity' => $this->quantity,
            'rate' => $this->rate,
            'amount' => $this->amount,
            'sno' => $this->sno,
            'pl' => $this->pl,
            'th' => $this->th,
            'hrs' => $this->hrs,
            'set' => $this->set,
            'total_hrs' => $this->total_hrs,
            'hsn_sac' => $this->hsn_sac,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
