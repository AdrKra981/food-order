<?php

namespace App\Services;

use App\Models\Restaurant;

class DeliveryValidationService
{
    /**
     * Calculate the distance between two coordinates using the Haversine formula
     *
     * @param  float  $lat1  Restaurant latitude
     * @param  float  $lon1  Restaurant longitude
     * @param  float  $lat2  Delivery address latitude
     * @param  float  $lon2  Delivery address longitude
     * @return float Distance in kilometers
     */
    public function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // Earth's radius in kilometers

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Check if delivery is possible to the given address
     */
    public function validateDelivery(Restaurant $restaurant, float $deliveryLat, float $deliveryLng): array
    {
        // Calculate distance
        $distance = $this->calculateDistance(
            $restaurant->lat,
            $restaurant->lng,
            $deliveryLat,
            $deliveryLng
        );

        $deliveryPossible = $distance <= $restaurant->delivery_range_km;

        return [
            'delivery_possible' => $deliveryPossible,
            'distance_km' => round($distance, 2),
            'max_delivery_range_km' => $restaurant->delivery_range_km,
            'restaurant_name' => $restaurant->name,
        ];
    }

    /**
     * Validate delivery for multiple restaurants in cart
     */
    public function validateCartDelivery(array $cartByRestaurant, float $deliveryLat, float $deliveryLng): array
    {
        $results = [];
        $allDeliverable = true;

        foreach ($cartByRestaurant as $restaurantCart) {
            $restaurant = $restaurantCart['restaurant'];

            $validation = $this->validateDelivery($restaurant, $deliveryLat, $deliveryLng);

            if (! $validation['delivery_possible']) {
                $allDeliverable = false;
            }

            $results[] = $validation;
        }

        return [
            'all_deliverable' => $allDeliverable,
            'restaurants' => $results,
        ];
    }
}
