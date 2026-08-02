<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Mail HTML previews are for local/dev only unless explicitly enabled.
 */
class EnsureMailWebPreviewsEnabled
{
    public function handle(Request $request, Closure $next): Response
    {
        $allowed = app()->isLocal() || config('system.allow_mail_previews');

        if (! $allowed) {
            abort(404);
        }

        return $next($request);
    }
}
