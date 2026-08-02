<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\SystemStatusService;
use Illuminate\Http\Request;

class SystemController extends Controller
{
    public function index(Request $request)
    {
        $payload = [
            'backend' => 'ok',
            'application' => SystemStatusService::application(),
            'database' => SystemStatusService::database(),
            'queue' => SystemStatusService::queue(),
            'storage' => SystemStatusService::storage(),
            'cache' => SystemStatusService::cache(),
            'mail' => SystemStatusService::mail(),
        ];

        // 🔥 Force JSON response (no view)
        return response()->json($payload);
    }

    public function statusDashboard(Request $request)
    {
        $status = [
            'backend' => 'ok',
            'application' => SystemStatusService::application(),
            'database' => SystemStatusService::database(),
            'queue' => SystemStatusService::queue(),
            'storage' => SystemStatusService::storage(),
            'cache' => SystemStatusService::cache(),
            'mail' => SystemStatusService::mail(),
        ];

        // 🔥 Force JSON response here as well
        return response()->json($status);
    }
}