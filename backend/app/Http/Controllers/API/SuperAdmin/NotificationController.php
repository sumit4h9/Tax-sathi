<?php

namespace App\Http\Controllers\API\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'target' => 'required|in:all,multiple,specific',
            'user_ids' => 'required_if:target,multiple,specific|array',
        ]);

        $title = $request->input('title');
        $message = $request->input('message');
        $target = $request->input('target');
        $userIds = $request->input('user_ids', []);

        if ($target === 'all') {
            $users = User::query()->where('role', 'admin')->get();
        } else {
            $users = User::query()->whereIn('_id', $userIds)->get();
        }

        $notifications = [];
        foreach ($users as $user) {
            $notifications[] = [
                'user_id' => $user->id,
                'title' => $title,
                'message' => $message,
                'is_read' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            if ($user->email) {
                try {
                    \App\Services\MailDelivery::send(
                        new \App\Mail\SuperAdminNotificationMail($title, $message),
                        $user->email
                    );
                } catch (\Throwable $e) {
                    report($e);
                }
            }
        }

        if (!empty($notifications)) {
            Notification::query()->insert($notifications);
        }

        return response()->json([
            'success' => true, 
            'message' => 'Notification sent successfully to ' . count($notifications) . ' user(s)',
        ]);
    }
}
