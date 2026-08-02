<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Blocks dangerous admin web utilities in production unless explicitly enabled in config.
 */
class EnsureAdminWebUtilitiesEnabled
{
    public function handle(Request $request, Closure $next): Response
    {
        if (app()->isProduction() && ! config('system.allow_admin_web_utilities')) {
            abort(404);
        }

        return $next($request);
    }
}
