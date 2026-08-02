<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;
use MongoDB\Laravel\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Cache;

use DateTimeInterface;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Create a Sanctum token stored in MongoDB (bypasses SQL-only NewAccessToken type).
     *
     * @param  array<int, string>  $abilities
     */
    public function createToken(string $name, array $abilities = ['*'], ?DateTimeInterface $expiresAt = null): object
    {
        $plainTextToken = $this->generateTokenString();

        $accessToken = $this->tokens()->create([
            'name' => $name,
            'token' => hash('sha256', $plainTextToken),
            'abilities' => $abilities,
            'expires_at' => $expiresAt,
        ]);

        return new class($accessToken, $accessToken->getKey().'|'.$plainTextToken)
        {
            public function __construct(
                public PersonalAccessToken $accessToken,
                public string $plainTextToken,
            ) {}
        };
    }

    protected static function booted(): void
    {
        static::saved(static function ($user) {
            Cache::forget('api.reports.dashboard');
            Cache::forget('api.dashboard.summary');
            
            // Trigger recalculation for the current month
            $now = now();
            try {
                \App\Models\SalaryRecord::recalculate($user->id, (int) $now->month, (int) $now->year);
            } catch (\Throwable $e) {
                // Safe to ignore if class/tables are not initialized yet
            }
        });
        static::deleted(static function ($user) {
            Cache::forget('api.reports.dashboard');
            Cache::forget('api.dashboard.summary');

            \App\Models\Employee::where('user_id', $user->id)->delete();
            \App\Models\Invoice::where('user_id', $user->id)->delete();
            \App\Models\Firm::where('user_id', $user->id)->delete();
            \App\Models\Attendance::where('user_id', $user->id)->delete();
            \App\Models\SalaryRecord::where('user_id', $user->id)->delete();
            \App\Models\ContactMessage::where('user_id', $user->id)->delete();
            \App\Models\Notification::where('user_id', $user->id)->delete();
        });
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'employee_id',
        'department',
        'designation',
        'salary',
        'absent_deduction_per_day',
        'overtime_rate_per_hour',
        'joining_date',
        'is_blocked',
        'blocked_at',
        'blocked_reason',
        'plan',
        'subscription_expires_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'salary' => 'float',
            'absent_deduction_per_day' => 'float',
            'overtime_rate_per_hour' => 'float',
            'joining_date' => 'date',
            'is_blocked' => 'boolean',
            'blocked_at' => 'datetime',
            'subscription_expires_at' => 'datetime',
        ];
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }
}
