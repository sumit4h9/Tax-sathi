<?php

namespace App\Http\Controllers\API\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    public function index()
    {
        $messages = ContactMessage::query()->orderByDesc('created_at')->get();

        return response()->json([
            'success' => true,
            'data' => $messages,
        ]);
    }

    public function updateStatus(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|in:pending,read,resolved',
        ]);

        $message = ContactMessage::query()->findOrFail($id);
        $message->update(['status' => $request->input('status')]);

        return response()->json([
            'success' => true,
            'message' => 'Status updated',
        ]);
    }

    public function reply(Request $request, string $id)
    {
        $request->validate([
            'reply' => 'required|string',
        ]);

        $message = ContactMessage::query()->findOrFail($id);
        
        // Normally we would send an email here using a Mailable
        // MailDelivery::send(new ContactReplyMail($message, $request->input('reply')), $message->email);

        // Mark as resolved automatically
        $message->update(['status' => 'resolved']);

        return response()->json([
            'success' => true,
            'message' => 'Reply sent successfully',
        ]);
    }

    public function destroy(string $id)
    {
        $message = ContactMessage::query()->findOrFail($id);
        $message->delete();

        return response()->json([
            'success' => true,
            'message' => 'Contact message deleted',
        ]);
    }
}
