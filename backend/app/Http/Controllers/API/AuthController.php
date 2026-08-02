<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        $user = User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => 'admin',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => (new UserResource($user->fresh()))->resolve(),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $email = $request->validated('email');
        $password = $request->validated('password');

        // Check for Super Admin credentials
        if ($email === env('ADMIN_USERNAME') && $password === env('ADMIN_PASSWORD')) {
            // Ensure the super admin exists in the DB so Sanctum has a tokenable model
            $user = User::query()->where('email', $email)->first();
            if (!$user) {
                $user = User::query()->create([
                    'email' => $email,
                    'name' => 'Super Admin',
                    'role' => 'super_admin',
                    'password' => Hash::make(\Illuminate\Support\Str::random(32)),
                ]);
            }

            if ($user->role !== 'super_admin') {
                $user->update(['role' => 'super_admin']);
            }
            
            $token = $user->createToken('super_admin_token', ['super_admin'])->plainTextToken;

            return response()->json([
                'user' => (new UserResource($user->fresh()))->resolve(),
                'token' => $token,
            ]);
        }

        $user = User::query()->where('email', $email)->first();

        if (! $user || ! is_string($user->password) || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->is_blocked) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been blocked. Please contact Tax Sathi support.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => (new UserResource($user->fresh()))->resolve(),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
