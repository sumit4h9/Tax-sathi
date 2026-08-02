<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Monthly Salary Report - {{ $monthName }} {{ $year }}</title>
    <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 11px; color: #334155; margin: 0; padding: 0; line-height: 1.5; }
        h1 { font-size: 20px; color: #1e293b; margin: 0 0 4px 0; }
        .subtitle { font-size: 12px; color: #64748b; margin-bottom: 20px; }
        
        .stats-grid { width: 100%; margin-bottom: 25px; }
        .stats-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; text-align: center; }
        .stats-val { font-size: 16px; font-weight: bold; color: #2563eb; margin-top: 4px; }
        .stats-label { font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }

        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background-color: #f1f5f9; color: #475569; font-weight: bold; text-align: left; border-bottom: 2px solid #cbd5e1; }
        th, td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
        
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        
        .footer { margin-top: 40px; font-size: 9px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    </style>
</head>
<body>
    <div style="text-align: center; margin-bottom: 25px;">
        <h1>Monthly Salary Report</h1>
        <div class="subtitle">Payroll for the month of <strong>{{ $monthName }} {{ $year }}</strong></div>
    </div>

    <table class="stats-grid">
        <tr>
            <td style="border: none; width: 33.3%; padding: 0 10px 0 0;">
                <div class="stats-card">
                    <div class="stats-label">Total Expense</div>
                    <div class="stats-val">₹{{ number_format($totalPayroll, 2) }}</div>
                </div>
            </td>
            <td style="border: none; width: 33.3%; padding: 0 5px;">
                <div class="stats-card">
                    <div class="stats-label">Overtime Payments</div>
                    <div class="stats-val">₹{{ number_format($totalOvertime, 2) }}</div>
                </div>
            </td>
            <td style="border: none; width: 33.3%; padding: 0 0 0 10px;">
                <div class="stats-card">
                    <div class="stats-label">Total Deductions</div>
                    <div class="stats-val" style="color: #dc2626;">₹{{ number_format($totalDeductions, 2) }}</div>
                </div>
            </td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th style="width: 12%;">Employee ID</th>
                <th style="width: 20%;">Employee Name</th>
                <th style="width: 15%;">Department</th>
                <th style="width: 15%; text-align: right;">Monthly Salary</th>
                <th style="width: 12%; text-align: center;">Absent Days</th>
                <th style="width: 12%; text-align: center;">Overtime Hours</th>
                <th style="width: 14%; text-align: right;">Final Salary</th>
            </tr>
        </thead>
        <tbody>
            @foreach($records as $rec)
            <tr>
                <td>{{ $rec->employee->employee_id ?? '—' }}</td>
                <td class="font-bold">{{ $rec->employee->name ?? '—' }}</td>
                <td>{{ $rec->employee->department ?? '—' }}</td>
                <td class="text-right">₹{{ number_format((float)($rec->employee->salary ?? 0), 2) }}</td>
                <td class="text-center">{{ number_format($rec->absent_days, 1) }}</td>
                <td class="text-center">{{ number_format($rec->overtime_hours, 1) }}</td>
                <td class="text-right font-bold" style="color: #0f172a;">₹{{ number_format($rec->final_salary, 2) }}</td>
            </tr>
            @endforeach
            <tr style="background-color: #f8fafc; font-weight: bold;">
                <td colspan="3" style="border-top: 2px solid #cbd5e1; border-bottom: 2px solid #cbd5e1;">Grand Total</td>
                <td style="border-top: 2px solid #cbd5e1; border-bottom: 2px solid #cbd5e1;" class="text-right">₹{{ number_format($records->sum(fn($r) => (float)($r->employee->salary ?? 0)), 2) }}</td>
                <td style="border-top: 2px solid #cbd5e1; border-bottom: 2px solid #cbd5e1;" class="text-center">{{ number_format($records->sum('absent_days'), 1) }}</td>
                <td style="border-top: 2px solid #cbd5e1; border-bottom: 2px solid #cbd5e1;" class="text-center">{{ number_format($records->sum('overtime_hours'), 1) }}</td>
                <td style="border-top: 2px solid #cbd5e1; border-bottom: 2px solid #cbd5e1; color: #2563eb;" class="text-right">₹{{ number_format($totalPayroll, 2) }}</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        Generated on {{ date('d/m/Y H:i:s') }} | TaxSathi Employee Management System
    </div>
</body>
</html>
