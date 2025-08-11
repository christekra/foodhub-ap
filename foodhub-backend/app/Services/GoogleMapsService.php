<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class GoogleMapsService
{
    private static $apiKey;
    private static $baseUrl = 'https://maps.googleapis.com/maps/api';

    /**
     * Initialise la clé API Google Maps
     */
    public static function init()
    {
        self::$apiKey = config('services.google.maps_api_key');
        
        if (!self::$apiKey) {
            Log::warning('Clé API Google Maps non configurée');
        }
    }

    /**
     * Géocodification précise avec Google Maps API
     */
    public static function geocode(string $address): ?array
    {
        if (!self::$apiKey) {
            self::init();
        }

        try {
            $cacheKey = 'google_geocode_' . md5($address);
            
            // Vérifier le cache
            if (Cache::has($cacheKey)) {
                return Cache::get($cacheKey);
            }

            $response = Http::get(self::$baseUrl . '/geocode/json', [
                'address' => $address,
                'key' => self::$apiKey,
                'region' => 'ci', // Côte d'Ivoire
                'language' => 'fr'
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if ($data['status'] === 'OK' && !empty($data['results'])) {
                    $result = $data['results'][0];
                    $location = $result['geometry']['location'];
                    
                    $geocodeData = [
                        'latitude' => $location['lat'],
                        'longitude' => $location['lng'],
                        'formatted_address' => $result['formatted_address'],
                        'place_id' => $result['place_id'],
                        'types' => $result['types'] ?? [],
                        'components' => self::extractAddressComponents($result['address_components']),
                        'accuracy' => $result['geometry']['location_type'] ?? 'unknown'
                    ];

                    // Mettre en cache pour 24 heures
                    Cache::put($cacheKey, $geocodeData, 86400);
                    
                    return $geocodeData;
                }
            }

            Log::warning('Échec de la géocodification Google Maps pour: ' . $address);
            return null;

        } catch (\Exception $e) {
            Log::error('Erreur lors de la géocodification Google Maps: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Géocodification inverse précise
     */
    public static function reverseGeocode(float $latitude, float $longitude): ?array
    {
        if (!self::$apiKey) {
            self::init();
        }

        try {
            $cacheKey = "google_reverse_geocode_{$latitude}_{$longitude}";
            
            if (Cache::has($cacheKey)) {
                return Cache::get($cacheKey);
            }

            $response = Http::get(self::$baseUrl . '/geocode/json', [
                'latlng' => "{$latitude},{$longitude}",
                'key' => self::$apiKey,
                'language' => 'fr'
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if ($data['status'] === 'OK' && !empty($data['results'])) {
                    $result = $data['results'][0];
                    
                    $reverseGeocodeData = [
                        'formatted_address' => $result['formatted_address'],
                        'place_id' => $result['place_id'],
                        'types' => $result['types'] ?? [],
                        'components' => self::extractAddressComponents($result['address_components']),
                        'accuracy' => $result['geometry']['location_type'] ?? 'unknown'
                    ];

                    Cache::put($cacheKey, $reverseGeocodeData, 86400);
                    
                    return $reverseGeocodeData;
                }
            }

            return null;

        } catch (\Exception $e) {
            Log::error('Erreur lors de la géocodification inverse Google Maps: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Calcul d'itinéraire avec Google Directions API
     */
    public static function calculateRoute(float $originLat, float $originLng, float $destLat, float $destLng, string $mode = 'driving'): ?array
    {
        if (!self::$apiKey) {
            self::init();
        }

        try {
            $cacheKey = "google_route_{$originLat}_{$originLng}_{$destLat}_{$destLng}_{$mode}";
            
            if (Cache::has($cacheKey)) {
                return Cache::get($cacheKey);
            }

            $response = Http::get(self::$baseUrl . '/directions/json', [
                'origin' => "{$originLat},{$originLng}",
                'destination' => "{$destLat},{$destLng}",
                'mode' => $mode, // driving, walking, bicycling, transit
                'key' => self::$apiKey,
                'language' => 'fr',
                'units' => 'metric'
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if ($data['status'] === 'OK' && !empty($data['routes'])) {
                    $route = $data['routes'][0];
                    $leg = $route['legs'][0];
                    
                    $routeData = [
                        'distance' => [
                            'text' => $leg['distance']['text'],
                            'value' => $leg['distance']['value'] // en mètres
                        ],
                        'duration' => [
                            'text' => $leg['duration']['text'],
                            'value' => $leg['duration']['value'] // en secondes
                        ],
                        'steps' => array_map(function($step) {
                            return [
                                'instruction' => $step['html_instructions'],
                                'distance' => $step['distance']['text'],
                                'duration' => $step['duration']['text'],
                                'polyline' => $step['polyline']['points'] ?? null
                            ];
                        }, $leg['steps']),
                        'polyline' => $route['overview_polyline']['points'] ?? null,
                        'bounds' => $route['bounds'] ?? null
                    ];

                    Cache::put($cacheKey, $routeData, 3600); // Cache 1 heure
                    
                    return $routeData;
                }
            }

            return null;

        } catch (\Exception $e) {
            Log::error('Erreur lors du calcul d\'itinéraire Google Maps: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Recherche de lieux avec Google Places API
     */
    public static function searchPlaces(string $query, float $latitude, float $longitude, float $radius = 5000): array
    {
        if (!self::$apiKey) {
            self::init();
        }

        try {
            $cacheKey = "google_places_{$query}_{$latitude}_{$longitude}_{$radius}";
            
            if (Cache::has($cacheKey)) {
                return Cache::get($cacheKey);
            }

            $response = Http::get(self::$baseUrl . '/place/nearbysearch/json', [
                'location' => "{$latitude},{$longitude}",
                'radius' => $radius,
                'keyword' => $query,
                'key' => self::$apiKey,
                'language' => 'fr',
                'type' => 'restaurant' // Peut être modifié selon les besoins
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if ($data['status'] === 'OK') {
                    $places = array_map(function($place) {
                        return [
                            'place_id' => $place['place_id'],
                            'name' => $place['name'],
                            'address' => $place['vicinity'] ?? '',
                            'latitude' => $place['geometry']['location']['lat'],
                            'longitude' => $place['geometry']['location']['lng'],
                            'rating' => $place['rating'] ?? null,
                            'user_ratings_total' => $place['user_ratings_total'] ?? 0,
                            'types' => $place['types'] ?? [],
                            'photos' => $place['photos'] ?? [],
                            'opening_hours' => $place['opening_hours'] ?? null,
                            'price_level' => $place['price_level'] ?? null
                        ];
                    }, $data['results']);

                    Cache::put($cacheKey, $places, 3600);
                    
                    return $places;
                }
            }

            return [];

        } catch (\Exception $e) {
            Log::error('Erreur lors de la recherche de lieux Google Maps: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Détails d'un lieu avec Google Places API
     */
    public static function getPlaceDetails(string $placeId): ?array
    {
        if (!self::$apiKey) {
            self::init();
        }

        try {
            $cacheKey = "google_place_details_{$placeId}";
            
            if (Cache::has($cacheKey)) {
                return Cache::get($cacheKey);
            }

            $response = Http::get(self::$baseUrl . '/place/details/json', [
                'place_id' => $placeId,
                'fields' => 'name,formatted_address,geometry,rating,user_ratings_total,formatted_phone_number,website,opening_hours,photos,reviews,price_level,types',
                'key' => self::$apiKey,
                'language' => 'fr'
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if ($data['status'] === 'OK') {
                    $place = $data['result'];
                    
                    $placeDetails = [
                        'place_id' => $placeId,
                        'name' => $place['name'],
                        'formatted_address' => $place['formatted_address'],
                        'latitude' => $place['geometry']['location']['lat'],
                        'longitude' => $place['geometry']['location']['lng'],
                        'rating' => $place['rating'] ?? null,
                        'user_ratings_total' => $place['user_ratings_total'] ?? 0,
                        'formatted_phone_number' => $place['formatted_phone_number'] ?? null,
                        'website' => $place['website'] ?? null,
                        'opening_hours' => $place['opening_hours'] ?? null,
                        'price_level' => $place['price_level'] ?? null,
                        'types' => $place['types'] ?? [],
                        'photos' => $place['photos'] ?? [],
                        'reviews' => $place['reviews'] ?? []
                    ];

                    Cache::put($cacheKey, $placeDetails, 86400); // Cache 24 heures
                    
                    return $placeDetails;
                }
            }

            return null;

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des détails du lieu: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Extraction des composants d'adresse
     */
    private static function extractAddressComponents(array $components): array
    {
        $extracted = [];
        
        foreach ($components as $component) {
            $types = $component['types'];
            $value = $component['long_name'];
            
            if (in_array('street_number', $types)) {
                $extracted['street_number'] = $value;
            } elseif (in_array('route', $types)) {
                $extracted['street'] = $value;
            } elseif (in_array('locality', $types)) {
                $extracted['city'] = $value;
            } elseif (in_array('administrative_area_level_1', $types)) {
                $extracted['state'] = $value;
            } elseif (in_array('country', $types)) {
                $extracted['country'] = $value;
            } elseif (in_array('postal_code', $types)) {
                $extracted['postal_code'] = $value;
            }
        }
        
        return $extracted;
    }

    /**
     * Validation d'adresse avec Google Maps
     */
    public static function validateAddress(string $address): bool
    {
        $geocode = self::geocode($address);
        return $geocode !== null;
    }

    /**
     * Calcul de distance avec Google Distance Matrix API
     */
    public static function calculateDistanceMatrix(array $origins, array $destinations): ?array
    {
        if (!self::$apiKey) {
            self::init();
        }

        try {
            $originsStr = implode('|', array_map(function($origin) {
                return "{$origin['lat']},{$origin['lng']}";
            }, $origins));

            $destinationsStr = implode('|', array_map(function($dest) {
                return "{$dest['lat']},{$dest['lng']}";
            }, $destinations));

            $response = Http::get(self::$baseUrl . '/distancematrix/json', [
                'origins' => $originsStr,
                'destinations' => $destinationsStr,
                'mode' => 'driving',
                'key' => self::$apiKey,
                'language' => 'fr',
                'units' => 'metric'
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if ($data['status'] === 'OK') {
                    return $data['rows'];
                }
            }

            return null;

        } catch (\Exception $e) {
            Log::error('Erreur lors du calcul de matrice de distance: ' . $e->getMessage());
            return null;
        }
    }
}
