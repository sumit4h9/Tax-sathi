<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\SystemStatusService;
use Illuminate\Http\JsonResponse;

class QueueMonitorController extends Controller
{
    /**
     * Authenticated admin view of queue metrics (same core data as /health/queue plus context).
     */
    public function status(): JsonResponse
    {
        return response()->json([
            'queue' => SystemStatusService::queue(),
            'application' => [
                'environment' => app()->environment(),
            ],
        ]);
    }
}
