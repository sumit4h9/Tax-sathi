<?php

namespace App\Http\Controllers\API\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Invoice;
use App\Models\ContactMessage;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function dashboard(Request $request)
    {
        $today = now()->startOfDay();
        $thisMonth = now()->startOfMonth();

        $totalUsers = User::query()->where('role', 'admin')->count();
        $activeUsers = User::query()->where('role', 'admin')->where('is_blocked', '!=', true)->count();
        $blockedUsers = User::query()->where('role', 'admin')->where('is_blocked', true)->count();

        $newUsersThisMonth = User::query()->where('role', 'admin')->where('created_at', '>=', $thisMonth)->count();
        $newUsersToday = User::query()->where('role', 'admin')->where('created_at', '>=', $today)->count();

        $totalInvoices = Invoice::query()->count();
        $totalRevenue = Invoice::query()->sum('total_amount');

        $totalContactMessages = ContactMessage::query()->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'blocked_users' => $blockedUsers,
                'new_users_this_month' => $newUsersThisMonth,
                'new_users_today' => $newUsersToday,
                'total_invoices' => $totalInvoices,
                'total_revenue' => round((float) $totalRevenue, 2),
                'total_contact_messages' => $totalContactMessages,
            ]
        ]);
    }
}
