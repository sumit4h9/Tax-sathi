<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\SystemStatusService;
use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'checks' => [
                'database' => SystemStatusService::database(),
                'queue' => SystemStatusService::queue(),
                'storage' => SystemStatusService::storage(),
                'cache' => SystemStatusService::cache(),
            ],
        ]);
    }

    public function database(): JsonResponse
    {
        return response()->json(SystemStatusService::database());
    }

    public function queue(): JsonResponse
    {
        return response()->json(SystemStatusService::queue());
    }

    public function storage(): JsonResponse
    {
        return response()->json(SystemStatusService::storage());
    }

    public function storageLinkCheck(): JsonResponse
    {
        $target = public_path('storage');
        $exists = file_exists($target) || is_link($target);

        return response()->json([
            'public_storage_path' => 'public/storage',
            'exists' => $exists,
            'is_symlink' => is_link($target),
        ]);
    }
}
