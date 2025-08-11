<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dishes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 8, 2);
            $table->decimal('discount_price', 8, 2)->nullable();
            $table->text('image')->nullable(); // Changé en TEXT pour permettre des images plus grandes
            $table->json('images')->nullable(); // Pour plusieurs images
            $table->boolean('is_available')->default(true);
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('review_count')->default(0);
            $table->integer('order_count')->default(0);
            $table->json('ingredients')->nullable();
            $table->json('allergens')->nullable();
            $table->integer('preparation_time')->default(15); // en minutes
            $table->decimal('calories', 6, 2)->nullable();
            $table->string('cuisine_type')->nullable();
            $table->boolean('is_vegetarian')->default(false);
            $table->boolean('is_vegan')->default(false);
            $table->boolean('is_gluten_free')->default(false);
            $table->boolean('is_spicy')->default(false);
            $table->integer('spice_level')->default(0); // 0-5
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dishes');
    }
};
