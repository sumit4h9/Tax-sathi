<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use Throwable;

class MailDelivery
{
    /**
     * @return array{delivered: bool, mailer: string, hint: string|null}
     */
    public static function status(): array
    {
        $mailer = (string) config('mail.default');

        if ($mailer === 'log' || $mailer === 'array') {
            return [
                'delivered' => false,
                'mailer' => $mailer,
                'hint' => 'Set MAIL_MAILER=smtp and SMTP credentials in backend/.env (see docs/EMAIL_CONFIGURATION.md).',
            ];
        }

        if ($mailer === 'smtp' && ! filled(config('mail.mailers.smtp.username'))) {
            return [
                'delivered' => false,
                'mailer' => $mailer,
                'hint' => 'MAIL_USERNAME and MAIL_PASSWORD are missing in backend/.env.',
            ];
        }

        if ($mailer === 'resend' && ! filled(config('services.resend.key'))) {
            return [
                'delivered' => false,
                'mailer' => $mailer,
                'hint' => 'RESEND_API_KEY is missing in backend/.env.',
            ];
        }

        return [
            'delivered' => true,
            'mailer' => $mailer,
            'hint' => null,
        ];
    }

    /**
     * @throws Throwable
     */
    public static function send(mixed $mailable, string $to): void
    {
        Mail::to($to)->send($mailable);
    }
}
