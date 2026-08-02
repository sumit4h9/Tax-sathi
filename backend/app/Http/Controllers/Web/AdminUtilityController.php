<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;

class AdminUtilityController extends Controller
{
    public function clearCache(): JsonResponse
    {
        Artisan::call('cache:clear');

        return $this->utilityResponse('cache:clear');
    }

    public function clearConfig(): JsonResponse
    {
        Artisan::call('config:clear');

        return $this->utilityResponse('config:clear');
    }

    public function routeCache(): JsonResponse
    {
        Artisan::call('route:cache');

        return $this->utilityResponse('route:cache');
    }

    public function optimize(): JsonResponse
    {
        Artisan::call('optimize');

        return $this->utilityResponse('optimize');
    }

    public function optimizeClear(): JsonResponse
    {
        Artisan::call('optimize:clear');

        return $this->utilityResponse('optimize:clear');
    }

    public function queueRestart(): JsonResponse
    {
        Artisan::call('queue:restart');

        return $this->utilityResponse('queue:restart');
    }

    private function utilityResponse(string $command): JsonResponse
    {
        $payload = [
            'ok' => true,
            'command' => $command,
        ];

        if (config('app.debug')) {
            $payload['artisan_output'] = trim(Artisan::output());
        }

        return response()->json($payload);
    }
}
