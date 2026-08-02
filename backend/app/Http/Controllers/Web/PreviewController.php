<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\View\View;

class PreviewController extends Controller
{
    public function invoice(Invoice $invoice)
    {
        $invoice->loadMissing(['firm', 'items']);

        return Pdf::loadView('pdf.invoice', ['invoice' => $invoice])
            ->stream($invoice->invoice_number.'-preview.pdf');
    }

    public function mailInvoice(Invoice $invoice): View
    {
        $invoice->loadMissing(['firm', 'items']);

        return view('emails.invoice', ['invoice' => $invoice]);
    }

    public function mailContact(): View
    {
        $demo = new ContactMessage([
            'name' => 'Demo User',
            'email' => 'demo@example.com',
            'message' => 'This is a sample contact message for local preview only.',
        ]);

        return view('emails.contact-submitted', ['contactMessage' => $demo]);
    }
}
