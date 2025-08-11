# Configuration Google Maps API pour FoodHub

## 🚨 PROBLÈME IDENTIFIÉ
Les services de géolocalisation avancés ne fonctionnent pas car les clés API Google Maps ne sont pas configurées.

## 📋 ÉTAPES DE CONFIGURATION

### 1. Obtenir les clés API Google Maps

1. **Aller sur Google Cloud Console :** https://console.cloud.google.com/
2. **Créer un nouveau projet** ou sélectionner un projet existant
3. **Activer les APIs suivantes :**
   - Maps JavaScript API
   - Geocoding API
   - Places API
   - Directions API
   - Distance Matrix API

### 2. Créer les clés API

1. **Dans Google Cloud Console :**
   - Aller dans "APIs & Services" > "Credentials"
   - Cliquer sur "Create Credentials" > "API Key"
   - Créer 3 clés séparées pour une meilleure sécurité

### 3. Configurer les variables d'environnement

Ajouter dans votre fichier `.env` :

```env
# Google Maps API Configuration
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
GOOGLE_GEOCODING_API_KEY=your_google_geocoding_api_key_here
```

### 4. Sécuriser les clés API

1. **Restreindre les clés par domaine :**
   - Dans Google Cloud Console > Credentials
   - Cliquer sur chaque clé API
   - Ajouter des restrictions :
     - Application restrictions : HTTP referrers
     - API restrictions : Sélectionner les APIs spécifiques

2. **Domaines autorisés :**
   - `localhost:3000/*`
   - `localhost:8000/*`
   - Votre domaine de production

## 🔧 SERVICES AFFECTÉS

Une fois configurées, ces APIs permettront :

- ✅ Géolocalisation des vendeurs à proximité
- ✅ Calcul d'itinéraires de livraison
- ✅ Recherche de lieux et adresses
- ✅ Validation d'adresses
- ✅ Optimisation des routes de livraison
- ✅ Notifications géolocalisées

## 💰 COÛTS

- **Gratuit jusqu'à :**
  - 28,500 requêtes Geocoding/mois
  - 2,500 requêtes Places/mois
  - 2,500 requêtes Directions/mois
  - 100 requêtes Distance Matrix/mois

- **Au-delà :** Tarification par requête (très abordable)

## 🚀 TEST APRÈS CONFIGURATION

```bash
# Tester la géolocalisation
curl "http://localhost:8000/api/geolocation/geocode?address=Abidjan"

# Tester la recherche de vendeurs à proximité
curl "http://localhost:8000/api/vendors/nearby?latitude=5.3600&longitude=-4.0083"
```
