<?php

namespace App\Console\Commands;

use App\Services\MailDelivery;
use Illuminate\Console\Command;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Throwable;

class SendTestMailCommand extends Command
{
    protected $signature = 'mail:test {email : Recipient address}';

    protected $description = 'Send a test email using the configured mailer';

    public function handle(): int
    {
        $email = (string) $this->argument('email');
        $status = MailDelivery::status();

        $this->line('Mailer: '.$status['mailer']);
        $this->line('Delivered: '.($status['delivered'] ? 'yes' : 'no'));
        if ($status['hint']) {
            $this->warn($status['hint']);
        }

        if (! $status['delivered']) {
            return self::FAILURE;
        }

        try {
            MailDelivery::send(new class extends Mailable
            {
                public function envelope(): Envelope
                {
                    return new Envelope(subject: 'TaxSathi mail test');
                }

                public function content(): Content
                {
                    return new Content(htmlString: '<p>If you received this, SMTP is configured correctly.</p>');
                }
            }, $email);
        } catch (Throwable $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        $this->info('Test email sent to '.$email);

        return self::SUCCESS;
    }
}
