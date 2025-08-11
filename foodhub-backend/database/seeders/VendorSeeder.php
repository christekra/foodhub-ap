<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vendor;

class VendorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $vendors = [
            [
                'name' => 'Pizza Palace',
                'description' => 'Les meilleures pizzas de la ville, cuites au feu de bois',
                'email' => 'contact@pizzapalace.com',
                'phone' => '+1234567890',
                'address' => '123 Main Street',
                'city' => 'New York',
                'postal_code' => '10001',
                'latitude' => 40.7128,
                'longitude' => -74.0060,
                'opening_time' => '10:00:00',
                'closing_time' => '22:00:00',
                'is_open' => true,
                'rating' => 4.5,
                'review_count' => 150,
                'delivery_fee' => 2.50,
                'delivery_time' => 30,
                'minimum_order' => 15.00,
                'is_verified' => true,
                'is_featured' => true,
            ],
            [
                'name' => 'Burger House',
                'description' => 'Burgers gourmets avec des ingrédients frais',
                'email' => 'info@burgerhouse.com',
                'phone' => '+1234567891',
                'address' => '456 Oak Avenue',
                'city' => 'New York',
                'postal_code' => '10002',
                'latitude' => 40.7589,
                'longitude' => -73.9851,
                'opening_time' => '11:00:00',
                'closing_time' => '23:00:00',
                'is_open' => true,
                'rating' => 4.2,
                'review_count' => 89,
                'delivery_fee' => 3.00,
                'delivery_time' => 25,
                'minimum_order' => 12.00,
                'is_verified' => true,
                'is_featured' => false,
            ],
            [
                'name' => 'Sushi Master',
                'description' => 'Sushis frais préparés par des chefs japonais',
                'email' => 'hello@sushimaster.com',
                'phone' => '+1234567892',
                'address' => '789 Pine Street',
                'city' => 'New York',
                'postal_code' => '10003',
                'latitude' => 40.7505,
                'longitude' => -73.9934,
                'opening_time' => '12:00:00',
                'closing_time' => '21:00:00',
                'is_open' => true,
                'rating' => 4.8,
                'review_count' => 234,
                'delivery_fee' => 4.00,
                'delivery_time' => 35,
                'minimum_order' => 20.00,
                'is_verified' => true,
                'is_featured' => true,
            ],
            [
                'name' => 'Green Garden',
                'description' => 'Salades fraîches et plats végétariens',
                'email' => 'contact@greengarden.com',
                'phone' => '+1234567893',
                'address' => '321 Elm Street',
                'city' => 'New York',
                'postal_code' => '10004',
                'latitude' => 40.7829,
                'longitude' => -73.9654,
                'opening_time' => '09:00:00',
                'closing_time' => '20:00:00',
                'is_open' => true,
                'rating' => 4.3,
                'review_count' => 67,
                'delivery_fee' => 2.00,
                'delivery_time' => 20,
                'minimum_order' => 10.00,
                'is_verified' => true,
                'is_featured' => false,
            ],
            [
                'name' => 'Sweet Dreams',
                'description' => 'Desserts artisanaux et pâtisseries',
                'email' => 'info@sweetdreams.com',
                'phone' => '+1234567894',
                'address' => '654 Maple Avenue',
                'city' => 'New York',
                'postal_code' => '10005',
                'latitude' => 40.7614,
                'longitude' => -73.9776,
                'opening_time' => '08:00:00',
                'closing_time' => '19:00:00',
                'is_open' => true,
                'rating' => 4.6,
                'review_count' => 123,
                'delivery_fee' => 2.50,
                'delivery_time' => 15,
                'minimum_order' => 8.00,
                'is_verified' => true,
                'is_featured' => true,
            ],
        ];

        foreach ($vendors as $vendor) {
            Vendor::create($vendor);
        }
    }
} 