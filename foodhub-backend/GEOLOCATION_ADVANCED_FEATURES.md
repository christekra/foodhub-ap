# Fonctionnalités de Géolocalisation Avancées - DjassaFood

## Vue d'ensemble

Ce document décrit les fonctionnalités de géolocalisation avancées implémentées dans DjassaFood, incluant l'optimisation avec des requêtes SQL spatiales, l'intégration avec Google Maps API, le calcul d'itinéraires pour la livraison, et les notifications push basées sur la géolocalisation.

## 1. Optimisation avec des Requêtes SQL Spatiales

### 1.1 Service SpatialQueryService

Le service `SpatialQueryService` fournit des méthodes optimisées pour les requêtes géographiques :

#### Fonctionnalités principales :
- **getVendorsInRadiusOptimized()** : Recherche de vendeurs avec requête Haversine optimisée
- **getVendorsInBoundingBox()** : Recherche dans une zone rectangulaire (plus rapide)
- **calculateOptimalDistance()** : Calcul de distance avec cache
- **findNearestVendor()** : Trouve le vendeur le plus proche
- **getClientsInRadius()** : Trouve les clients dans un rayon donné
- **generateSearchGrid()** : Génère une grille de recherche optimisée

#### Optimisations implémentées :
- Index composites sur (latitude, longitude)
- Cache des calculs de distance
- Requêtes SQL optimisées avec formule Haversine
- Algorithme de grille pour les recherches à grande échelle

### 1.2 Migration des Index Spatiaux

```sql
-- Index ajoutés pour optimiser les requêtes géographiques
ALTER TABLE clients ADD INDEX idx_clients_location (latitude, longitude);
ALTER TABLE vendor_applications ADD INDEX idx_vendor_applications_location (latitude, longitude);
ALTER TABLE vendors ADD INDEX idx_vendors_location (latitude, longitude);
ALTER TABLE order_tracking ADD INDEX idx_order_tracking_location (latitude, longitude);
```

## 2. Intégration avec Google Maps API

### 2.1 Service GoogleMapsService

Le service `GoogleMapsService` intègre les APIs Google Maps pour une précision maximale :

#### APIs intégrées :
- **Geocoding API** : Conversion adresse ↔ coordonnées
- **Directions API** : Calcul d'itinéraires
- **Places API** : Recherche de lieux
- **Distance Matrix API** : Calcul de distances multiples

#### Fonctionnalités :
- Géocodification précise avec cache
- Calcul d'itinéraires avec conditions de trafic
- Recherche de restaurants et lieux d'intérêt
- Validation d'adresses
- Support multilingue (français)

### 2.2 Configuration

```php
// config/services.php
'google' => [
    'maps_api_key' => env('GOOGLE_MAPS_API_KEY'),
    'places_api_key' => env('GOOGLE_PLACES_API_KEY'),
    'geocoding_api_key' => env('GOOGLE_GEOCODING_API_KEY'),
],
```

## 3. Calcul d'Itinéraires pour la Livraison

### 3.1 Service DeliveryRouteService

Le service `DeliveryRouteService` gère tous les aspects du routage de livraison :

#### Fonctionnalités principales :
- **calculateDeliveryRoute()** : Itinéraire simple pour une commande
- **calculateMultiDeliveryRoute()** : Optimisation de tournées multiples
- **findOptimalDeliveryPerson()** : Attribution optimale des livreurs
- **calculateRealTimeRoute()** : Itinéraires en temps réel
- **optimizeZoneRoutes()** : Optimisation par zone géographique

#### Algorithmes d'optimisation :
- **Plus proche voisin** : Algorithme de base pour les tournées
- **2-opt** : Optimisation locale des itinéraires
- **Matrice de distances** : Calcul optimisé des distances
- **Géofencing** : Zones de livraison intelligentes

### 3.2 Exemples d'utilisation

```php
// Calcul d'itinéraire simple
$route = DeliveryRouteService::calculateDeliveryRoute($orderId);

// Optimisation multi-livraison
$multiRoute = DeliveryRouteService::calculateMultiDeliveryRoute(
    [1, 2, 3], // IDs des commandes
    5.3600,    // Latitude de départ
    -4.0083    // Longitude de départ
);

// Recherche du livreur optimal
$optimalDelivery = DeliveryRouteService::findOptimalDeliveryPerson($orderId);
```

## 4. Notifications Push Basées sur la Géolocalisation

### 4.1 Service GeolocationNotificationService

Le service `GeolocationNotificationService` gère les notifications contextuelles :

#### Types de notifications :
- **vendor_nearby** : Nouveaux restaurants à proximité
- **delivery_update** : Mises à jour de livraison en temps réel
- **promotional_offer** : Offres spéciales géolocalisées
- **weather_alert** : Alertes météorologiques
- **traffic_alert** : Alertes de trafic

#### Fonctionnalités avancées :
- **Géofencing** : Zones de notification personnalisées
- **Cache intelligent** : Évite les notifications en double
- **Filtrage par distance** : Notifications ciblées
- **Support multilingue** : Messages en français

