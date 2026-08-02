# Email configuration (SMTP, Mailtrap, production)

Laravel sends:

- **GST invoice PDFs** to clients (`POST /api/invoices/{id}/send-email`).
- **Contact form** notifications to an admin inbox when configured.

## Environment variables (`backend/.env`)

| Variable | Purpose |
|----------|---------|
| `MAIL_MAILER` | `smtp` for real mail, `log` for development (writes to log, no network). |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` | SMTP server (Mailtrap, Mailgun SMTP, SES SMTP, etc.). |
| `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` | Sender shown to recipients. |
| `MAIL_ADMIN_ADDRESS` | Optional. If set, contact form submissions are emailed here via `ContactSubmittedMail`. |

## Gmail (personal / small volume)

Gmail does **not** accept your normal account password over SMTP. Use an [App Password](https://myaccount.google.com/apppasswords) (requires 2-Step Verification on the Google account).

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=your_16_char_app_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your@gmail.com
MAIL_FROM_NAME="TaxSathi"
```

Do **not** set `MAIL_HOST` to Mailtrap while using Gmail credentials — that causes `535 Invalid credentials`.

## Mailtrap (development)

1. Create an inbox at [Mailtrap](https://mailtrap.io/).
2. Use the SMTP credentials in `.env`, for example:

```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
MAIL_FROM_ADDRESS="noreply@yourdomain.test"
MAIL_FROM_NAME="GST Invoice Dev"
MAIL_ADMIN_ADDRESS="you@example.com"
```

3. Run `php artisan config:clear` after edits.

## Production

- Use your provider’s SMTP or a native driver (`mailgun`, `ses`, `postmark`, etc.) as documented in [Laravel Mail](https://laravel.com/docs/mail).
- Set `MAIL_FROM_ADDRESS` to a domain you are allowed to send from (SPF/DKIM configured at DNS).

## Queues (optional)

For heavy PDF mail, consider dispatching `Mail` on a queue (`QUEUE_CONNECTION=database` is already common in `.env.example`) and running `php artisan queue:work`.

## Quick test without SMTP

```env
MAIL_MAILER=log
```

With `log`, the API returns **503** for invoice email and does **not** claim delivery — check the UI hint or run:

```bash
cd backend && php artisan mail:test you@example.com
```

Message content is still written to `storage/logs/laravel.log` only if you temporarily bypass the guard (not recommended).

## After configuring SMTP

```bash
cd backend
php artisan config:clear
php artisan mail:test you@example.com
```

Then send an invoice from the app; you should get `delivered: true` in the JSON response.
