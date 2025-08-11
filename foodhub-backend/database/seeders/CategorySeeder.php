<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Pizzas',
                'description' => 'Délicieuses pizzas fraîches',
                'icon' => '🍕',
                'sort_order' => 1,
            ],
            [
                'name' => 'Burgers',
                'description' => 'Burgers gourmets et classiques',
                'icon' => '🍔',
                'sort_order' => 2,
            ],
            [
                'name' => 'Sushis',
                'description' => 'Sushis frais et variés',
                'icon' => '🍣',
                'sort_order' => 3,
            ],
            [
                'name' => 'Salades',
                'description' => 'Salades fraîches et équilibrées',
                'icon' => '🥗',
                'sort_order' => 4,
            ],
            [
                'name' => 'Desserts',
                'description' => 'Desserts sucrés et délicieux',
                'icon' => '🍰',
                'sort_order' => 5,
            ],
            [
                'name' => 'Boissons',
                'description' => 'Boissons rafraîchissantes',
                'icon' => '🥤',
                'sort_order' => 6,
            ],
            [
                'name' => 'Plats traditionnels',
                'description' => 'Plats traditionnels locaux',
                'icon' => '🍲',
                'sort_order' => 7,
            ],
            [
                'name' => 'Fast Food',
                'description' => 'Fast food rapide et délicieux',
                'icon' => '🍟',
                'sort_order' => 8,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
} 