<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeolocationService
{
    /**
     * Convertir une adresse en coordonnées géographiques
     */
    public static function geocode(string $address): ?array
    {
        try {
            $response = Http::get('https://nominatim.openstreetmap.org/search', [
                'q' => $address,
                'format' => 'json',
                'limit' => 1,
                'addressdetails' => 1,
                'countrycodes' => 'ci', // Côte d'Ivoire
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if (!empty($data)) {
                    $location = $data[0];
                    return [
                        'latitude' => (float) $location['lat'],
                        'longitude' => (float) $location['lon'],
                        'display_name' => $location['display_name'] ?? $address,
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::error('Erreur lors du geocoding: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Convertir des coordonnées en adresse
     */
    public static function reverseGeocode(float $latitude, float $longitude): ?array
    {
        try {
            $response = Http::get('https://nominatim.openstreetmap.org/reverse', [
                'lat' => $latitude,
                'lon' => $longitude,
                'format' => 'json',
                'zoom' => 18,
                'addressdetails' => 1,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                return [
                    'address' => $data['display_name'] ?? null,
                    'street' => $data['address']['road'] ?? null,
                    'city' => $data['address']['city'] ?? $data['address']['town'] ?? null,
                    'postal_code' => $data['address']['postcode'] ?? null,
                    'country' => $data['address']['country'] ?? null,
                ];
            }
        } catch (\Exception $e) {
            Log::error('Erreur lors du reverse geocoding: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Calculer la distance entre deux points (formule de Haversine)
     */
    public static function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // Rayon de la Terre en km

        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lonDelta / 2) * sin($lonDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Vérifier si un point est dans un rayon donné
     */
    public static function isWithinRadius(float $centerLat, float $centerLon, float $pointLat, float $pointLon, float $radiusKm): bool
    {
        $distance = self::calculateDistance($centerLat, $centerLon, $pointLat, $pointLon);
        return $distance <= $radiusKm;
    }

    /**
     * Obtenir les vendeurs dans un rayon donné
     */
    public static function getVendorsInRadius(float $latitude, float $longitude, float $radiusKm = 10): array
    {
        // Cette méthode pourrait être optimisée avec une requête SQL spatiale
        // Pour l'instant, on utilise une approche simple
        $vendors = \App\Models\Vendor::whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get();

        $vendorsInRadius = [];

        foreach ($vendors as $vendor) {
            if (self::isWithinRadius($latitude, $longitude, $vendor->latitude, $vendor->longitude, $radiusKm)) {
                $vendor->distance = self::calculateDistance($latitude, $longitude, $vendor->latitude, $vendor->longitude);
                $vendorsInRadius[] = $vendor;
            }
        }

        // Trier par distance
        usort($vendorsInRadius, function ($a, $b) {
            return $a->distance <=> $b->distance;
        });

        return $vendorsInRadius;
    }

    /**
     * Mettre à jour les coordonnées d'un modèle
     */
    public static function updateCoordinates($model, string $address): bool
    {
        $coordinates = self::geocode($address);
        
        if ($coordinates) {
            $model->update([
                'latitude' => $coordinates['latitude'],
                'longitude' => $coordinates['longitude'],
            ]);
            return true;
        }

        return false;
    }
}
