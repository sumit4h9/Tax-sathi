<?php

use App\Http\Controllers\Web\AdminUtilityController;
use App\Http\Controllers\Web\FallbackController;
use App\Http\Controllers\Web\HealthController;
use App\Http\Controllers\Web\LoginController;
use App\Http\Controllers\Web\PreviewController;
use App\Http\Controllers\Web\QueueMonitorController;
use App\Http\Controllers\Web\SystemController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Guest / public web routes
|--------------------------------------------------------------------------
*/

Route::get('/login', [LoginController::class, 'show'])->name('login');

Route::get('/', [SystemController::class, 'index'])->name('home');

Route::middleware('throttle:120,1')->prefix('health')->name('health.')->group(function () {
    Route::get('/', [HealthController::class, 'index'])->name('index');
    Route::get('/db', [HealthController::class, 'database'])->name('db');
    Route::get('/queue', [HealthController::class, 'queue'])->name('queue');
    Route::get('/storage', [HealthController::class, 'storage'])->name('storage');
});

Route::middleware('throttle:60,1')
    ->get('/storage-link-check', [HealthController::class, 'storageLinkCheck'])
    ->name('storage-link-check');

/*
|--------------------------------------------------------------------------
| Authenticated web routes (Sanctum bearer or SPA session)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:admin', 'throttle:30,1'])
    ->get('/queue/status', [QueueMonitorController::class, 'status'])
    ->name('queue.status');

Route::middleware(['auth:sanctum', 'role:admin', 'throttle:20,1'])
    ->get('/system/status', [SystemController::class, 'statusDashboard'])
    ->name('system.status');

Route::middleware(['auth:sanctum', 'role:admin,staff', 'throttle:30,1'])
    ->get('/preview/invoice/{invoice}', [PreviewController::class, 'invoice'])
    ->name('preview.invoice');

Route::middleware(['auth:sanctum', 'role:admin', 'mail.preview', 'throttle:20,1'])
    ->prefix('preview/mail')
    ->name('preview.mail.')
    ->group(function () {
        Route::get('/invoice/{invoice}', [PreviewController::class, 'mailInvoice'])->name('invoice');
        Route::get('/contact', [PreviewController::class, 'mailContact'])->name('contact');
    });

Route::middleware(['auth:sanctum', 'role:admin', 'admin.web', 'throttle:6,1'])
    ->prefix('admin/utilities')
    ->name('admin.utilities.')
    ->group(function () {
        Route::post('/cache-clear', [AdminUtilityController::class, 'clearCache'])->name('cache-clear');
        Route::post('/config-clear', [AdminUtilityController::class, 'clearConfig'])->name('config-clear');
        Route::post('/route-cache', [AdminUtilityController::class, 'routeCache'])->name('route-cache');
        Route::post('/optimize', [AdminUtilityController::class, 'optimize'])->name('optimize');
        Route::post('/optimize-clear', [AdminUtilityController::class, 'optimizeClear'])->name('optimize-clear');
        Route::post('/queue-restart', [AdminUtilityController::class, 'queueRestart'])->name('queue-restart');
    });

/*
|--------------------------------------------------------------------------
| Fallback (JSON; no stack traces)
|--------------------------------------------------------------------------
*/

Route::fallback(FallbackController::class)->name('web.fallback');
