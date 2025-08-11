<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Vendor;
use App\Models\Client;
use App\Models\OrderTracking;

class SpatialQueryService
{
    /**
     * Trouve les vendeurs dans un rayon donné avec une requête SQL spatiale optimisée
     */
    public static function getVendorsInRadiusOptimized(float $latitude, float $longitude, float $radiusKm = 10): array
    {
        try {
            // Utilisation de la formule Haversine optimisée avec index spatial
            $sql = "
                SELECT 
                    v.*,
                    u.name as user_name,
                    u.email,
                    (
                        6371 * acos(
                            cos(radians(?)) * 
                            cos(radians(latitude)) * 
                            cos(radians(longitude) - radians(?)) + 
                            sin(radians(?)) * 
                            sin(radians(latitude))
                        )
                    ) AS distance
                FROM vendors v
                JOIN users u ON v.user_id = u.id
                WHERE v.latitude IS NOT NULL 
                AND v.longitude IS NOT NULL
                AND v.is_verified = 1
                AND v.is_open = 1
                HAVING distance <= ?
                ORDER BY distance ASC
            ";

            $vendors = DB::select($sql, [$latitude, $longitude, $latitude, $radiusKm]);
            
            return collect($vendors)->map(function ($vendor) {
                return [
                    'id' => $vendor->id,
                    'name' => $vendor->name,
                    'description' => $vendor->description,
                    'address' => $vendor->address,
                    'city' => $vendor->city,
                    'phone' => $vendor->phone,
                    'email' => $vendor->email,
                    'cuisine_type' => $vendor->cuisine_type,
                    'rating' => $vendor->rating ?? 0,
                    'review_count' => $vendor->review_count ?? 0,
                    'delivery_fee' => $vendor->delivery_fee,
                    'delivery_time' => $vendor->delivery_time,
                    'minimum_order' => $vendor->minimum_order,
                    'is_verified' => $vendor->is_verified,
                    'is_featured' => $vendor->is_featured,
                    'latitude' => $vendor->latitude,
                    'longitude' => $vendor->longitude,
                    'distance' => round($vendor->distance, 2),
                    'user_name' => $vendor->user_name,
                ];
            })->toArray();

        } catch (\Exception $e) {
            Log::error('Erreur lors de la requête spatiale optimisée: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Trouve les vendeurs dans une zone rectangulaire (plus rapide que le rayon)
     */
    public static function getVendorsInBoundingBox(float $minLat, float $maxLat, float $minLng, float $maxLng): array
    {
        try {
            $vendors = Vendor::whereBetween('latitude', [$minLat, $maxLat])
                ->whereBetween('longitude', [$minLng, $maxLng])
                ->where('is_verified', 1)
                ->where('is_open', 1)
                ->with('user')
                ->get();

            return $vendors->map(function ($vendor) {
                return [
                    'id' => $vendor->id,
                    'name' => $vendor->name,
                    'description' => $vendor->description,
                    'address' => $vendor->address,
                    'city' => $vendor->city,
                    'phone' => $vendor->phone,
                    'email' => $vendor->email,
                    'cuisine_type' => $vendor->cuisine_type,
                    'rating' => $vendor->rating ?? 0,
                    'review_count' => $vendor->review_count ?? 0,
                    'delivery_fee' => $vendor->delivery_fee,
                    'delivery_time' => $vendor->delivery_time,
                    'minimum_order' => $vendor->minimum_order,
                    'is_verified' => $vendor->is_verified,
                    'is_featured' => $vendor->is_featured,
                    'latitude' => $vendor->latitude,
                    'longitude' => $vendor->longitude,
                    'user_name' => $vendor->user->name ?? '',
                ];
            })->toArray();

        } catch (\Exception $e) {
            Log::error('Erreur lors de la requête bounding box: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Calcule la distance optimale entre deux points avec cache
     */
    public static function calculateOptimalDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $cacheKey = "distance_{$lat1}_{$lon1}_{$lat2}_{$lon2}";
        
        // Vérifier le cache
        if (cache()->has($cacheKey)) {
            return cache()->get($cacheKey);
        }

        // Calculer la distance
        $distance = self::calculateHaversineDistance($lat1, $lon1, $lat2, $lon2);
        
        // Mettre en cache pour 1 heure
        cache()->put($cacheKey, $distance, 3600);
        
        return $distance;
    }

    /**
     * Trouve le vendeur le plus proche d'un client
     */
    public static function findNearestVendor(float $clientLat, float $clientLng): ?array
    {
        try {
            $sql = "
                SELECT 
                    v.*,
                    (
                        6371 * acos(
                            cos(radians(?)) * 
                            cos(radians(latitude)) * 
                            cos(radians(longitude) - radians(?)) + 
                            sin(radians(?)) * 
                            sin(radians(latitude))
                        )
                    ) AS distance
                FROM vendors v
                WHERE v.latitude IS NOT NULL 
                AND v.longitude IS NOT NULL
                AND v.is_verified = 1
                AND v.is_open = 1
                ORDER BY distance ASC
                LIMIT 1
            ";

            $vendors = DB::select($sql, [$clientLat, $clientLng, $clientLat]);
            
            if (empty($vendors)) {
                return null;
            }

            $vendor = $vendors[0];
            return [
                'id' => $vendor->id,
                'name' => $vendor->name,
                'address' => $vendor->address,
                'distance' => round($vendor->distance, 2),
                'latitude' => $vendor->latitude,
                'longitude' => $vendor->longitude,
            ];

        } catch (\Exception $e) {
            Log::error('Erreur lors de la recherche du vendeur le plus proche: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Trouve les clients dans un rayon donné (pour les notifications)
     */
    public static function getClientsInRadius(float $latitude, float $longitude, float $radiusKm = 5): array
    {
        try {
            $sql = "
                SELECT 
                    c.*,
                    u.name,
                    u.email,
                    (
                        6371 * acos(
                            cos(radians(?)) * 
                            cos(radians(latitude)) * 
                            cos(radians(longitude) - radians(?)) + 
                            sin(radians(?)) * 
                            sin(radians(latitude))
                        )
                    ) AS distance
                FROM clients c
                JOIN users u ON c.user_id = u.id
                WHERE c.latitude IS NOT NULL 
                AND c.longitude IS NOT NULL
                AND u.status = 'active'
                HAVING distance <= ?
                ORDER BY distance ASC
            ";

            $clients = DB::select($sql, [$latitude, $longitude, $latitude, $radiusKm]);
            
            return collect($clients)->map(function ($client) {
                return [
                    'id' => $client->id,
                    'user_id' => $client->user_id,
                    'name' => $client->name,
                    'email' => $client->email,
                    'phone' => $client->phone,
                    'address' => $client->address,
                    'latitude' => $client->latitude,
                    'longitude' => $client->longitude,
                    'distance' => round($client->distance, 2),
                ];
            })->toArray();

        } catch (\Exception $e) {
            Log::error('Erreur lors de la recherche des clients dans le rayon: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Calcule la distance Haversine optimisée
     */
    private static function calculateHaversineDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
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
     * Génère une zone de recherche optimisée (grille)
     */
    public static function generateSearchGrid(float $centerLat, float $centerLng, float $radiusKm): array
    {
        $gridSize = 0.01; // Taille de la grille en degrés
        $grid = [];
        
        $latRange = $radiusKm / 111; // 1 degré ≈ 111 km
        $lngRange = $radiusKm / (111 * cos(deg2rad($centerLat)));
        
        for ($lat = $centerLat - $latRange; $lat <= $centerLat + $latRange; $lat += $gridSize) {
            for ($lng = $centerLng - $lngRange; $lng <= $centerLng + $lngRange; $lng += $gridSize) {
                $grid[] = [
                    'lat' => $lat,
                    'lng' => $lng,
                    'distance' => self::calculateHaversineDistance($centerLat, $centerLng, $lat, $lng)
                ];
            }
        }
        
        return $grid;
    }
}
