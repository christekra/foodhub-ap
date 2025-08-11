<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Order;
use App\Models\User;

echo "Test de récupération de commande ID 27...\n\n";

// Trouver la commande 27
$order = Order::with(['vendor', 'orderItems.dish'])->find(27);

if (!$order) {
    echo "✗ Commande 27 non trouvée\n";
    exit(1);
}

echo "✓ Commande trouvée:\n";
echo "- ID: " . $order->id . "\n";
echo "- Numéro: " . $order->order_number . "\n";
echo "- Statut: " . $order->status . "\n";
echo "- User ID: " . $order->user_id . "\n";
echo "- Vendor ID: " . $order->vendor_id . "\n\n";

// Trouver l'utilisateur propriétaire
$user = User::find($order->user_id);
if ($user) {
    echo "✓ Utilisateur propriétaire: " . $user->name . " (ID: " . $user->id . ")\n";
} else {
    echo "✗ Utilisateur propriétaire non trouvé\n";
}

// Simuler l'authentification
auth()->login($user);

try {
    $controller = new \App\Http\Controllers\Api\OrderController();
    $response = $controller->show(27);
    
    echo "✓ API fonctionne correctement\n";
    echo "Code de statut: " . $response->getStatusCode() . "\n";
    
    $data = json_decode($response->getContent(), true);
    echo "Données retournées:\n";
    echo "- Success: " . ($data['success'] ? 'true' : 'false') . "\n";
    echo "- Status: " . $data['data']['status'] . "\n";
    echo "- Status Label: " . $data['data']['status_label'] . "\n";
    echo "- Next Statuses: ";
    print_r($data['data']['next_possible_statuses']);
    
} catch (Exception $e) {
    echo "✗ Erreur API: " . $e->getMessage() . "\n";
}

echo "\nTest terminé.\n"; 