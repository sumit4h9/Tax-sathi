<!DOCTYPE html>
<html>
<head>
    <title>{{ $title ?? 'Notification from Tax Sathi' }}</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-top: 0;">Tax Sathi</h2>
        <p style="white-space: pre-line;">{{ $msgContent }}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">This is an automated notification from Tax Sathi. Please do not reply directly to this email.</p>
    </div>
</body>
</html>
