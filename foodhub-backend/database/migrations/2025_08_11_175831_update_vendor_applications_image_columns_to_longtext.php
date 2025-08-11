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
        Schema::table('vendor_applications', function (Blueprint $table) {
            // Changer les colonnes d'images de string à longText pour supporter les images base64
            $table->longText('logo')->nullable()->change();
            $table->longText('cover_image')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vendor_applications', function (Blueprint $table) {
            // Revenir aux colonnes string
            $table->string('logo')->nullable()->change();
            $table->string('cover_image')->nullable()->change();
        });
    }
};
