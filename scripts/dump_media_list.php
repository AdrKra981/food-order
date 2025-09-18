<?php

// Usage: php scripts/dump_media_list.php [limit]
// Boots Laravel and prints last N media rows for inspection.
$cwd = __DIR__.'/..';
chdir($cwd);
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$limit = isset($argv[1]) ? (int) $argv[1] : 50;
use App\Models\Media;

$rows = Media::with('restaurant')->latest()->take($limit)->get();
$out = [];
foreach ($rows as $m) {
    $out[] = [
        'id' => $m->id,
        'restaurant_id' => $m->restaurant_id,
        'filename' => $m->filename,
        'path' => $m->path,
        'public_url' => $m->public_url,
        'restaurant' => $m->restaurant ? ['id' => $m->restaurant->id, 'name' => $m->restaurant->name] : null,
    ];
}
echo json_encode($out, JSON_PRETTY_PRINT);
