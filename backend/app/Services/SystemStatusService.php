<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SystemStatusService
{
    /**
     * @return array<string, mixed>
     */
    public static function application(): array
    {
        return [
            'name' => (string) config('app.name'),
            'environment' => app()->environment(),
            'debug' => (bool) config('app.debug'),
            'api_version' => (string) config('system.api_version'),
            'laravel_version' => app()->version(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function database(): array
    {
        $driver = (string) config('database.default');

        try {
            $connection = DB::connection();
            if ($driver === 'mongodb' && method_exists($connection, 'ping')) {
                $connection->ping();
            } else {
                $connection->getPdo();
            }
            $connected = true;
            $error = null;
        } catch (\Throwable $e) {
            $connected = false;
            $error = config('app.debug') ? $e->getMessage() : 'connection_failed';
        }

        return [
            'status' => $connected ? 'ok' : 'error',
            'driver' => $driver,
            'error' => $error,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function queue(): array
    {
        $default = (string) config('queue.default');
        $failedCount = null;
        $pendingCount = null;

        if ($default !== 'sync') {
            if (Schema::hasTable('failed_jobs')) {
                try {
                    $failedCount = (int) DB::table('failed_jobs')->count();
                } catch (\Throwable) {
                    $failedCount = null;
                }
            }

            if ($default === 'database' && Schema::hasTable('jobs')) {
                try {
                    $pendingCount = (int) DB::table('jobs')->count();
                } catch (\Throwable) {
                    $pendingCount = null;
                }
            }
        }

        return [
            'status' => 'ok',
            'connection' => $default,
            'failed_jobs' => $failedCount,
            'pending_jobs' => $pendingCount,
            'note' => $default === 'sync' ? 'sync_driver_no_pending_queue' : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function storage(): array
    {
        $disk = config('filesystems.default');
        $publicWritable = is_writable(public_path());
        $storageWritable = is_writable(storage_path());
        $bootstrapCacheWritable = is_writable(base_path('bootstrap/cache'));

        $linkTarget = public_path('storage');
        $symlinkOk = is_link($linkTarget) || file_exists($linkTarget);

        return [
            'status' => ($publicWritable && $storageWritable) ? 'ok' : 'degraded',
            'default_disk' => is_string($disk) ? $disk : 'unknown',
            'public_writable' => $publicWritable,
            'storage_writable' => $storageWritable,
            'bootstrap_cache_writable' => $bootstrapCacheWritable,
            'public_storage_linked' => $symlinkOk,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function cache(): array
    {
        $store = (string) config('cache.default');

        try {
            $key = '_health:'.uniqid('', true);
            Cache::put($key, 1, 5);
            $ok = Cache::get($key) === 1;
            Cache::forget($key);
        } catch (\Throwable) {
            $ok = false;
        }

        return [
            'status' => $ok ? 'ok' : 'error',
            'store' => $store,
        ];
    }

    /**
     * Safe mail summary (no secrets).
     *
     * @return array<string, mixed>
     */
    public static function mail(): array
    {
        return [
            'default_mailer' => (string) config('mail.default'),
            'from_address_configured' => filled(config('mail.from.address')),
            'from_name_configured' => filled(config('mail.from.name')),
        ];
    }
}
