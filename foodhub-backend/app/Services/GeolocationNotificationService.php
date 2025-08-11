<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;
use App\Models\User;
use App\Models\Client;
use App\Models\Vendor;
use App\Models\Order;
use App\Notifications\GeolocationNotification;

class GeolocationNotificationService
{
    /**
     * Envoie des notifications basées sur la géolocalisation
     */
    public static function sendGeolocationNotifications(float $latitude, float $longitude, string $eventType, array $data = []): array
    {
        try {
            $notifications = [];
            
            switch ($eventType) {
                case 'vendor_nearby':
                    $notifications = self::sendVendorNearbyNotifications($latitude, $longitude, $data);
                    break;
                    
                case 'delivery_update':
                    $notifications = self::sendDeliveryUpdateNotifications($latitude, $longitude, $data);
                    break;
                    
                case 'promotional_offer':
                    $notifications = self::sendPromotionalNotifications($latitude, $longitude, $data);
                    break;
                    
                case 'weather_alert':
                    $notifications = self::sendWeatherAlertNotifications($latitude, $longitude, $data);
                    break;
                    
                case 'traffic_alert':
                    $notifications = self::sendTrafficAlertNotifications($latitude, $longitude, $data);
                    break;
                    
                default:
                    Log::warning("Type d'événement de géolocalisation non reconnu: {$eventType}");
            }
            
            return $notifications;
            
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'envoi des notifications de géolocalisation: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Notifications pour les vendeurs à proximité
     */
    private static function sendVendorNearbyNotifications(float $latitude, float $longitude, array $data): array
    {
        $notifications = [];
        
        try {
            // Trouver les clients dans un rayon de 5km
            $clients = SpatialQueryService::getClientsInRadius($latitude, $longitude, 5);
            
            // Trouver les vendeurs à proximité
            $vendors = SpatialQueryService::getVendorsInRadiusOptimized($latitude, $longitude, 3);
            
            if (empty($vendors)) {
                return $notifications;
            }
            
            foreach ($clients as $client) {
                // Vérifier si le client a déjà reçu une notification récemment
                $cacheKey = "vendor_nearby_notification_{$client['user_id']}";
                if (Cache::has($cacheKey)) {
                    continue;
                }
                
                $user = User::find($client['user_id']);
                if (!$user || $user->status !== 'active') {
                    continue;
                }
                
                $nearestVendor = $vendors[0]; // Le plus proche
                
                $notificationData = [
                    'type' => 'vendor_nearby',
                    'title' => 'Nouveau restaurant à proximité !',
                    'body' => "Découvrez {$nearestVendor['name']} à {$nearestVendor['distance']} km de chez vous",
                    'data' => [
                        'vendor_id' => $nearestVendor['id'],
                        'vendor_name' => $nearestVendor['name'],
                        'distance' => $nearestVendor['distance'],
                        'cuisine_type' => $nearestVendor['cuisine_type'],
                        'latitude' => $latitude,
                        'longitude' => $longitude
                    ]
                ];
                
                // Envoyer la notification
                $user->notify(new GeolocationNotification($notificationData));
                
                // Mettre en cache pour éviter les doublons (1 heure)
                Cache::put($cacheKey, true, 3600);
                
                $notifications[] = [
                    'user_id' => $client['user_id'],
                    'type' => 'vendor_nearby',
                    'sent_at' => now()->toISOString()
                ];
            }
            
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'envoi des notifications vendeurs à proximité: ' . $e->getMessage());
        }
        
        return $notifications;
    }

    /**
     * Notifications de mise à jour de livraison
     */
    private static function sendDeliveryUpdateNotifications(float $latitude, float $longitude, array $data): array
    {
        $notifications = [];
        
        try {
            $orderId = $data['order_id'] ?? null;
            $status = $data['status'] ?? null;
            
            if (!$orderId || !$status) {
                return $notifications;
            }
            
            $order = Order::with(['client.user'])->find($orderId);
            if (!$order || !$order->client) {
                return $notifications;
            }
            
            $client = $order->client;
            $user = $client->user;
            
            if (!$user || $user->status !== 'active') {
                return $notifications;
            }
            
            // Calculer la distance entre la position actuelle et le client
            $distance = SpatialQueryService::calculateOptimalDistance(
                $latitude,
                $longitude,
                $client->latitude,
                $client->longitude
            );
            
            $notificationData = [
                'type' => 'delivery_update',
                'title' => self::getDeliveryStatusTitle($status),
                'body' => self::getDeliveryStatusMessage($status, $distance),
                'data' => [
                    'order_id' => $orderId,
                    'status' => $status,
                    'distance' => round($distance, 2),
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'estimated_arrival' => self::calculateEstimatedArrival($distance)
                ]
            ];
            
            // Envoyer la notification
            $user->notify(new GeolocationNotification($notificationData));
            
            $notifications[] = [
                'user_id' => $user->id,
                'order_id' => $orderId,
                'type' => 'delivery_update',
                'status' => $status,
                'sent_at' => now()->toISOString()
            ];
            
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'envoi des notifications de mise à jour de livraison: ' . $e->getMessage());
        }
        
        return $notifications;
    }