### 4.2 Système de Géofencing

```php
// Configuration d'une zone de géofencing
GeolocationNotificationService::setupGeofencing(
    5.3600,           // Latitude
    -4.0083,          // Longitude
    5.0,              // Rayon en km
    'vendor_nearby',  // Type d'événement
    ['vendor_id' => 123]
);

// Vérification des zones actives
$activeGeofences = GeolocationNotificationService::checkGeofencing(
    $currentLat,
    $currentLng
);
```

### 4.3 Classe de Notification

La classe `GeolocationNotification` gère l'envoi des notifications :

#### Canaux supportés :
- **Database** : Stockage en base de données
- **Broadcast** : Notifications en temps réel
- **Mail** : Notifications par email

#### Fonctionnalités :
- Queue management pour les performances
- Filtrage intelligent des destinataires
- Support des paramètres utilisateur
- Gestion des priorités

## 5. API Endpoints

### 5.1 Contrôleur GeolocationController

Toutes les fonctionnalités sont exposées via l'API REST :

#### Endpoints disponibles :

```
GET  /api/geolocation/optimized-vendors
POST /api/geolocation/delivery-route
POST /api/geolocation/multi-delivery-route
POST /api/geolocation/optimal-delivery-person
POST /api/geolocation/real-time-route
POST /api/geolocation/optimize-zone-routes
POST /api/geolocation/notifications
POST /api/geolocation/geofencing/setup
POST /api/geolocation/geofencing/check
POST /api/geolocation/geocode
GET  /api/geolocation/places/search
```

### 5.2 Exemples de requêtes

#### Recherche de vendeurs optimisée :
```bash
GET /api/geolocation/optimized-vendors?latitude=5.3600&longitude=-4.0083&radius=10&optimization_type=spatial
```

#### Calcul d'itinéraire de livraison :
```bash
POST /api/geolocation/delivery-route
{
    "order_id": 123,
    "use_google_maps": true
}
```

#### Envoi de notifications géolocalisées :
```bash
POST /api/geolocation/notifications
{
    "latitude": 5.3600,
    "longitude": -4.0083,
    "event_type": "vendor_nearby",
    "data": {
        "vendor_id": 456,
        "distance": 2.5
    }
}
```

## 6. Performance et Optimisation

### 6.1 Stratégies d'optimisation :
- **Cache Redis** : Mise en cache des calculs coûteux
- **Index composites** : Optimisation des requêtes géographiques
- **Queue management** : Traitement asynchrone des notifications
- **Batch processing** : Traitement en lot des opérations multiples

### 6.2 Métriques de performance :
- Temps de réponse < 200ms pour les requêtes géographiques
- Cache hit ratio > 80% pour les calculs de distance
- Support de 1000+ requêtes simultanées
- Optimisation automatique des itinéraires

## 7. Configuration et Déploiement

### 7.1 Variables d'environnement requises :
```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_PLACES_API_KEY=your_google_places_api_key
GOOGLE_GEOCODING_API_KEY=your_google_geocoding_api_key
```

### 7.2 Dépendances :
- Laravel 10+
- MySQL 5.7+ (pour les index composites)
- Redis (pour le cache)
- Queue worker (pour les notifications)

### 7.3 Commandes de déploiement :
```bash
# Exécuter les migrations
php artisan migrate

# Configurer les queues
php artisan queue:work

# Vider le cache si nécessaire
php artisan cache:clear
```

## 8. Sécurité et Confidentialité

### 8.1 Mesures de sécurité :
- Validation stricte des coordonnées géographiques
- Limitation des taux d'API Google Maps
- Chiffrement des données sensibles
- Audit des accès aux données de géolocalisation

### 8.2 Conformité RGPD :
- Consentement explicite pour la géolocalisation
- Droit à l'oubli des données de localisation
- Anonymisation des données de traçage
- Transparence sur l'utilisation des données

## 9. Tests et Monitoring

### 9.1 Tests automatisés :
- Tests unitaires pour tous les services
- Tests d'intégration pour les APIs
- Tests de performance pour les requêtes spatiales
- Tests de charge pour les notifications

### 9.2 Monitoring :
- Métriques de performance des requêtes géographiques
- Surveillance des taux d'erreur Google Maps API
- Monitoring des temps de réponse des notifications
- Alertes sur les dépassements de quotas

## 10. Évolutions Futures

### 10.1 Fonctionnalités prévues :
- Intégration avec d'autres fournisseurs de cartes (OpenStreetMap, Mapbox)
- Algorithmes d'optimisation plus avancés (genetic algorithms)
- Support des véhicules électriques et des zones de recharge
- Intégration avec les systèmes de transport public

### 10.2 Améliorations techniques :
- Support des index spatiaux natifs (PostGIS)
- Machine learning pour l'optimisation des itinéraires
- Réal-time traffic integration
- Support des drones de livraison

---

**Note** : Cette documentation est mise à jour régulièrement. Pour les dernières informations, consultez le code source et les tests unitaires.
