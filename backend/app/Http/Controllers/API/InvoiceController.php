<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\SendInvoiceEmailRequest;
use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Http\Resources\InvoiceResource;
use App\Mail\InvoiceGeneratedMail;
use App\Models\Invoice;
use App\Services\InvoiceService;
use App\Services\MailDelivery;
use App\Services\SnsService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Throwable;

class InvoiceController extends Controller
{
    public function __construct(
        protected InvoiceService $invoiceService
    ) {}

    public function index(Request $request)
    {
        $query = Invoice::query()->with('firm')->orderByDesc('date');

        if ($request->filled('firm_id')) {
            $query->where('firm_id', (string) $request->input('firm_id'));
        }

        if ($request->filled('month') && $request->filled('year')) {
            $query->forMonth($request->integer('month'), $request->integer('year'));
        }

        if ($request->filled('direction')) {
            $query->where('direction', (string) $request->input('direction'));
        }

        return InvoiceResource::collection($query->paginate(15));
    }

    public function store(StoreInvoiceRequest $request)
    {
        try {
            $invoice = $this->invoiceService->create($request->validated());

            return response()->json([
                'message' => 'Invoice created successfully',
                'invoice' => (new InvoiceResource($invoice))->resolve(),
            ], 201);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => config('app.debug') ? $e->getMessage() : 'Unable to create invoice.',
            ], 500);
        }
    }

    public function show(string $id)
    {
        $invoice = Invoice::query()->with(['firm', 'items'])->findOrFail($id);

        return response()->json((new InvoiceResource($invoice))->resolve());
    }

    public function update(UpdateInvoiceRequest $request, string $id)
    {
        $invoice = Invoice::query()->findOrFail($id);

        try {
            $invoice = $this->invoiceService->update($invoice, $request->validated());

            return response()->json([
                'message' => 'Invoice updated successfully',
                'invoice' => (new InvoiceResource($invoice))->resolve(),
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => config('app.debug') ? $e->getMessage() : 'Unable to update invoice.',
            ], 500);
        }
    }

    public function destroy(string $id)
    {
        $invoice = Invoice::query()->findOrFail($id);
        $invoice->delete();

        return response()->json(['message' => 'Invoice deleted successfully']);
    }

    public function sendEmail(SendInvoiceEmailRequest $request, string $id)
    {
        $invoice = Invoice::query()->with(['firm', 'items'])->findOrFail($id);
        $status = MailDelivery::status();

        if (! $status['delivered']) {
            return response()->json([
                'message' => 'Email is not configured for delivery.',
                'hint' => $status['hint'],
                'delivered' => false,
                'mailer' => $status['mailer'],
            ], 503);
        }

        try {
            MailDelivery::send(new InvoiceGeneratedMail($invoice), $request->validated('email'));
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => config('app.debug') ? $e->getMessage() : 'Failed to send invoice email.',
                'delivered' => false,
                'mailer' => $status['mailer'],
            ], 500);
        }

        return response()->json([
            'message' => 'Invoice email sent successfully',
            'delivered' => true,
            'mailer' => $status['mailer'],
        ]);
    }

    public function downloadPdf(string $id)
    {
        $invoice = Invoice::query()->with(['firm', 'items'])->findOrFail($id);

        $filename = preg_replace('/[^A-Za-z0-9._-]/', '_', $invoice->invoice_number).'.pdf';
        $s3Path = "invoices/{$invoice->id}/{$filename}";

        if (config('filesystems.default') === 's3' || request()->boolean('s3')) {
            $pdf = Pdf::loadView('pdf.invoice', ['invoice' => $invoice]);
            Storage::disk('s3')->put($s3Path, $pdf->output(), 'private');

            $snsTopic = config('services.sns.topic_arn');
            if ($snsTopic) {
                app(SnsService::class)->publishToTopic(
                    $snsTopic,
                    "Invoice PDF Stored: {$invoice->invoice_number}",
                    "Invoice {$invoice->invoice_number} (Total: ₹{$invoice->total_amount}) PDF uploaded to S3 path: {$s3Path}"
                );
            }

            $presignedUrl = Storage::disk('s3')->temporaryUrl($s3Path, now()->addMinutes(30));

            return response()->json([
                'message' => 'Invoice PDF uploaded to AWS S3 successfully',
                'download_url' => $presignedUrl,
                's3_path' => $s3Path,
            ]);
        }

        return Pdf::loadView('pdf.invoice', ['invoice' => $invoice])->download($filename);
    }
}
