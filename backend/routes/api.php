<?php

/*
|--------------------------------------------------------------------------
| REST API (versionless; consumed by Next.js)
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\API\AttendanceController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ContactController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\EmployeeController;
use App\Http\Controllers\API\FirmController;
use App\Http\Controllers\API\InvoiceController;
use App\Http\Controllers\API\ReportController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\SalaryController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register'])
    ->middleware('throttle:auth-login');
Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:auth-login');

Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('throttle:contact-form');

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::get('/user', [UserController::class, 'current']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/team', [UserController::class, 'index']);
    Route::get('/firms', [FirmController::class, 'index']);

    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

    // Invoices: staff may view; admin manages
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::get('/invoices/{invoice}', [InvoiceController::class, 'show']);
    Route::get('/invoices/{invoice}/pdf', [InvoiceController::class, 'downloadPdf']);

    // Attendance: staff + admin
    Route::post('/attendance', [AttendanceController::class, 'bulkStore']);
    Route::get('/attendance', [AttendanceController::class, 'byDate']);
    Route::get('/attendance/history/{employee}', [AttendanceController::class, 'history']);

    Route::middleware('role:admin')->group(function () {
        Route::post('/firms', [FirmController::class, 'store']);

        Route::apiResource('employees', EmployeeController::class);

        Route::get('/salaries', [SalaryController::class, 'index']);
        Route::put('/salaries/{id}', [SalaryController::class, 'update']);
        Route::get('/salaries/export/pdf', [SalaryController::class, 'exportPdf']);
        Route::get('/salaries/export/excel', [SalaryController::class, 'exportExcel']);
        Route::get('/salaries/employee/{employee_id}', [SalaryController::class, 'employeeDetail']);

        Route::post('/invoices', [InvoiceController::class, 'store']);
        Route::put('/invoices/{invoice}', [InvoiceController::class, 'update']);
        Route::patch('/invoices/{invoice}', [InvoiceController::class, 'update']);
        Route::delete('/invoices/{invoice}', [InvoiceController::class, 'destroy']);
        Route::post('/invoices/{invoice}/send-email', [InvoiceController::class, 'sendEmail']);

        Route::apiResource('attendances', AttendanceController::class);

        Route::get('/reports/dashboard', [ReportController::class, 'dashboard']);
        Route::get('/reports/attendance', [ReportController::class, 'attendance']);
        Route::get('/reports/attendance/yearly', [ReportController::class, 'attendanceYearly']);
        Route::get('/reports/invoices', [ReportController::class, 'invoices']);
    });

    Route::middleware('role:super_admin')->prefix('super-admin')->group(function () {
        Route::get('/analytics', [\App\Http\Controllers\API\SuperAdmin\AnalyticsController::class, 'dashboard']);
        
        Route::get('/users', [\App\Http\Controllers\API\SuperAdmin\UserController::class, 'index']);
        Route::get('/users/{user}', [\App\Http\Controllers\API\SuperAdmin\UserController::class, 'show']);
        Route::post('/users/{user}/block', [\App\Http\Controllers\API\SuperAdmin\UserController::class, 'block']);
        Route::post('/users/{user}/unblock', [\App\Http\Controllers\API\SuperAdmin\UserController::class, 'unblock']);
        Route::delete('/users/{user}', [\App\Http\Controllers\API\SuperAdmin\UserController::class, 'destroy']);
        
        Route::post('/users/{user}/subscription', [\App\Http\Controllers\API\SuperAdmin\SubscriptionController::class, 'updatePlan']);
        
        Route::post('/notifications', [\App\Http\Controllers\API\SuperAdmin\NotificationController::class, 'store']);
        
        Route::get('/contact-messages', [\App\Http\Controllers\API\SuperAdmin\ContactMessageController::class, 'index']);
        Route::patch('/contact-messages/{message}/status', [\App\Http\Controllers\API\SuperAdmin\ContactMessageController::class, 'updateStatus']);
        Route::post('/contact-messages/{message}/reply', [\App\Http\Controllers\API\SuperAdmin\ContactMessageController::class, 'reply']);
        Route::delete('/contact-messages/{message}', [\App\Http\Controllers\API\SuperAdmin\ContactMessageController::class, 'destroy']);
    });
});