    /**
     * Notifications promotionnelles basées sur la localisation
     */
    private static function sendPromotionalNotifications(float $latitude, float $longitude, array $data): array
    {
        $notifications = [];
        
        try {
            // Trouver les clients dans un rayon de 10km
            $clients = SpatialQueryService::getClientsInRadius($latitude, $longitude, 10);
            
            // Trouver les vendeurs avec des offres spéciales
            $vendors = Vendor::where('is_featured', true)
                ->where('is_verified', true)
                ->where('is_open', true)
                ->get();
            
            foreach ($clients as $client) {
                // Vérifier si le client a déjà reçu une notification promotionnelle récemment
                $cacheKey = "promotional_notification_{$client['user_id']}";
                if (Cache::has($cacheKey)) {
                    continue;
                }
                
                $user = User::find($client['user_id']);
                if (!$user || $user->status !== 'active') {
                    continue;
                }
                
                // Trouver le vendeur le plus proche avec des offres
                $nearestVendor = null;
                $minDistance = PHP_FLOAT_MAX;
                
                foreach ($vendors as $vendor) {
                    if (!$vendor->latitude || !$vendor->longitude) {
                        continue;
                    }
                    
                    $distance = SpatialQueryService::calculateOptimalDistance(
                        $client['latitude'],
                        $client['longitude'],
                        $vendor->latitude,
                        $vendor->longitude
                    );
                    
                    if ($distance < $minDistance && $distance <= 15) { // Max 15km
                        $minDistance = $distance;
                        $nearestVendor = $vendor;
                    }
                }
                
                if ($nearestVendor) {
                    $notificationData = [
                        'type' => 'promotional_offer',
                        'title' => 'Offre spéciale à proximité !',
                        'body' => "Profitez des offres de {$nearestVendor->name} à {$minDistance} km",
                        'data' => [
                            'vendor_id' => $nearestVendor->id,
                            'vendor_name' => $nearestVendor->name,
                            'distance' => round($minDistance, 2),
                            'offer_type' => 'featured_vendor',
                            'latitude' => $latitude,
                            'longitude' => $longitude
                        ]
                    ];
                    
                    // Envoyer la notification
                    $user->notify(new GeolocationNotification($notificationData));
                    
                    // Mettre en cache pour éviter les doublons (6 heures)
                    Cache::put($cacheKey, true, 21600);
                    
                    $notifications[] = [
                        'user_id' => $user->id,
                        'type' => 'promotional_offer',
                        'vendor_id' => $nearestVendor->id,
                        'sent_at' => now()->toISOString()
                    ];
                }
            }
            
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'envoi des notifications promotionnelles: ' . $e->getMessage());
        }
        
