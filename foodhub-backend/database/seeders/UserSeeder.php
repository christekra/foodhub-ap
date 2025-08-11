<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer un utilisateur client de test
        User::create([
            'name' => 'John Doe',
            'email' => 'client@test.com',
            'password' => Hash::make('password123'),
            'phone' => '+2250701234567',
            'address' => '123 Rue de la Paix',
            'city' => 'Abidjan',
            'postal_code' => '22501',
            'is_vendor' => false,
        ]);

        // Créer un utilisateur vendeur de test
        User::create([
            'name' => 'Marie Restaurant',
            'email' => 'vendeur@test.com',
            'password' => Hash::make('password123'),
            'phone' => '+2250707654321',
            'address' => '456 Avenue des Restaurants',
            'city' => 'Abidjan',
            'postal_code' => '22502',
            'is_vendor' => true,
        ]);

        // Créer quelques utilisateurs supplémentaires
        User::create([
            'name' => 'Alice Martin',
            'email' => 'alice@test.com',
            'password' => Hash::make('password123'),
            'phone' => '+2250701111111',
            'address' => '789 Boulevard Central',
            'city' => 'Abidjan',
            'postal_code' => '22503',
            'is_vendor' => false,
        ]);

        User::create([
            'name' => 'Chef Pierre',
            'email' => 'chef@test.com',
            'password' => Hash::make('password123'),
            'phone' => '+2250702222222',
            'address' => '321 Rue des Chefs',
            'city' => 'Abidjan',
            'postal_code' => '22504',
            'is_vendor' => true,
        ]);

        // Créer un utilisateur administrateur
        User::create([
            'name' => 'Administrateur',
            'email' => 'admin@foodhub.ci',
            'password' => Hash::make('admin123'),
            'phone' => '+2250701234568',
            'address' => '456 Avenue de la Paix',
            'city' => 'Abidjan',
            'postal_code' => '22502',
            'is_admin' => true,
        ]);
    }
} 