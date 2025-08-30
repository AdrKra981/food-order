<?php

namespace Database\Factories;

use App\Models\Media;
use App\Models\Restaurant;
use Illuminate\Database\Eloquent\Factories\Factory;

class MediaFactory extends Factory
{
    protected $model = Media::class;

    public function definition()
    {
        $filename = $this->faker->uuid . '.jpg';
        return [
            'restaurant_id' => Restaurant::factory(),
            'filename' => $filename,
            'path' => 'media/' . $filename,
            'type' => 'image',
            'size' => 123456,
            'original_name' => $this->faker->word . '.jpg',
            'mime_type' => 'image/jpeg',
        ];
    }
}
