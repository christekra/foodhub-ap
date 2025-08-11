<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Client;
use App\Models\VendorApplication;
use App\Models\DishApplication;
use App\Models\ReviewApplication;
use App\Models\Vendor;
use App\Models\Dish;
use App\Models\Order;
use App\Models\Category;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer un administrateur (ou récupérer s'il existe)
        $admin = User::firstOrCreate(
            ['email' => 'admin@foodhub.ci'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('admin123'),
                'account_type' => 'admin',
                'status' => 'active',
                'is_admin' => true,
            ]
        );

        // Créer quelques clients
        $client1 = User::firstOrCreate(
            ['email' => 'client1@test.com'],
            [
                'name' => 'John Client',
                'password' => Hash::make('password123'),
                'account_type' => 'client',
                'status' => 'active',
            ]
        );

        Client::firstOrCreate(
            ['user_id' => $client1->id],
            [
                'phone' => '+2250701234567',
                'address' => '123 Rue de la Paix, Cocody',
                'city' => 'Abidjan',
                'postal_code' => '22501',
                'status' => 'active',
                'total_orders' => 5,
                'total_spent' => 25000,
            ]
        );

        $client2 = User::firstOrCreate(
            ['email' => 'client2@test.com'],
            [
                'name' => 'Marie Client',
                'password' => Hash::make('password123'),
                'account_type' => 'client',
                'status' => 'active',
            ]
        );

        Client::firstOrCreate(
            ['user_id' => $client2->id],
            [
                'phone' => '+2250707654321',
                'address' => '456 Avenue des Clients, Marcory',
                'city' => 'Abidjan',
                'postal_code' => '22502',
                'status' => 'active',
                'total_orders' => 3,
                'total_spent' => 15000,
            ]
        );

        // Créer des candidatures vendeurs
        $vendorUser1 = User::firstOrCreate(
            ['email' => 'chef.pierre@test.com'],
            [
                'name' => 'Chef Pierre',
                'password' => Hash::make('password123'),
                'account_type' => 'client', // Commence comme client
                'status' => 'active',
            ]
        );

        VendorApplication::firstOrCreate(
            ['user_id' => $vendorUser1->id],
            [
                'restaurant_name' => 'Le Petit Bistrot',
                'description' => 'Restaurant français authentique avec des plats traditionnels',
                'phone' => '+2250701111111',
                'address' => '789 Boulevard de la Gastronomie',
                'city' => 'Abidjan',
                'postal_code' => '22503',
                'cuisine_type' => 'Française',
                'opening_hours' => '11h-23h',
                'delivery_radius' => '8',
                'delivery_fee' => 500,
                'delivery_time' => 45,
                'status' => 'pending',
            ]
        );

        $vendorUser2 = User::firstOrCreate(
            ['email' => 'mama.fatou@test.com'],
            [
                'name' => 'Mama Fatou',
                'password' => Hash::make('password123'),
                'account_type' => 'client',
                'status' => 'active',
            ]
        );

        VendorApplication::firstOrCreate(
            ['user_id' => $vendorUser2->id],
            [
                'restaurant_name' => 'Chez Mama Fatou',
                'description' => 'Cuisine ivoirienne traditionnelle et authentique',
                'phone' => '+2250702222222',
                'address' => '321 Rue de la Tradition',
                'city' => 'Abidjan',
                'postal_code' => '22504',
                'cuisine_type' => 'Ivoirienne',
                'opening_hours' => '10h-22h',
                'delivery_radius' => '6',
                'delivery_fee' => 300,
                'delivery_time' => 35,
                'status' => 'under_review',
                'admin_notes' => 'Documents en cours de vérification',
                'reviewed_at' => now(),
                'reviewed_by' => $admin->id,
            ]
        );

        // Créer un vendeur approuvé pour les candidatures plats
        $approvedVendor = User::firstOrCreate(
            ['email' => 'restaurant.approuve@test.com'],
            [
                'name' => 'Restaurant Approuvé',
                'password' => Hash::make('password123'),
                'account_type' => 'vendor',
                'status' => 'active',
            ]
        );

        $vendor = Vendor::firstOrCreate(
            ['user_id' => $approvedVendor->id],
            [
                'name' => 'Restaurant Approuvé',
                'description' => 'Restaurant déjà approuvé pour tester les candidatures plats',
                'email' => 'restaurant.approuve@test.com',
                'phone' => '+2250703333333',
                'address' => '555 Avenue des Restaurants',
                'city' => 'Abidjan',
                'postal_code' => '22505',
                'cuisine_type' => 'Internationale',
                'opening_hours' => '11h-00h',
                'delivery_radius' => '10',
                'delivery_fee' => 400,
                'delivery_time' => 40,
                'is_verified' => true,
                'is_featured' => true,
                'rating' => 4.5,
                'review_count' => 25,
            ]
        );

        // Créer des candidatures plats
        $category = Category::first();
        if ($category) {
            DishApplication::firstOrCreate(
                [
                    'vendor_id' => $vendor->id,
                    'name' => 'Pizza Margherita'
                ],
                [
                    'description' => 'Pizza traditionnelle avec tomates, mozzarella et basilic',
                    'price' => 3500,
                    'category_id' => $category->id,
                    'ingredients' => ['farine', 'tomates', 'mozzarella', 'basilic', 'huile d\'olive'],
                    'allergens' => ['gluten', 'lactose'],
                    'nutritional_info' => [
                        'calories' => 280,
                        'protein' => 12,
                        'carbs' => 35,
                        'fat' => 8
                    ],
                    'is_vegetarian' => true,
                    'preparation_time' => 20,
                    'spice_level' => 'mild',
                    'status' => 'pending',
                ]
            );

            DishApplication::firstOrCreate(
                [
                    'vendor_id' => $vendor->id,
                    'name' => 'Burger Gourmet'
                ],
                [
                    'description' => 'Burger avec steak de bœuf, fromage, salade et sauce spéciale',
                    'price' => 4500,
                    'category_id' => $category->id,
                    'ingredients' => ['pain burger', 'steak bœuf', 'fromage', 'salade', 'tomate', 'oignon'],
                    'allergens' => ['gluten', 'lactose'],
                    'nutritional_info' => [
                        'calories' => 650,
                        'protein' => 35,
                        'carbs' => 45,
                        'fat' => 25
                    ],
                    'is_vegetarian' => false,
                    'preparation_time' => 15,
                    'spice_level' => 'medium',
                    'status' => 'under_review',
                    'admin_notes' => 'Vérifier la qualité de la viande',
                    'reviewed_at' => now(),
                    'reviewed_by' => $admin->id,
                ]
            );
        }

        // Créer des candidatures avis (nécessite des plats et commandes existants)
        $dish = Dish::first();
        $order = Order::first();
        
        if ($dish && $order) {
            ReviewApplication::firstOrCreate(
                [
                    'user_id' => $client1->id,
                    'dish_id' => $dish->id,
                    'order_id' => $order->id,
                ],
                [
                    'rating' => 5,
                    'comment' => 'Excellent plat ! Très savoureux et bien présenté. Je recommande vivement.',
                    'status' => 'pending',
                ]
            );

            ReviewApplication::firstOrCreate(
                [
                    'user_id' => $client2->id,
                    'dish_id' => $dish->id,
                    'order_id' => $order->id,
                ],
                [
                    'rating' => 4,
                    'comment' => 'Bon plat, mais un peu trop salé à mon goût. Sinon très bien.',
                    'status' => 'under_review',
                    'admin_notes' => 'Avis constructif, à approuver',
                    'reviewed_at' => now(),
                    'reviewed_by' => $admin->id,
                ]
            );
        }

        $this->command->info('Données admin créées avec succès !');
        $this->command->info('Admin: admin@foodhub.ci / admin123');
        $this->command->info('Client 1: client1@test.com / password123');
        $this->command->info('Client 2: client2@test.com / password123');
        $this->command->info('Candidat vendeur 1: chef.pierre@test.com / password123');
        $this->command->info('Candidat vendeur 2: mama.fatou@test.com / password123');
    }
}
