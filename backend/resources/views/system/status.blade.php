<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>System status — {{ config('app.name') }}</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 2rem; background: #0f172a; color: #e2e8f0; }
        h1 { font-size: 1.35rem; margin-bottom: 1rem; }
        table { border-collapse: collapse; width: 100%; max-width: 56rem; background: #1e293b; border-radius: 8px; overflow: hidden; }
        th, td { text-align: left; padding: 0.65rem 1rem; border-bottom: 1px solid #334155; font-size: 0.9rem; }
        th { background: #334155; font-weight: 600; }
        tr:last-child td { border-bottom: none; }
        .ok { color: #4ade80; }
        .bad { color: #f87171; }
        a { color: #93c5fd; }
    </style>
</head>
<body>
    <h1>System status</h1>
    <p><a href="{{ url('/') }}">← Home</a></p>
    <table>
        <tbody>
            <tr><th>Environment</th><td>{{ $status['application']['environment'] ?? '—' }}</td></tr>
            <tr><th>API version</th><td>{{ $status['application']['api_version'] ?? '—' }}</td></tr>
            <tr><th>Database</th><td class="{{ ($status['database']['status'] ?? '') === 'ok' ? 'ok' : 'bad' }}">{{ $status['database']['status'] ?? '—' }} ({{ $status['database']['driver'] ?? '—' }})</td></tr>
            <tr><th>Queue</th><td>{{ $status['queue']['connection'] ?? '—' }} @if(isset($status['queue']['failed_jobs'])) / failed: {{ $status['queue']['failed_jobs'] }} @endif @if(isset($status['queue']['pending_jobs'])) / pending: {{ $status['queue']['pending_jobs'] }} @endif</td></tr>
            <tr><th>Storage</th><td class="{{ ($status['storage']['status'] ?? '') === 'ok' ? 'ok' : 'bad' }}">{{ $status['storage']['status'] ?? '—' }} / public storage linked: {{ ($status['storage']['public_storage_linked'] ?? false) ? 'yes' : 'no' }}</td></tr>
            <tr><th>Cache</th><td class="{{ ($status['cache']['status'] ?? '') === 'ok' ? 'ok' : 'bad' }}">{{ $status['cache']['status'] ?? '—' }} ({{ $status['cache']['store'] ?? '—' }})</td></tr>
            <tr><th>Mail</th><td>{{ $status['mail']['default_mailer'] ?? '—' }} / from configured: {{ ($status['mail']['from_address_configured'] ?? false) ? 'yes' : 'no' }}</td></tr>
        </tbody>
    </table>
</body>
</html>
