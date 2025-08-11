<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Services\SpatialQueryService;
use App\Services\GoogleMapsService;
use App\Services\DeliveryRouteService;
use App\Services\GeolocationNotificationService;
use App\Models\Order;
use App\Models\Vendor;

class GeolocationController extends Controller
{
    /**
     * Obtenir les vendeurs optimisés avec requêtes spatiales
     */
    public function getOptimizedVendors(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'nullable|numeric|min:0.1|max:50',
            'optimization_type' => 'nullable|in:spatial,bounding_box,grid'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $latitude = $request->latitude;
            $longitude = $request->longitude;
            $radius = $request->get('radius', 10);
            $optimizationType = $request->get('optimization_type', 'spatial');

            $vendors = [];

            switch ($optimizationType) {
                case 'spatial':
                    $vendors = SpatialQueryService::getVendorsInRadiusOptimized($latitude, $longitude, $radius);
                    break;
                    
                case 'bounding_box':
                    // Calculer une bounding box approximative
                    $latRange = $radius / 111; // 1 degré ≈ 111 km
                    $lngRange = $radius / (111 * cos(deg2rad($latitude)));
                    
                    $minLat = $latitude - $latRange;
                    $maxLat = $latitude + $latRange;
                    $minLng = $longitude - $lngRange;
                    $maxLng = $longitude + $lngRange;
                    
                    $vendors = SpatialQueryService::getVendorsInBoundingBox($minLat, $maxLat, $minLng, $maxLng);
                    break;
                    
                case 'grid':
                    $grid = SpatialQueryService::generateSearchGrid($latitude, $longitude, $radius);
                    $vendors = SpatialQueryService::getVendorsInRadiusOptimized($latitude, $longitude, $radius);
                    break;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'vendors' => $vendors,
                    'total' => count($vendors),
                    'optimization_type' => $optimizationType,
                    'search_center' => [
                        'latitude' => $latitude,
                        'longitude' => $longitude
                    ],
                    'radius_km' => $radius
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la recherche optimisée des vendeurs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculer un itinéraire de livraison avec Google Maps
     */
    public function calculateDeliveryRoute(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|integer|exists:orders,id',
            'use_google_maps' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $orderId = $request->order_id;
            $useGoogleMaps = $request->get('use_google_maps', true);

            $route = DeliveryRouteService::calculateDeliveryRoute($orderId);

            if (!$route) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de calculer l\'itinéraire pour cette commande'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $route
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du calcul d\'itinéraire',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculer un itinéraire multi-livraison optimisé
     */
    public function calculateMultiDeliveryRoute(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_ids' => 'required|array|min:2',
            'order_ids.*' => 'integer|exists:orders,id',
            'start_latitude' => 'required|numeric|between:-90,90',
            'start_longitude' => 'required|numeric|between:-180,180'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $orderIds = $request->order_ids;
            $startLat = $request->start_latitude;
            $startLng = $request->start_longitude;

            $route = DeliveryRouteService::calculateMultiDeliveryRoute($orderIds, $startLat, $startLng);

            if (!$route) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de calculer l\'itinéraire multi-livraison'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $route
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du calcul d\'itinéraire multi-livraison',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Trouver le livreur optimal pour une commande
     */
    public function findOptimalDeliveryPerson(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|integer|exists:orders,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $orderId = $request->order_id;

            $result = DeliveryRouteService::findOptimalDeliveryPerson($orderId);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun livreur disponible pour cette commande'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la recherche du livreur optimal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculer un itinéraire en temps réel
     */
    public function calculateRealTimeRoute(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_latitude' => 'required|numeric|between:-90,90',
            'current_longitude' => 'required|numeric|between:-180,180',
            'destination_latitude' => 'required|numeric|between:-90,90',
            'destination_longitude' => 'required|numeric|between:-180,180',
            'mode' => 'nullable|in:driving,walking,bicycling,transit'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $currentLat = $request->current_latitude;
            $currentLng = $request->current_longitude;
            $destLat = $request->destination_latitude;
            $destLng = $request->destination_longitude;
            $mode = $request->get('mode', 'driving');

            $route = DeliveryRouteService::calculateRealTimeRoute($currentLat, $currentLng, $destLat, $destLng);

            if (!$route) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de calculer l\'itinéraire en temps réel'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $route
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du calcul d\'itinéraire en temps réel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Optimiser les itinéraires pour une zone
     */
    public function optimizeZoneRoutes(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'center_latitude' => 'required|numeric|between:-90,90',
            'center_longitude' => 'required|numeric|between:-180,180',
            'radius_km' => 'required|numeric|min:1|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $centerLat = $request->center_latitude;
            $centerLng = $request->center_longitude;
            $radiusKm = $request->radius_km;

            $optimization = DeliveryRouteService::optimizeZoneRoutes($centerLat, $centerLng, $radiusKm);

            return response()->json([
                'success' => true,
                'data' => $optimization
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'optimisation des itinéraires de zone',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Envoyer des notifications basées sur la géolocalisation
     */
    public function sendGeolocationNotifications(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'event_type' => 'required|in:vendor_nearby,delivery_update,promotional_offer,weather_alert,traffic_alert',
            'data' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $latitude = $request->latitude;
            $longitude = $request->longitude;
            $eventType = $request->event_type;
            $data = $request->get('data', []);

            $notifications = GeolocationNotificationService::sendGeolocationNotifications(
                $latitude,
                $longitude,
                $eventType,
                $data
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'notifications_sent' => count($notifications),
                    'notifications' => $notifications,
                    'event_type' => $eventType,
                    'location' => [
                        'latitude' => $latitude,
                        'longitude' => $longitude
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi des notifications de géolocalisation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Configurer une zone de géofencing
     */
    public function setupGeofencing(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'required|numeric|min:0.1|max:50',
            'event_type' => 'required|string',
            'data' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $latitude = $request->latitude;
            $longitude = $request->longitude;
            $radius = $request->radius;
            $eventType = $request->event_type;
            $data = $request->get('data', []);

            $success = GeolocationNotificationService::setupGeofencing(
                $latitude,
                $longitude,
                $radius,
                $eventType,
                $data
            );

            if ($success) {
                return response()->json([
                    'success' => true,
                    'message' => 'Zone de géofencing configurée avec succès',
                    'data' => [
                        'center' => ['latitude' => $latitude, 'longitude' => $longitude],
                        'radius' => $radius,
                        'event_type' => $eventType
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de la configuration du géofencing'
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la configuration du géofencing',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vérifier les zones de géofencing actives
     */
    public function checkGeofencing(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $latitude = $request->latitude;
            $longitude = $request->longitude;

            $activeGeofences = GeolocationNotificationService::checkGeofencing($latitude, $longitude);

            return response()->json([
                'success' => true,
                'data' => [
                    'active_geofences' => $activeGeofences,
                    'total_active' => count($activeGeofences),
                    'location' => [
                        'latitude' => $latitude,
                        'longitude' => $longitude
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification du géofencing',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Géocodification avec Google Maps
     */
    public function geocodeWithGoogleMaps(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'address' => 'required|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $address = $request->address;

            $geocodeData = GoogleMapsService::geocode($address);

            if (!$geocodeData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de géocoder cette adresse'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $geocodeData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la géocodification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Recherche de lieux avec Google Places
     */
    public function searchPlaces(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|max:100',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'nullable|numeric|min:100|max:50000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $query = $request->query;
            $latitude = $request->latitude;
            $longitude = $request->longitude;
            $radius = $request->get('radius', 5000);

            $places = GoogleMapsService::searchPlaces($query, $latitude, $longitude, $radius);

            return response()->json([
                'success' => true,
                'data' => [
                    'places' => $places,
                    'total' => count($places),
                    'search_query' => $query,
                    'search_center' => [
                        'latitude' => $latitude,
                        'longitude' => $longitude
                    ],
                    'radius' => $radius
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la recherche de lieux',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
