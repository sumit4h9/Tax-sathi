<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LoginController extends Controller
{
    public function show(Request $request)
    {
        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return response(
            'Authentication required. Use POST /api/auth/login for a Sanctum token, then Authorization: Bearer …',
            401,
            ['Content-Type' => 'text/plain; charset=UTF-8']
        );
    }
}
