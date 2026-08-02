<!DOCTYPE html>
<html>
<head>
    <title>Invoice from {{ $invoice->firm->name }}</title>
</head>
<body>
    <h1>Hello,</h1>
    <p>Please find attached the invoice <strong>{{ $invoice->invoice_number }}</strong> dated {{ $invoice->date }}.</p>
    <p>Total Amount: Rs. {{ number_format($invoice->total_amount, 2) }}</p>
    <br>
    <p>Thank you for your business!</p>
</body>
</html>
