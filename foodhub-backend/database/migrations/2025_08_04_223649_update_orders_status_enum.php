<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Ajouter une colonne temporaire pour les nouveaux statuts
            $table->enum('new_status', [
                'pending',
                'confirmed', 
                'preparing',
                'ready',
                'out_for_delivery',
                'delivered',
                'cancelled',
                'refunded'
            ])->default('pending')->after('status');
        });

        // Mettre à jour les statuts existants
        DB::statement("UPDATE orders SET new_status = CASE 
            WHEN status = 'pending' THEN 'pending'
            WHEN status = 'confirmed' THEN 'confirmed'
            WHEN status = 'delivered' THEN 'delivered'
            WHEN status = 'cancelled' THEN 'cancelled'
            ELSE 'pending'
        END");

        // Supprimer l'ancienne colonne et renommer la nouvelle
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->renameColumn('new_status', 'status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('old_status', ['pending', 'confirmed', 'delivered', 'cancelled'])->default('pending')->after('status');
        });

        DB::statement("UPDATE orders SET old_status = CASE 
            WHEN status = 'pending' THEN 'pending'
            WHEN status = 'confirmed' THEN 'confirmed'
            WHEN status = 'preparing' THEN 'confirmed'
            WHEN status = 'ready' THEN 'confirmed'
            WHEN status = 'out_for_delivery' THEN 'confirmed'
            WHEN status = 'delivered' THEN 'delivered'
            WHEN status = 'cancelled' THEN 'cancelled'
            WHEN status = 'refunded' THEN 'cancelled'
            ELSE 'pending'
        END");

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->renameColumn('old_status', 'status');
        });
    }
};
