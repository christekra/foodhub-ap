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
        // Ajouter des index pour optimiser les requêtes géographiques
        // Index composites pour latitude et longitude
        
        // Index pour la table clients
        Schema::table('clients', function (Blueprint $table) {
            $table->index(['latitude', 'longitude'], 'idx_clients_location');
        });
        
        // Index pour la table vendor_applications
        Schema::table('vendor_applications', function (Blueprint $table) {
            $table->index(['latitude', 'longitude'], 'idx_vendor_applications_location');
        });
        
        // Index pour la table vendors (si elle a des coordonnées)
        if (Schema::hasColumn('vendors', 'latitude') && Schema::hasColumn('vendors', 'longitude')) {
            Schema::table('vendors', function (Blueprint $table) {
                $table->index(['latitude', 'longitude'], 'idx_vendors_location');
            });
        }
        
        // Index pour la table order_tracking (si elle a des coordonnées)
        if (Schema::hasColumn('order_tracking', 'latitude') && Schema::hasColumn('order_tracking', 'longitude')) {
            Schema::table('order_tracking', function (Blueprint $table) {
                $table->index(['latitude', 'longitude'], 'idx_order_tracking_location');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Supprimer les index
        Schema::table('clients', function (Blueprint $table) {
            $table->dropIndex('idx_clients_location');
        });
        
        Schema::table('vendor_applications', function (Blueprint $table) {
            $table->dropIndex('idx_vendor_applications_location');
        });
        
        if (Schema::hasColumn('vendors', 'latitude') && Schema::hasColumn('vendors', 'longitude')) {
            Schema::table('vendors', function (Blueprint $table) {
                $table->dropIndex('idx_vendors_location');
            });
        }
        
        if (Schema::hasColumn('order_tracking', 'latitude') && Schema::hasColumn('order_tracking', 'longitude')) {
            Schema::table('order_tracking', function (Blueprint $table) {
                $table->dropIndex('idx_order_tracking_location');
            });
        }
    }
};
