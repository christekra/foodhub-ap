# Guide d'obtention des clés Google Maps API

## Vue d'ensemble

Pour utiliser les fonctionnalités de géolocalisation avancées de DjassaFood, vous devez obtenir plusieurs clés API Google Maps. Ce guide vous explique comment les obtenir étape par étape.

## Clés API nécessaires

### 1. **Clé API Maps JavaScript** (Principale)
- **Usage** : Affichage des cartes interactives, géocodage côté client
- **Services** : Maps JavaScript API, Geocoding API (côté client)

### 2. **Clé API Geocoding** (Backend)
- **Usage** : Conversion d'adresses en coordonnées géographiques
- **Services** : Geocoding API, Reverse Geocoding API

### 3. **Clé API Places** (Recherche de lieux)
- **Usage** : Recherche d'adresses, autocomplétion
- **Services** : Places API, Autocomplete API

### 4. **Clé API Directions** (Calcul d'itinéraires)
- **Usage** : Calcul d'itinéraires de livraison
- **Services** : Directions API, Distance Matrix API

## Étapes pour obtenir les clés

### Étape 1 : Créer un compte Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Connectez-vous avec votre compte Google
3. Créez un nouveau projet ou sélectionnez un projet existant

### Étape 2 : Activer les APIs nécessaires

Dans la console Google Cloud, activez les APIs suivantes :

1. **Maps JavaScript API**
   - Console → APIs & Services → Library
   - Recherchez "Maps JavaScript API"
   - Cliquez sur "Enable"

2. **Geocoding API**
   - Recherchez "Geocoding API"
   - Cliquez sur "Enable"

3. **Places API**
   - Recherchez "Places API"
   - Cliquez sur "Enable"

4. **Directions API**
   - Recherchez "Directions API"
   - Cliquez sur "Enable"

5. **Distance Matrix API**
   - Recherchez "Distance Matrix API"
   - Cliquez sur "Enable"

### Étape 3 : Créer les clés API

1. Allez dans **APIs & Services → Credentials**
2. Cliquez sur **"Create Credentials"** → **"API Key"**
3. Créez **4 clés distinctes** pour une meilleure sécurité :

#### Clé 1 : Maps JavaScript (Frontend)
```
Nom : DjassaFood Maps JavaScript
Restrictions :
- Application restrictions : HTTP referrers
- API restrictions : Maps JavaScript API, Geocoding API
- Referrers autorisés : 
  * http://localhost:3000/*
  * https://votre-domaine.com/*
```

#### Clé 2 : Geocoding (Backend)
```
Nom : DjassaFood Geocoding
Restrictions :
- Application restrictions : IP addresses
- API restrictions : Geocoding API
- IPs autorisées : 
  * Votre IP serveur
  * 127.0.0.1 (pour développement local)
```

#### Clé 3 : Places (Backend)
```
Nom : DjassaFood Places
Restrictions :
- Application restrictions : IP addresses
- API restrictions : Places API
- IPs autorisées : 
  * Votre IP serveur
  * 127.0.0.1 (pour développement local)
```

#### Clé 4 : Directions (Backend)
```
Nom : DjassaFood Directions
Restrictions :
- Application restrictions : IP addresses
- API restrictions : Directions API, Distance Matrix API
- IPs autorisées : 
  * Votre IP serveur
  * 127.0.0.1 (pour développement local)
```

### Étape 4 : Configurer la facturation

⚠️ **IMPORTANT** : Les APIs Google Maps nécessitent une facturation activée

1. Allez dans **Billing** dans la console Google Cloud
2. Créez un compte de facturation ou sélectionnez un existant
3. Liez votre projet au compte de facturation

### Étape 5 : Configurer les quotas et limites

1. Allez dans **APIs & Services → Quotas**
2. Configurez des alertes pour éviter les dépassements
3. Limites recommandées :
   - **Maps JavaScript API** : 1000 requêtes/jour
   - **Geocoding API** : 2500 requêtes/jour
   - **Places API** : 1000 requêtes/jour
   - **Directions API** : 1000 requêtes/jour

## Configuration dans le projet

### Backend (.env)

Ajoutez ces lignes à votre fichier `.env` :

```env
# Google Maps API Keys
GOOGLE_MAPS_API_KEY=votre_cle_maps_javascript
GOOGLE_GEOCODING_API_KEY=votre_cle_geocoding
GOOGLE_PLACES_API_KEY=votre_cle_places
GOOGLE_DIRECTIONS_API_KEY=votre_cle_directions
```

### Frontend (.env)

Créez un fichier `.env` dans le dossier `foodhub-frontend` :

```env
REACT_APP_GOOGLE_MAPS_API_KEY=votre_cle_maps_javascript
```

## Coûts estimés

### Gratuit (par mois)
- **Maps JavaScript API** : 28,500 chargements de carte
- **Geocoding API** : 40,000 requêtes
- **Places API** : 28,500 requêtes
- **Directions API** : 40,000 requêtes

### Tarifs payants (après dépassement)
- **Maps JavaScript API** : $7 USD par 1000 chargements
- **Geocoding API** : $5 USD par 1000 requêtes
- **Places API** : $17 USD par 1000 requêtes
- **Directions API** : $5 USD par 1000 requêtes

## Sécurité

### Bonnes pratiques

1. **Restrictions par domaine/IP** : Configurez toujours des restrictions
2. **Clés séparées** : Utilisez des clés différentes pour frontend/backend
3. **Monitoring** : Surveillez l'utilisation via Google Cloud Console
4. **Rotation** : Changez régulièrement vos clés
5. **Variables d'environnement** : Ne committez jamais les clés dans le code

### Exemple de configuration sécurisée

```php
// Dans config/services.php
'google' => [
    'maps_api_key' => env('GOOGLE_MAPS_API_KEY'),
    'geocoding_api_key' => env('GOOGLE_GEOCODING_API_KEY'),
    'places_api_key' => env('GOOGLE_PLACES_API_KEY'),
    'directions_api_key' => env('GOOGLE_DIRECTIONS_API_KEY'),
],
```

## Test des clés

### Test côté backend

```bash
# Dans le dossier foodhub-backend
php artisan tinker

# Test de géocodage
$geocodingService = new \App\Services\GoogleMapsService();
$result = $geocodingService->geocode('Paris, France');
dd($result);
```

### Test côté frontend

```javascript
// Dans la console du navigateur
fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=Paris&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`)
  .then(response => response.json())
  .then(data => console.log(data));
```

## Dépannage

### Erreurs courantes

1. **"This API project is not authorized"**
   - Vérifiez que l'API est activée
   - Vérifiez les restrictions de la clé

2. **"Billing has not been enabled"**
   - Activez la facturation dans Google Cloud Console

3. **"Request denied"**
   - Vérifiez les restrictions IP/domaine
   - Vérifiez les quotas

4. **"Over quota"**
   - Augmentez les quotas ou attendez le reset quotidien

### Support

- [Documentation Google Maps](https://developers.google.com/maps/documentation)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Support Google Cloud](https://cloud.google.com/support)

## Prochaines étapes

Une fois les clés configurées :

1. Testez les fonctionnalités de géolocalisation
2. Configurez les notifications push
3. Optimisez les performances selon l'usage
4. Surveillez les coûts et l'utilisation

---

**Note** : Ce guide est spécifique au projet DjassaFood. Adaptez les domaines et IPs selon votre configuration de déploiement.
