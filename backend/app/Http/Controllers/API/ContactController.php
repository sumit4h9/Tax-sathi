<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactMessageRequest;
use App\Mail\ContactSubmittedMail;
use App\Models\ContactMessage;
use App\Services\MailDelivery;
use Throwable;

class ContactController extends Controller
{
    public function store(StoreContactMessageRequest $request)
    {
        $data = $request->validated();
        $data['status'] = 'pending';
        if ($request->user()) {
            $data['user_id'] = $request->user()->id;
        }
        $message = ContactMessage::query()->create($data);

        $admin = config('mail.admin_address');
        $status = MailDelivery::status();
        $emailNotified = false;
        $emailHint = null;

        if (! is_string($admin) || $admin === '') {
            $emailHint = 'Set MAIL_ADMIN_ADDRESS in backend/.env to receive contact form emails.';
        } elseif (! $status['delivered']) {
            $emailHint = $status['hint'];
        } else {
            try {
                MailDelivery::send(new ContactSubmittedMail($message), $admin);
                $emailNotified = true;
            } catch (Throwable $e) {
                report($e);
                $emailHint = config('app.debug') ? $e->getMessage() : 'Failed to send notification email.';
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $message->id,
            ],
            'message' => 'Message sent successfully',
            'email_notified' => $emailNotified,
            'email_hint' => $emailHint,
        ], 201);
    }
}
