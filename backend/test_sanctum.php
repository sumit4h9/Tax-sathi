<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = new \App\Models\User();
$user->id = 'super_admin';
$token = $user->createToken('super_admin_token', ['super_admin'])->plainTextToken;
echo "Token created: $token\n";

$dbToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
if ($dbToken) {
    echo "Token found in DB\n";
    $tokenable = $dbToken->tokenable;
    if ($tokenable) {
        echo "Tokenable found: " . get_class($tokenable) . "\n";
    } else {
        echo "Tokenable NOT found in DB!\n";
    }
}