        return $notifications;
    }

    /**
     * Notifications d'alerte météo
     */
    private static function sendWeatherAlertNotifications(float $latitude, float $longitude, array $data): array
    {
        $notifications = [];
        
        try {
            $weatherCondition = $data['weather_condition'] ?? 'unknown';
            $severity = $data['severity'] ?? 'moderate';
            
            // Trouver les clients dans un rayon de 20km
            $clients = SpatialQueryService::getClientsInRadius($latitude, $longitude, 20);
            
            foreach ($clients as $client) {
                // Vérifier si le client a déjà reçu une alerte météo récemment
                $cacheKey = "weather_alert_{$client['user_id']}_{$weatherCondition}";
                if (Cache::has($cacheKey)) {
                    continue;
                }
                
                $user = User::find($client['user_id']);
                if (!$user || $user->status !== 'active') {
                    continue;
                }
                
                $notificationData = [
                    'type' => 'weather_alert',
                    'title' => self::getWeatherAlertTitle($weatherCondition, $severity),
                    'body' => self::getWeatherAlertMessage($weatherCondition, $severity),
                    'data' => [
                        'weather_condition' => $weatherCondition,
                        'severity' => $severity,
                        'latitude' => $latitude,
                        'longitude' => $longitude,
                        'affected_area' => '20km_radius'
                    ]
                ];
                
                // Envoyer la notification
                $user->notify(new GeolocationNotification($notificationData));
                
                // Mettre en cache pour éviter les doublons (2 heures)
                Cache::put($cacheKey, true, 7200);
                
                $notifications[] = [
                    'user_id' => $user->id,
                    'type' => 'weather_alert',
                    'weather_condition' => $weatherCondition,
                    'sent_at' => now()->toISOString()
                ];
            }
            
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'envoi des notifications d\'alerte météo: ' . $e->getMessage());
        }
        
        return $notifications;
    }

    /**
     * Notifications d'alerte trafic
     */
    private static function sendTrafficAlertNotifications(float $latitude, float $longitude, array $data): array
    {
        $notifications = [];
        
        try {
            $trafficCondition = $data['traffic_condition'] ?? 'unknown';
            $affectedArea = $data['affected_area'] ?? 'local';
            
            // Trouver les clients dans un rayon de 10km
            $clients = SpatialQueryService::getClientsInRadius($latitude, $longitude, 10);
            
            foreach ($clients as $client) {
                // Vérifier si le client a déjà reçu une alerte trafic récemment
                $cacheKey = "traffic_alert_{$client['user_id']}_{$trafficCondition}";
                if (Cache::has($cacheKey)) {
                    continue;
                }
                
                $user = User::find($client['user_id']);
                if (!$user || $user->status !== 'active') {
                    continue;
                }
                
                $notificationData = [
                    'type' => 'traffic_alert',
                    'title' => self::getTrafficAlertTitle($trafficCondition),
                    'body' => self::getTrafficAlertMessage($trafficCondition, $affectedArea),
                    'data' => [
                        'traffic_condition' => $trafficCondition,
                        'affected_area' => $affectedArea,
                        'latitude' => $latitude,
                        'longitude' => $longitude,
                        'estimated_delay' => self::estimateTrafficDelay($trafficCondition)
                    ]
                ];
                
                // Envoyer la notification
                $user->notify(new GeolocationNotification($notificationData));
                
                // Mettre en cache pour éviter les doublons (30 minutes)
                Cache::put($cacheKey, true, 1800);
                
                $notifications[] = [
                    'user_id' => $user->id,
                    'type' => 'traffic_alert',
                    'traffic_condition' => $trafficCondition,
                    'sent_at' => now()->toISOString()
                ];
            }
            
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'envoi des notifications d\'alerte trafic: ' . $e->getMessage());
        }
        
        return $notifications;
    }

    /**
     * Gestion des zones de géofencing
     */
    public static function setupGeofencing(float $latitude, float $longitude, float $radius, string $eventType, array $data = []): bool
    {
        try {
            $geofenceKey = "geofence_{$latitude}_{$longitude}_{$radius}_{$eventType}";
            
            $geofenceData = [
                'center' => ['latitude' => $latitude, 'longitude' => $longitude],
                'radius' => $radius,
                'event_type' => $eventType,
                'data' => $data,
                'created_at' => now()->toISOString(),
                'active' => true
            ];
            
            // Stocker la zone de géofencing
            Cache::put($geofenceKey, $geofenceData, 86400); // 24 heures
            
            return true;
            
        } catch (\Exception $e) {
            Log::error('Erreur lors de la configuration du géofencing: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Vérifie si un point est dans une zone de géofencing
     */
    public static function checkGeofencing(float $latitude, float $longitude): array
    {
        $activeGeofences = [];
        
        try {
            // Récupérer toutes les zones de géofencing actives
            $geofenceKeys = Cache::get('active_geofences', []);
            
            foreach ($geofenceKeys as $geofenceKey) {
                $geofenceData = Cache::get($geofenceKey);
                
                if (!$geofenceData || !$geofenceData['active']) {
                    continue;
                }
                
                $center = $geofenceData['center'];
                $radius = $geofenceData['radius'];
                
                $distance = SpatialQueryService::calculateOptimalDistance(
                    $latitude,
                    $longitude,
                    $center['latitude'],
                    $center['longitude']
                );
                
                if ($distance <= $radius) {
                    $activeGeofences[] = [
                        'geofence_key' => $geofenceKey,
                        'event_type' => $geofenceData['event_type'],
                        'data' => $geofenceData['data'],
                        'distance' => round($distance, 2)
                    ];
                }
            }
            
        } catch (\Exception $e) {
            Log::error('Erreur lors de la vérification du géofencing: ' . $e->getMessage());
        }
        
        return $activeGeofences;
    }

    // Méthodes utilitaires pour les messages de notification

    private static function getDeliveryStatusTitle(string $status): string
    {
        $titles = [
            'confirmed' => 'Commande confirmée',
            'preparing' => 'Commande en préparation',
            'ready' => 'Commande prête',
            'out_for_delivery' => 'En route vers vous',
            'nearby' => 'Livreur à proximité',
            'delivered' => 'Commande livrée'
        ];
        
        return $titles[$status] ?? 'Mise à jour de commande';
    }

    private static function getDeliveryStatusMessage(string $status, float $distance): string
    {
        switch ($status) {
            case 'out_for_delivery':
                return "Votre commande est en route ! Distance restante : {$distance} km";
            case 'nearby':
                return "Le livreur arrive dans quelques minutes !";
            case 'delivered':
                return "Votre commande a été livrée. Bon appétit !";
            default:
                return "Votre commande est en cours de traitement.";
        }
    }

    private static function calculateEstimatedArrival(float $distance): string
    {
        $estimatedMinutes = round($distance * 3); // 3 min/km
        return now()->addMinutes($estimatedMinutes)->format('H:i');
    }

    private static function getWeatherAlertTitle(string $condition, string $severity): string
    {
        $titles = [
            'rain' => 'Alerte pluie',
            'storm' => 'Alerte orage',
            'flood' => 'Alerte inondation',
            'heat' => 'Alerte canicule'
        ];
        
        $baseTitle = $titles[$condition] ?? 'Alerte météo';
        
        if ($severity === 'severe') {
            return "⚠️ {$baseTitle} - Sévère";
        }
        
        return $baseTitle;
    }

    private static function getWeatherAlertMessage(string $condition, string $severity): string
    {
        $messages = [
            'rain' => 'Pluie importante prévue dans votre zone. Livraisons possibles avec retard.',
            'storm' => 'Orage prévu. Les livraisons peuvent être temporairement suspendues.',
            'flood' => 'Risque d\'inondation. Livraisons suspendues dans votre zone.',
            'heat' => 'Températures élevées. Les livraisons peuvent prendre plus de temps.'
        ];
        
        return $messages[$condition] ?? 'Conditions météorologiques particulières dans votre zone.';
    }

    private static function getTrafficAlertTitle(string $condition): string
    {
        $titles = [
            'heavy' => 'Trafic dense',
            'congestion' => 'Embouteillage',
            'accident' => 'Accident signalé',
            'roadwork' => 'Travaux routiers'
        ];
        
        return $titles[$condition] ?? 'Alerte trafic';
    }

    private static function getTrafficAlertMessage(string $condition, string $area): string
    {
        $messages = [
            'heavy' => 'Trafic dense dans votre zone. Livraisons avec retard possible.',
            'congestion' => 'Embouteillage signalé. Les livraisons peuvent être retardées.',
            'accident' => 'Accident signalé dans votre zone. Livraisons avec retard.',
            'roadwork' => 'Travaux routiers en cours. Itinéraires modifiés pour les livraisons.'
        ];
        
        $baseMessage = $messages[$condition] ?? 'Conditions de trafic particulières dans votre zone.';
        
        if ($area === 'major') {
            return $baseMessage . ' Impact majeur sur les livraisons.';
        }
        
        return $baseMessage;
    }

    private static function estimateTrafficDelay(string $condition): int
    {
        $delays = [
            'heavy' => 15,
            'congestion' => 30,
            'accident' => 45,
            'roadwork' => 20
        ];
        
        return $delays[$condition] ?? 10; // minutes
    }
}
