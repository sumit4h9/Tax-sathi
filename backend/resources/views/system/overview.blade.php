<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name') }} — Backend</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 2rem; line-height: 1.5; color: #1e293b; background: #f8fafc; }
        h1 { font-size: 1.25rem; }
        pre { background: #fff; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 8px; overflow: auto; font-size: 0.85rem; }
        a { color: #2563eb; }
    </style>
</head>
<body>
    <h1>{{ config('app.name') }}</h1>
    <p>HTML overview for humans. For machine-readable data use <code>Accept: application/json</code> on <a href="{{ url('/') }}">/</a>.</p>
    <pre>{{ json_encode($status, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) }}</pre>
</body>
</html>
