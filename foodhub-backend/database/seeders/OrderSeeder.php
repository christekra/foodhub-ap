<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Dish;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        // Récupérer les utilisateurs et vendeurs existants
        $users = User::where('is_vendor', false)->get();
        $vendors = Vendor::all();
        $dishes = Dish::all();

        if ($users->isEmpty() || $vendors->isEmpty() || $dishes->isEmpty()) {
            return;
        }

        $statuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'];
        $paymentMethods = ['cash', 'card', 'mobile_money'];

        // Créer 20 commandes de test
        for ($i = 1; $i <= 20; $i++) {
            $user = $users->random();
            $vendor = $vendors->random();
            $vendorDishes = $dishes->where('vendor_id', $vendor->id);
            
            if ($vendorDishes->isEmpty()) {
                continue;
            }

            $status = $statuses[array_rand($statuses)];
            $paymentMethod = $paymentMethods[array_rand($paymentMethods)];
            
            // Calculer les dates en fonction du statut
            $createdAt = now()->subDays(rand(1, 30));
            $updatedAt = $createdAt;
            
            if (in_array($status, ['confirmed', 'preparing', 'ready', 'delivering', 'delivered'])) {
                $updatedAt = $createdAt->addMinutes(rand(5, 60));
            }

            $order = Order::create([
                'order_number' => 'ORD-' . str_pad($i, 6, '0', STR_PAD_LEFT),
                'user_id' => $user->id,
                'vendor_id' => $vendor->id,
                'status' => $status,
                'subtotal' => 0, // Sera calculé après
                'delivery_fee' => rand(200, 500) / 100, // 2€ à 5€
                'total' => 0, // Sera calculé après
                'customer_name' => $user->name,
                'customer_phone' => $user->phone,
                'delivery_address' => $user->address,
                'delivery_city' => $user->city,
                'delivery_postal_code' => $user->postal_code,
                'special_instructions' => rand(0, 1) ? 'Livraison à l\'entrée principale' : null,
                'payment_method' => $paymentMethod,
                'estimated_delivery_time' => now()->addMinutes(rand(30, 90)),
                'created_at' => $createdAt,
                'updated_at' => $updatedAt,
            ]);

            // Créer les articles de commande
            $subtotal = 0;
            $orderItemsCount = rand(1, 4);
            $selectedDishes = $vendorDishes->random(min($orderItemsCount, $vendorDishes->count()));

            foreach ($selectedDishes as $dish) {
                $quantity = rand(1, 3);
                $unitPrice = $dish->discount_price ?? $dish->price;
                $totalPrice = $unitPrice * $quantity;
                $subtotal += $totalPrice;

                OrderItem::create([
                    'order_id' => $order->id,
                    'dish_id' => $dish->id,
                    'dish_name' => $dish->name,
                    'quantity' => $quantity,
                    'price' => $unitPrice,
                    'total' => $totalPrice,
                    'special_instructions' => rand(0, 1) ? 'Sans oignons' : null,
                ]);
            }

            // Mettre à jour le total de la commande
            $order->update([
                'subtotal' => $subtotal,
                'total' => $subtotal + $order->delivery_fee,
            ]);
        }
    }
}
