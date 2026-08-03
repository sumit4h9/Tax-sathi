<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Invoice {{ $invoice->invoice_number }}</title>
</head>
<body style="margin:0;padding:0;background-color:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f1117;padding:40px 20px;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- LOGO HEADER -->
        <tr>
          <td align="center" style="padding-bottom:32px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:16px;padding:14px 28px;">
                  <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:1px;">TaxSathi</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAIN CARD -->
        <tr>
          <td style="background:linear-gradient(145deg,#1e2130,#252a3a);border-radius:24px;border:1px solid #2d3350;overflow:hidden;">

            <!-- BANNER -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#9333ea 100%);padding:40px 48px;text-align:center;">
                  <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:50%;width:64px;height:64px;line-height:64px;font-size:32px;margin-bottom:16px;">🧾</div>
                  <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;">
                    Tax Invoice
                  </h1>
                  <div style="display:inline-block;margin-top:12px;background:rgba(255,255,255,0.2);border-radius:20px;padding:6px 18px;font-size:14px;font-weight:600;color:#ffffff;letter-spacing:0.5px;">
                    {{ $invoice->invoice_number }}
                  </div>
                </td>
              </tr>
            </table>

            <!-- BODY CONTENT -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:40px 48px;">

                  <p style="margin:0 0 6px;font-size:15px;color:#9ca3af;">Hello,</p>
                  <p style="margin:0 0 24px;font-size:15px;color:#d1d5db;line-height:1.7;">
                    Please find attached your tax invoice <strong>{{ $invoice->invoice_number }}</strong> issued by 
                    <strong style="color:#f3f4f6;">{{ $invoice->firm->name ?? 'TaxSathi' }}</strong>.
                  </p>

                  <!-- INVOICE DETAILS CARD -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                    <tr>
                      <td style="background:#1a1f2e;border:1px solid #2d3350;border-radius:14px;padding:24px;">
                        <p style="margin:0 0 16px;font-size:12px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">Summary Details</p>

                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding:8px 0;font-size:13px;color:#6b7280;width:40%;">Issuer Firm</td>
                            <td style="padding:8px 0;font-size:14px;color:#f3f4f6;font-weight:600;">{{ $invoice->firm->name ?? 'N/A' }}</td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;font-size:13px;color:#6b7280;">Recipient</td>
                            <td style="padding:8px 0;font-size:14px;color:#e5e7eb;font-weight:500;">{{ $invoice->customer_name ?? $invoice->party_name ?? 'Valued Customer' }}</td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;font-size:13px;color:#6b7280;">Invoice Date</td>
                            <td style="padding:8px 0;font-size:14px;color:#e5e7eb;font-weight:500;">
                              {{ $invoice->date ? \Carbon\Carbon::parse($invoice->date)->format('d M Y') : date('d M Y') }}
                            </td>
                          </tr>
                          <tr style="border-top:1px solid #2d3350;">
                            <td style="padding:14px 0 6px;font-size:14px;color:#6b7280;font-weight:600;">Total Amount</td>
                            <td style="padding:14px 0 6px;font-size:22px;color:#10b981;font-weight:700;">
                              ₹{{ number_format($invoice->total_amount, 2) }}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  @if(!empty($invoice->items) && count($invoice->items) > 0)
                  <!-- LINE ITEMS PREVIEW TABLE -->
                  <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">Line Items</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;border-collapse:collapse;">
                    <thead>
                      <tr style="background:#1a1f2e;">
                        <th align="left" style="padding:10px 14px;font-size:12px;color:#9ca3af;font-weight:600;border-bottom:1px solid #2d3350;border-top-left-radius:8px;">Item / Description</th>
                        <th align="center" style="padding:10px 14px;font-size:12px;color:#9ca3af;font-weight:600;border-bottom:1px solid #2d3350;">Qty</th>
                        <th align="right" style="padding:10px 14px;font-size:12px;color:#9ca3af;font-weight:600;border-bottom:1px solid #2d3350;border-top-right-radius:8px;">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      @foreach($invoice->items as $item)
                      <tr>
                        <td style="padding:10px 14px;font-size:13px;color:#d1d5db;border-bottom:1px solid #1f2434;">{{ $item->name ?? $item->description ?? 'Item' }}</td>
                        <td align="center" style="padding:10px 14px;font-size:13px;color:#9ca3af;border-bottom:1px solid #1f2434;">{{ $item->quantity ?? 1 }}</td>
                        <td align="right" style="padding:10px 14px;font-size:13px;color:#f3f4f6;font-weight:500;border-bottom:1px solid #1f2434;">₹{{ number_format($item->total ?? $item->amount ?? 0, 2) }}</td>
                      </tr>
                      @endforeach
                    </tbody>
                  </table>
                  @endif

                  <!-- ATTACHMENT NOTICE BOX -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                    <tr>
                      <td style="background:#0f1117;border:1px solid #374151;border-left:4px solid #6366f1;border-radius:8px;padding:16px 20px;">
                        <p style="margin:0;font-size:14px;color:#818cf8;font-weight:600;margin-bottom:4px;">📎 PDF Attachment Included</p>
                        <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.5;">
                          The official tax invoice PDF (<strong>{{ $invoice->invoice_number }}.pdf</strong>) is attached to this email for your records and accounting.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0;font-size:14px;color:#9ca3af;line-height:1.7;">
                    Thank you for your business!<br/>
                    <strong style="color:#f3f4f6;">{{ $invoice->firm->name ?? 'TaxSathi Team' }}</strong>
                  </p>

                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:32px 0 16px;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;color:#4b5563;">
              © {{ date('Y') }} TaxSathi. All rights reserved.
            </p>
            <p style="margin:0;font-size:11px;color:#374151;">
              Sent automatically via <a href="{{ config('app.url') }}" style="color:#6366f1;text-decoration:none;">TaxSathi Platform</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>
