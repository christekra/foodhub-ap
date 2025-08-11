<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Vendor;

echo "Mise à jour des informations de livraison des vendeurs...\n\n";

// Mettre à jour les vendeurs avec des informations de livraison réalistes
$vendors = Vendor::all();

foreach ($vendors as $vendor) {
    // Générer des informations de livraison aléatoires mais réalistes
    $deliveryTimes = [15, 20, 25, 30, 35, 40, 45]; // en minutes
    $deliveryFees = [500, 750, 1000, 1250, 1500];
    $minimumOrders = [2000, 2500, 3000, 3500, 4000];
    
    $deliveryTime = $deliveryTimes[array_rand($deliveryTimes)];
    
    $vendor->update([
        'delivery_time' => $deliveryTime,
        'delivery_fee' => $deliveryFees[array_rand($deliveryFees)],
        'minimum_order' => $minimumOrders[array_rand($minimumOrders)],
    ]);
    
    echo "✓ Mis à jour: {$vendor->name} - Livraison: {$deliveryTime} min, Frais: {$vendor->delivery_fee} FCFA\n";
}

echo "\nMise à jour terminée!\n"; 