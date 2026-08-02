<?php

namespace App\Http\Controllers\API\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->where('role', 'admin') // We consider 'admin' as the platform user
            ->orderByDesc('created_at')
            ->get()
            ->map(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone ?? 'N/A', // Assuming phone might be available or not
                    'joined_date' => $user->created_at,
                    'plan' => $user->plan ?? 'free',
                    'status' => $user->is_blocked ? 'blocked' : 'active',
                    'total_invoices' => \App\Models\Invoice::where('user_id', $user->id)->count(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    public function show(string $id)
    {
        $user = User::query()->findOrFail($id);

        $totalInvoices = \App\Models\Invoice::where('user_id', $user->id)->count();
        $totalRevenue = \App\Models\Invoice::where('user_id', $user->id)->sum('total_amount');
        $totalClients = \App\Models\Firm::where('user_id', $user->id)->count();
        $totalEmployees = \App\Models\Employee::where('user_id', $user->id)->count();

        $stats = [
            'total_invoices' => $totalInvoices,
            'total_revenue' => round((float) $totalRevenue, 2),
            'total_clients' => $totalClients,
            'total_employees' => $totalEmployees,
            'registration_date' => $user->created_at,
            'last_login_date' => $user->tokens()->latest('last_used_at')->value('last_used_at'),
            'current_plan' => $user->plan ?? 'free',
            'status' => $user->is_blocked ? 'blocked' : 'active',
            'subscription_expires_at' => $user->subscription_expires_at,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'profile' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_blocked' => $user->is_blocked,
                    'blocked_reason' => $user->blocked_reason,
                ],
                'stats' => $stats,
            ]
        ]);
    }

    public function block(Request $request, string $id)
    {
        $user = User::query()->findOrFail($id);
        $user->update([
            'is_blocked' => true,
            'blocked_at' => now(),
            'blocked_reason' => $request->input('reason', 'Violation of terms'),
        ]);

        // Revoke tokens to force logout immediately
        $user->tokens()->delete();

        return response()->json(['success' => true, 'message' => 'User blocked successfully']);
    }

    public function unblock(string $id)
    {
        $user = User::query()->findOrFail($id);
        $user->update([
            'is_blocked' => false,
            'blocked_at' => null,
            'blocked_reason' => null,
        ]);

        return response()->json(['success' => true, 'message' => 'User unblocked successfully']);
    }

    public function destroy(string $id)
    {
        $user = User::query()->findOrFail($id);
        
        // This will trigger the `deleted` event in User model, which handles cascading deletes
        $user->delete();

        return response()->json(['success' => true, 'message' => 'User and all related records deleted permanently']);
    }
}
