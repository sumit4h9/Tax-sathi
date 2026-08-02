<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class FallbackController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'message' => 'Not Found',
        ], 404);
    }
}
