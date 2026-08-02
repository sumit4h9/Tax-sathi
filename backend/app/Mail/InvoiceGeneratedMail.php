<?php

namespace App\Mail;

use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvoiceGeneratedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Invoice $invoice) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Invoice: '.$this->invoice->invoice_number,
        );
    }

    public function content(): Content
    {
        $this->invoice->loadMissing('firm', 'items');

        return new Content(
            view: 'emails.invoice',
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromData(function () {
                $this->invoice->loadMissing('firm', 'items');

                return Pdf::loadView('pdf.invoice', ['invoice' => $this->invoice])->output();
            }, $this->invoice->invoice_number.'.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
