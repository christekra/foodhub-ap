<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('order_tracking', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('status');
            $table->text('notes')->nullable();
            $table->decimal('latitude', 10, 8)->nullable(); // Position du livreur
            $table->decimal('longitude', 11, 8)->nullable(); // Position du livreur
            $table->string('location_address')->nullable(); // Adresse de la position
            $table->timestamp('estimated_arrival')->nullable(); // Heure d'arrivée estimée
            $table->foreignId('updated_by')->constrained('users'); // Qui a mis à jour
            $table->timestamps();
        });

        // Table pour les positions des livreurs
        Schema::create('delivery_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('delivery_user_id')->nullable()->constrained('users'); // Livreur
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->string('location_address')->nullable();
            $table->timestamp('recorded_at');
            $table->timestamps();
        });

        // Table pour les préférences de localisation des clients
        Schema::create('user_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name'); // "Domicile", "Bureau", etc.
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->string('address');
            $table->string('city');
            $table->string('postal_code')->nullable();
            $table->text('instructions')->nullable(); // Instructions de livraison
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('order_tracking');
        Schema::dropIfExists('delivery_locations');
        Schema::dropIfExists('user_locations');
    }
}; 