<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Google Maps API Key
    |--------------------------------------------------------------------------
    |
    | This key is used for Google Maps services including Places API,
    | Geocoding API, and Maps JavaScript API.
    |
    */
    'api_key' => env('GOOGLE_MAPS_API_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Default Country Code
    |--------------------------------------------------------------------------
    |
    | This is used to restrict autocomplete results to a specific country.
    | Set to 'pl' for Poland.
    |
    */
    'default_country' => 'pl',

    /*
    |--------------------------------------------------------------------------
    | Default Center Coordinates
    |--------------------------------------------------------------------------
    |
    | Default map center coordinates (Poland center)
    |
    */
    'default_center' => [
        'lat' => 52.0693,
        'lng' => 19.4800,
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Zoom Level
    |--------------------------------------------------------------------------
    |
    | Default zoom level for maps
    |
    */
    'default_zoom' => 6,
];
