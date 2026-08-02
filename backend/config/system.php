<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Public API version (informational; used by / and health payloads)
    |--------------------------------------------------------------------------
    */
    'api_version' => env('API_VERSION', '1'),

    /*
    |--------------------------------------------------------------------------
    | Dangerous web admin utilities (POST /admin/utilities/*)
    |--------------------------------------------------------------------------
    |
    | In production these routes return 404 unless explicitly enabled.
    | Never enable on public internet without additional network controls.
    |
    */
    'allow_admin_web_utilities' => (bool) env('ALLOW_ADMIN_WEB_UTILITIES', false),

    /*
    |--------------------------------------------------------------------------
    | Mail preview routes (GET /preview/mail/*)
    |--------------------------------------------------------------------------
    |
    | Only active in the local environment by default.
    |
    */
    'allow_mail_previews' => (bool) env('ALLOW_MAIL_WEB_PREVIEWS', false),

];
