<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Models\Order;
use App\Models\Vendor;
use App\Models\Client;

class DeliveryRouteService
{
    /**
     * Calcule l'itinéraire optimal pour une commande
     */
    public static function calculateDeliveryRoute(int $orderId): ?array
    {
        try {
            $order = Order::with(['vendor', 'client'])->find($orderId);
            
            if (!$order || !$order->vendor || !$order->client) {
                return null;
            }

            $vendor = $order->vendor;
            $client = $order->client;

            // Vérifier si les coordonnées sont disponibles
            if (!$vendor->latitude || !$vendor->longitude || !$client->latitude || !$client->longitude) {
                Log::warning("Coordonnées manquantes pour l'itinéraire de commande {$orderId}");
                return null;
            }

            // Calculer l'itinéraire avec Google Maps
            $route = GoogleMapsService::calculateRoute(
                $vendor->latitude,
                $vendor->longitude,
                $client->latitude,
                $client->longitude,
                'driving'
            );

            if (!$route) {
                // Fallback: calcul simple avec Haversine
                $route = self::calculateSimpleRoute($vendor, $client);
            }

            return [
                'order_id' => $orderId,
                'vendor_location' => [
                    'latitude' => $vendor->latitude,
                    'longitude' => $vendor->longitude,
                    'address' => $vendor->address,
                    'name' => $vendor->name
                ],
                'client_location' => [
                    'latitude' => $client->latitude,
                    'longitude' => $client->longitude,
                    'address' => $client->address,
                    'name' => $client->name
                ],
                'route' => $route,
                'estimated_delivery_time' => self::calculateEstimatedDeliveryTime($route, $order),
                'optimization_score' => self::calculateOptimizationScore($route)
            ];

        } catch (\Exception $e) {
            Log::error('Erreur lors du calcul d\'itinéraire de livraison: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Calcule l'itinéraire optimal pour plusieurs commandes (optimisation de tournée)
     */
    public static function calculateMultiDeliveryRoute(array $orderIds, float $startLat, float $startLng): ?array
    {
        try {
            $orders = Order::with(['vendor', 'client'])->whereIn('id', $orderIds)->get();
            
            if ($orders->isEmpty()) {
                return null;
            }

            // Créer la matrice de distances
            $locations = self::createLocationMatrix($orders, $startLat, $startLng);
            
            // Appliquer l'algorithme du plus proche voisin
            $route = self::nearestNeighborAlgorithm($locations);
            
            // Optimiser avec l'algorithme 2-opt
            $optimizedRoute = self::twoOptOptimization($route, $locations);
            
            return [
                'orders' => $orderIds,
                'route' => $optimizedRoute,
                'total_distance' => self::calculateTotalDistance($optimizedRoute, $locations),
                'total_time' => self::calculateTotalTime($optimizedRoute, $locations),
                'optimization_score' => self::calculateMultiRouteOptimizationScore($optimizedRoute, $locations)
            ];

        } catch (\Exception $e) {
            Log::error('Erreur lors du calcul d\'itinéraire multi-livraison: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Trouve le livreur optimal pour une commande
     */
    public static function findOptimalDeliveryPerson(int $orderId): ?array
    {
        try {
            $order = Order::with(['vendor', 'client'])->find($orderId);
            
            if (!$order) {
                return null;
            }

            // Simuler des livreurs disponibles (dans un vrai système, ceci viendrait d'une table)
            $availableDeliveryPersons = self::getAvailableDeliveryPersons();
            
            $optimalPerson = null;
            $minDistance = PHP_FLOAT_MAX;

            foreach ($availableDeliveryPersons as $person) {
                $distance = SpatialQueryService::calculateOptimalDistance(
                    $person['latitude'],
                    $person['longitude'],
                    $order->vendor->latitude,
                    $order->vendor->longitude
                );

                if ($distance < $minDistance) {
                    $minDistance = $distance;
                    $optimalPerson = $person;
                }
            }

            if ($optimalPerson) {
                return [
                    'delivery_person' => $optimalPerson,
                    'distance_to_vendor' => round($minDistance, 2),
                    'estimated_pickup_time' => self::calculatePickupTime($minDistance),
                    'total_route' => self::calculateDeliveryRoute($orderId)
                ];
            }

            return null;

        } catch (\Exception $e) {
            Log::error('Erreur lors de la recherche du livreur optimal: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Calcule l'itinéraire en temps réel pour le suivi
     */
    public static function calculateRealTimeRoute(float $currentLat, float $currentLng, float $destLat, float $destLng): ?array
    {
        try {
            $route = GoogleMapsService::calculateRoute($currentLat, $currentLng, $destLat, $destLng, 'driving');
            
            if (!$route) {
                return null;
            }

            // Ajouter des informations en temps réel
            $route['real_time'] = [
                'current_location' => ['latitude' => $currentLat, 'longitude' => $currentLng],
                'destination' => ['latitude' => $destLat, 'longitude' => $destLng],
                'calculated_at' => now()->toISOString(),
                'traffic_conditions' => self::estimateTrafficConditions($route),
                'weather_impact' => self::estimateWeatherImpact($route)
            ];

            return $route;

        } catch (\Exception $e) {
            Log::error('Erreur lors du calcul d\'itinéraire temps réel: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Optimise les itinéraires pour une zone géographique
     */
    public static function optimizeZoneRoutes(float $centerLat, float $centerLng, float $radiusKm): array
    {
        try {
            // Trouver tous les vendeurs dans la zone
            $vendors = SpatialQueryService::getVendorsInRadiusOptimized($centerLat, $centerLng, $radiusKm);
            
            // Trouver toutes les commandes en cours dans la zone
            $orders = Order::whereIn('vendor_id', collect($vendors)->pluck('id'))
                ->whereIn('status', ['confirmed', 'preparing', 'ready'])
                ->with(['vendor', 'client'])
                ->get();

            $optimizedRoutes = [];
            
            foreach ($orders as $order) {
                $route = self::calculateDeliveryRoute($order->id);
                if ($route) {
                    $optimizedRoutes[] = $route;
                }
            }

            // Grouper par zones pour optimiser les tournées
            $zoneGroups = self::groupByDeliveryZones($optimizedRoutes);
            
            return [
                'zone_center' => ['latitude' => $centerLat, 'longitude' => $centerLng],
                'radius_km' => $radiusKm,
                'total_orders' => count($optimizedRoutes),
                'zone_groups' => $zoneGroups,
                'optimization_metrics' => self::calculateZoneOptimizationMetrics($zoneGroups)
            ];

        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'optimisation des itinéraires de zone: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Calcule un itinéraire simple avec la formule Haversine
     */
    private static function calculateSimpleRoute($vendor, $client): array
    {
        $distance = SpatialQueryService::calculateOptimalDistance(
            $vendor->latitude,
            $vendor->longitude,
            $client->latitude,
            $client->longitude
        );

        return [
            'distance' => [
                'text' => round($distance, 2) . ' km',
                'value' => $distance * 1000 // en mètres
            ],
            'duration' => [
                'text' => round($distance * 3) . ' min', // Estimation: 3 min/km
                'value' => $distance * 3 * 60 // en secondes
            ],
            'steps' => [
                [
                    'instruction' => "Départ de {$vendor->name}",
                    'distance' => '0 km',
                    'duration' => '0 min'
                ],
                [
                    'instruction' => "Livraison à {$client->name}",
                    'distance' => round($distance, 2) . ' km',
                    'duration' => round($distance * 3) . ' min'
                ]
            ]
        ];
    }

    /**
     * Calcule le temps de livraison estimé
     */
    private static function calculateEstimatedDeliveryTime(array $route, Order $order): array
    {
        $baseTime = $route['duration']['value']; // en secondes
        $preparationTime = 15 * 60; // 15 minutes de préparation
        $bufferTime = 5 * 60; // 5 minutes de marge
        
        $totalSeconds = $baseTime + $preparationTime + $bufferTime;
        
        return [
            'estimated_minutes' => round($totalSeconds / 60),
            'estimated_time' => now()->addSeconds($totalSeconds)->format('H:i'),
            'preparation_time' => 15,
            'travel_time' => round($baseTime / 60),
            'buffer_time' => 5
        ];
    }

    /**
     * Calcule le score d'optimisation
     */
    private static function calculateOptimizationScore(array $route): float
    {
        $distance = $route['distance']['value'] / 1000; // en km
        $duration = $route['duration']['value'] / 60; // en minutes
        
        // Score basé sur la distance et le temps (plus bas = mieux)
        $score = ($distance * 0.6) + ($duration * 0.4);
        
        return round($score, 2);
    }

    /**
     * Crée une matrice de localisations pour l'optimisation
     */
    private static function createLocationMatrix($orders, float $startLat, float $startLng): array
    {
        $locations = [
            'start' => ['latitude' => $startLat, 'longitude' => $startLng, 'type' => 'start']
        ];

        foreach ($orders as $order) {
            $locations["vendor_{$order->id}"] = [
                'latitude' => $order->vendor->latitude,
                'longitude' => $order->vendor->longitude,
                'type' => 'vendor',
                'order_id' => $order->id
            ];
            
            $locations["client_{$order->id}"] = [
                'latitude' => $order->client->latitude,
                'longitude' => $order->client->longitude,
                'type' => 'client',
                'order_id' => $order->id
            ];
        }

        return $locations;
    }

    /**
     * Algorithme du plus proche voisin
     */
    private static function nearestNeighborAlgorithm(array $locations): array
    {
        $route = ['start'];
        $unvisited = array_keys($locations);
        unset($unvisited[array_search('start', $unvisited)]);
        
        $current = 'start';
        
        while (!empty($unvisited)) {
            $nearest = null;
            $minDistance = PHP_FLOAT_MAX;
            
            foreach ($unvisited as $location) {
                $distance = SpatialQueryService::calculateOptimalDistance(
                    $locations[$current]['latitude'],
                    $locations[$current]['longitude'],
                    $locations[$location]['latitude'],
                    $locations[$location]['longitude']
                );
                
                if ($distance < $minDistance) {
                    $minDistance = $distance;
                    $nearest = $location;
                }
            }
            
            $route[] = $nearest;
            $current = $nearest;
            unset($unvisited[array_search($nearest, $unvisited)]);
        }
        
        return $route;
    }

    /**
     * Optimisation 2-opt
     */
    private static function twoOptOptimization(array $route, array $locations): array
    {
        $improved = true;
        $bestRoute = $route;
        $bestDistance = self::calculateTotalDistance($route, $locations);
        
        while ($improved) {
            $improved = false;
            
            for ($i = 1; $i < count($route) - 2; $i++) {
                for ($j = $i + 1; $j < count($route); $j++) {
                    $newRoute = self::twoOptSwap($route, $i, $j);
                    $newDistance = self::calculateTotalDistance($newRoute, $locations);
                    
                    if ($newDistance < $bestDistance) {
                        $bestRoute = $newRoute;
                        $bestDistance = $newDistance;
                        $improved = true;
                    }
                }
            }
        }
        
        return $bestRoute;
    }

    /**
     * Échange 2-opt
     */
    private static function twoOptSwap(array $route, int $i, int $j): array
    {
        $newRoute = array_slice($route, 0, $i);
        $newRoute = array_merge($newRoute, array_reverse(array_slice($route, $i, $j - $i + 1)));
        $newRoute = array_merge($newRoute, array_slice($route, $j + 1));
        
        return $newRoute;
    }

    /**
     * Calcule la distance totale d'un itinéraire
     */
    private static function calculateTotalDistance(array $route, array $locations): float
    {
        $totalDistance = 0;
        
        for ($i = 0; $i < count($route) - 1; $i++) {
            $current = $locations[$route[$i]];
            $next = $locations[$route[$i + 1]];
            
            $totalDistance += SpatialQueryService::calculateOptimalDistance(
                $current['latitude'],
                $current['longitude'],
                $next['latitude'],
                $next['longitude']
            );
        }
        
        return $totalDistance;
    }

    /**
     * Calcule le temps total d'un itinéraire
     */
    private static function calculateTotalTime(array $route, array $locations): int
    {
        $totalDistance = self::calculateTotalDistance($route, $locations);
        return round($totalDistance * 3 * 60); // 3 min/km en secondes
    }

    /**
     * Simule des livreurs disponibles
     */
    private static function getAvailableDeliveryPersons(): array
    {
        // Dans un vrai système, ceci viendrait d'une table de livreurs
        return [
            [
                'id' => 1,
                'name' => 'Livreur 1',
                'latitude' => 5.3600,
                'longitude' => -4.0083,
                'status' => 'available',
                'rating' => 4.5
            ],
            [
                'id' => 2,
                'name' => 'Livreur 2',
                'latitude' => 5.3700,
                'longitude' => -4.0183,
                'status' => 'available',
                'rating' => 4.2
            ],
            [
                'id' => 3,
                'name' => 'Livreur 3',
                'latitude' => 5.3500,
                'longitude' => -3.9983,
                'status' => 'available',
                'rating' => 4.7
            ]
        ];
    }

    /**
     * Calcule le temps de prise en charge
     */
    private static function calculatePickupTime(float $distance): int
    {
        return round($distance * 3); // 3 min/km
    }

    /**
     * Estime les conditions de trafic
     */
    private static function estimateTrafficConditions(array $route): string
    {
        $hour = now()->hour;
        
        if ($hour >= 7 && $hour <= 9) {
            return 'traffic_heavy';
        } elseif ($hour >= 17 && $hour <= 19) {
            return 'traffic_heavy';
        } else {
            return 'traffic_normal';
        }
    }

    /**
     * Estime l'impact météo
     */
    private static function estimateWeatherImpact(array $route): string
    {
        // Simulation simple - dans un vrai système, ceci utiliserait une API météo
        $month = now()->month;
        
        if ($month >= 6 && $month <= 9) {
            return 'rainy_season';
        } else {
            return 'dry_season';
        }
    }

    /**
     * Groupe les itinéraires par zones de livraison
     */
    private static function groupByDeliveryZones(array $routes): array
    {
        $zones = [];
        
        foreach ($routes as $route) {
            $clientLat = $route['client_location']['latitude'];
            $clientLng = $route['client_location']['longitude'];
            
            $zoneKey = round($clientLat, 2) . '_' . round($clientLng, 2);
            
            if (!isset($zones[$zoneKey])) {
                $zones[$zoneKey] = [
                    'center' => ['latitude' => $clientLat, 'longitude' => $clientLng],
                    'routes' => []
                ];
            }
            
            $zones[$zoneKey]['routes'][] = $route;
        }
        
        return $zones;
    }

    /**
     * Calcule les métriques d'optimisation de zone
     */
    private static function calculateZoneOptimizationMetrics(array $zoneGroups): array
    {
        $totalRoutes = 0;
        $totalDistance = 0;
        $totalTime = 0;
        
        foreach ($zoneGroups as $zone) {
            $totalRoutes += count($zone['routes']);
            
            foreach ($zone['routes'] as $route) {
                $totalDistance += $route['route']['distance']['value'] / 1000; // en km
                $totalTime += $route['route']['duration']['value'] / 60; // en minutes
            }
        }
        
        return [
            'total_routes' => $totalRoutes,
            'total_distance_km' => round($totalDistance, 2),
            'total_time_minutes' => round($totalTime),
            'average_distance_per_route' => $totalRoutes > 0 ? round($totalDistance / $totalRoutes, 2) : 0,
            'average_time_per_route' => $totalRoutes > 0 ? round($totalTime / $totalRoutes) : 0
        ];
    }

    /**
     * Calcule le score d'optimisation multi-itinéraire
     */
    private static function calculateMultiRouteOptimizationScore(array $route, array $locations): float
    {
        $totalDistance = self::calculateTotalDistance($route, $locations);
        $totalTime = self::calculateTotalTime($route, $locations);
        
        // Score basé sur la distance totale et le temps total
        $score = ($totalDistance * 0.6) + ($totalTime / 60 * 0.4);
        
        return round($score, 2);
    }
}
