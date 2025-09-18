<?php

// Usage: php scripts/dump_media.php <id>
// Boots Laravel framework and dumps Media record as JSON for inspection.
$cwd = __DIR__.'/..';
chdir($cwd);
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$id = $argv[1] ?? null;
if (! $id) {
    echo "Usage: php scripts/dump_media.php <id>\n";
    exit(1);
}

use App\Models\Media;

try {
    $media = Media::with('restaurant')->find($id);
    if (! $media) {
        echo json_encode(['error' => 'not_found', 'id' => (int) $id]);
        exit(0);
    }

    $out = [
        'id' => $media->id,
        'restaurant_id' => $media->restaurant_id,
        'filename' => $media->filename,
        'path' => $media->path,
        'public_url' => $media->public_url,
        'restaurant' => $media->restaurant ? ['id' => $media->restaurant->id, 'user_id' => $media->restaurant->user_id, 'name' => $media->restaurant->name] : null,
    ];
    echo json_encode($out, JSON_PRETTY_PRINT);
} catch (\Throwable $e) {
    echo json_encode(['error' => 'exception', 'message' => $e->getMessage()]);
}
