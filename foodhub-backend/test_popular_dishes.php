<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Dish;

echo "Test de récupération des plats populaires...\n\n";

// Vérifier combien de plats populaires existent
$popularDishes = Dish::where('is_popular', true)->count();
echo "Nombre de plats marqués comme populaires: $popularDishes\n";

// Si aucun plat populaire, en créer quelques-uns
if ($popularDishes === 0) {
    echo "Aucun plat populaire trouvé. Création de quelques plats populaires...\n";
    
    // Récupérer quelques plats existants et les marquer comme populaires
    $dishes = Dish::take(5)->get();
    
    foreach ($dishes as $dish) {
        $dish->update(['is_popular' => true]);
        echo "- Marqué comme populaire: {$dish->name}\n";
    }
    
    echo "Plats populaires créés avec succès!\n\n";
}

// Tester la méthode popular du contrôleur
try {
    $controller = new \App\Http\Controllers\Api\DishController();
    $response = $controller->popular();
    
    $data = json_decode($response->getContent(), true);
    
    echo "✓ API popular fonctionne correctement\n";
    echo "Code de statut: " . $response->getStatusCode() . "\n";
    echo "Nombre de plats populaires retournés: " . count($data['data']) . "\n\n";
    
    if (count($data['data']) > 0) {
        echo "Plats populaires:\n";
        foreach ($data['data'] as $dish) {
            $vendorName = $dish['vendor']['name'] ?? 'Vendeur inconnu';
            echo "- {$dish['name']} (Vendeur: $vendorName)\n";
        }
    } else {
        echo "Aucun plat populaire retourné par l'API\n";
    }
    
} catch (Exception $e) {
    echo "✗ Erreur API: " . $e->getMessage() . "\n";
}

echo "\nTest terminé.\n"; 