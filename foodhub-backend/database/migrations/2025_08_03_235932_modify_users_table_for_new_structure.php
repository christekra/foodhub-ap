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
        Schema::table('users', function (Blueprint $table) {
            // Supprimer les colonnes qui seront dans les tables séparées
            $table->dropColumn(['phone', 'address', 'city', 'postal_code', 'avatar', 'is_vendor']);
            
            // Ajouter un champ pour le type de compte
            $table->enum('account_type', ['client', 'vendor', 'admin'])->default('client')->after('email');
            
            // Ajouter un champ pour le statut du compte
            $table->enum('status', ['active', 'pending', 'suspended', 'banned'])->default('active')->after('account_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('avatar')->nullable();
            $table->boolean('is_vendor')->default(false);
            
            $table->dropColumn(['account_type', 'status']);
        });
    }
};
