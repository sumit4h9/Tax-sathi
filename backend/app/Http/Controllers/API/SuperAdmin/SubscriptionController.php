<?php

namespace App\Http\Controllers\API\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function updatePlan(Request $request, string $id)
    {
        $request->validate([
            'plan' => 'required|in:free,basic,premium,enterprise',
            'validity_days' => 'nullable|integer|min:1',
            'action' => 'required|in:upgrade,downgrade,extend,expire',
        ]);

        $user = User::query()->findOrFail($id);
        $action = $request->input('action');
        $plan = $request->input('plan');
        $days = $request->input('validity_days');

        if ($action === 'expire') {
            $user->update([
                'plan' => 'free',
                'subscription_expires_at' => null,
            ]);
            return response()->json(['success' => true, 'message' => 'Subscription expired manually']);
        }

        if ($action === 'extend' && $days) {
            $currentExpiresAt = $user->subscription_expires_at ? \Carbon\Carbon::parse($user->subscription_expires_at) : now();
            $user->update([
                'subscription_expires_at' => $currentExpiresAt->addDays($days),
            ]);
            return response()->json(['success' => true, 'message' => "Subscription extended by {$days} days"]);
        }

        // upgrade or downgrade
        $expiresAt = $days ? now()->addDays($days) : ($user->subscription_expires_at ?? now()->addDays(30));
        
        $user->update([
            'plan' => $plan,
            'subscription_expires_at' => $expiresAt,
        ]);

        return response()->json(['success' => true, 'message' => "User plan updated to {$plan}"]);
    }
}
