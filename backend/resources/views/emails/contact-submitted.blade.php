<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Contact message</title>
</head>
<body style="font-family: sans-serif; line-height: 1.5;">
<p><strong>New contact form submission</strong></p>
<p><strong>Name:</strong> {{ $contactMessage->name }}</p>
<p><strong>Email:</strong> {{ $contactMessage->email }}</p>
<p><strong>Message:</strong></p>
<p>{{ $contactMessage->message }}</p>
</body>
</html>
