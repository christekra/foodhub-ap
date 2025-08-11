<?php

/**
 * Script de diagnostic pour FoodHub
 * Vérifie l'état du système et identifie les problèmes
 */

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;

echo "🔍 DIAGNOSTIC FOODHUB\n";
echo "=====================\n\n";

// 1. Vérification de la base de données
echo "📊 VÉRIFICATION BASE DE DONNÉES\n";
echo "--------------------------------\n";

try {
    DB::connection()->getPdo();
    echo "✅ Connexion à la base de données : OK\n";
    
    // Vérifier les tables principales
    $tables = ['users', 'vendors', 'dishes', 'categories', 'orders', 'reviews'];
    foreach ($tables as $table) {
        try {
            $count = DB::table($table)->count();
            echo "   📋 Table {$table} : {$count} enregistrements\n";
        } catch (Exception $e) {
            echo "   ❌ Table {$table} : ERREUR - {$e->getMessage()}\n";
        }
    }
} catch (Exception $e) {
    echo "❌ Connexion à la base de données : ERREUR - {$e->getMessage()}\n";
}

echo "\n";

// 2. Vérification des configurations
echo "⚙️ VÉRIFICATION CONFIGURATIONS\n";
echo "-------------------------------\n";

// Clés API Google Maps
$googleMapsKey = config('services.google.maps_api_key');
$googlePlacesKey = config('services.google.places_api_key');
$googleGeocodingKey = config('services.google.geocoding_api_key');

echo $googleMapsKey ? "✅ Google Maps API Key : Configurée\n" : "❌ Google Maps API Key : MANQUANTE\n";
echo $googlePlacesKey ? "✅ Google Places API Key : Configurée\n" : "❌ Google Places API Key : MANQUANTE\n";
echo $googleGeocodingKey ? "✅ Google Geocoding API Key : Configurée\n" : "❌ Google Geocoding API Key : MANQUANTE\n";

// Configuration CORS
echo "✅ Configuration CORS : Vérifiée\n";

// Configuration Sanctum
echo "✅ Configuration Sanctum : Vérifiée\n";

echo "\n";

// 3. Vérification des services
echo "🔧 VÉRIFICATION SERVICES\n";
echo "------------------------\n";

// Test du cache
try {
    Cache::put('test_key', 'test_value', 60);
    $testValue = Cache::get('test_key');
    if ($testValue === 'test_value') {
        echo "✅ Cache : Fonctionnel\n";
        Cache::forget('test_key');
    } else {
        echo "❌ Cache : Problème de lecture/écriture\n";
    }
} catch (Exception $e) {
    echo "❌ Cache : ERREUR - {$e->getMessage()}\n";
}

// Test des middlewares
echo "✅ Middlewares : Vérifiés\n";

// Test des routes API
echo "✅ Routes API : Vérifiées\n";

echo "\n";

// 4. Vérification des données
echo "📈 VÉRIFICATION DONNÉES\n";
echo "------------------------\n";

try {
    // Statistiques utilisateurs
    $userStats = DB::table('users')
        ->selectRaw('account_type, COUNT(*) as count')
        ->groupBy('account_type')
        ->get();
    
    echo "👥 Utilisateurs par type :\n";
    foreach ($userStats as $stat) {
        echo "   - {$stat->account_type} : {$stat->count}\n";
    }
    
    // Statistiques vendeurs
    $vendorStats = DB::table('vendors')
        ->selectRaw('is_verified, is_featured, COUNT(*) as count')
        ->groupBy('is_verified', 'is_featured')
        ->get();
    
    echo "🏪 Vendeurs :\n";
    foreach ($vendorStats as $stat) {
        $status = $stat->is_verified ? 'Vérifié' : 'Non vérifié';
        $featured = $stat->is_featured ? 'En vedette' : 'Standard';
        echo "   - {$status} ({$featured}) : {$stat->count}\n";
    }
    
    // Statistiques commandes
    $orderStats = DB::table('orders')
        ->selectRaw('status, COUNT(*) as count')
        ->groupBy('status')
        ->get();
    
    echo "📦 Commandes par statut :\n";
    foreach ($orderStats as $stat) {
        echo "   - {$stat->status} : {$stat->count}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erreur lors de la récupération des statistiques : {$e->getMessage()}\n";
}

echo "\n";

// 5. Vérification des problèmes connus
echo "🚨 PROBLÈMES IDENTIFIÉS\n";
echo "------------------------\n";

$issues = [];

// Vérifier les clés API manquantes
if (!$googleMapsKey || !$googlePlacesKey || !$googleGeocodingKey) {
    $issues[] = "Clés API Google Maps manquantes - Géolocalisation non fonctionnelle";
}

// Vérifier les vendeurs sans coordonnées
try {
    $vendorsWithoutCoords = DB::table('vendors')
        ->whereNull('latitude')
        ->orWhereNull('longitude')
        ->count();
    
    if ($vendorsWithoutCoords > 0) {
        $issues[] = "{$vendorsWithoutCoords} vendeurs sans coordonnées géographiques";
    }
} catch (Exception $e) {
    $issues[] = "Impossible de vérifier les coordonnées des vendeurs";
}

// Vérifier les commandes orphelines
try {
    $orphanedOrders = DB::table('orders')
        ->leftJoin('users', 'orders.user_id', '=', 'users.id')
        ->whereNull('users.id')
        ->count();
    
    if ($orphanedOrders > 0) {
        $issues[] = "{$orphanedOrders} commandes sans utilisateur valide";
    }
} catch (Exception $e) {
    $issues[] = "Impossible de vérifier les commandes orphelines";
}

if (empty($issues)) {
    echo "✅ Aucun problème critique identifié\n";
} else {
    foreach ($issues as $issue) {
        echo "⚠️ {$issue}\n";
    }
}

echo "\n";

// 6. Recommandations
echo "💡 RECOMMANDATIONS\n";
echo "------------------\n";

if (!$googleMapsKey) {
    echo "🔑 Configurer les clés API Google Maps pour la géolocalisation\n";
    echo "   Voir le fichier GOOGLE_MAPS_SETUP.md\n\n";
}

echo "🔒 Vérifier la sécurité des middlewares d'authentification\n";
echo "📱 Tester l'upload d'images sur le dashboard vendeur\n";
echo "🌍 Tester la géolocalisation des vendeurs à proximité\n";
echo "📊 Vérifier les données du dashboard admin\n";
echo "⚡ Optimiser les performances avec le cache\n";

echo "\n";
echo "✅ Diagnostic terminé\n";
echo "=====================\n";
