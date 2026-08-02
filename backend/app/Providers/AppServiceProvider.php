<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Sanctum::usePersonalAccessTokenModel(\App\Models\PersonalAccessToken::class);

        JsonResource::withoutWrapping();

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(180)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth-login', function (Request $request) {
            return Limit::perMinute(12)->by($request->ip());
        });

        RateLimiter::for('contact-form', function (Request $request) {
            return Limit::perMinute(8)->by($request->ip());
        });

        $this->logMongoConnectionStatus();
    }

    private function logMongoConnectionStatus(): void
    {
        if (config('database.default') !== 'mongodb') {
            return;
        }

        $database = (string) config('database.connections.mongodb.database');

        try {
            $connection = DB::connection('mongodb');
            $connection->getClient()
                ->selectDatabase($database)
                ->command(['ping' => 1]);

            Log::info('MongoDB connection successful', [
                'database' => $database,
            ]);
        } catch (\Throwable $e) {
            Log::error('MongoDB connection failed', [
                'database' => $database,
                'message' => $e->getMessage(),
            ]);
        }
    }
}
