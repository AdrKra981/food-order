<?php

// Usage: php scripts/simulate_destroy.php <mediaId> <userId>
// Boots Laravel, logs in as userId (owner), and calls MediaController::destroy(Media $media)
$cwd = __DIR__.'/..';
chdir($cwd);
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$id = $argv[1] ?? null;
$userId = $argv[2] ?? null;
if (! $id) {
    echo "Usage: php scripts/simulate_destroy.php <mediaId> <userId>\n";
    exit(1);
}

use App\Http\Controllers\Owner\MediaController;
use App\Models\Media;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

try {
    $media = Media::find($id);
    if (! $media) {
        echo json_encode(['error' => 'media_not_found', 'id' => (int) $id]);
        exit(0);
    }

    if (! $userId) {
        $userId = $media->restaurant?->user_id ?? null;
    }

    $user = $userId ? User::find($userId) : null;
    if ($user) {
        Auth::login($user);
    }

    echo 'Auth user id: '.(Auth::user()?->id ?: 'none')."\n";
    echo "Media before controller: id={$media->id}, restaurant_id={$media->restaurant_id}\n";

    $controller = new MediaController;
    $response = $controller->destroy($media);

    echo 'Controller response type: '.(is_string($response) ? 'string' : gettype($response))."\n";
    if (is_object($response) && method_exists($response, 'getStatusCode')) {
        echo 'Response status: '.$response->getStatusCode()."\n";
    }
    echo "Done\n";
} catch (\Throwable $e) {
    echo json_encode(['error' => 'exception', 'message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
}
