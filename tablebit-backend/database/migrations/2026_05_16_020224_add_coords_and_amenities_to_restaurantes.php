<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurantes', function (Blueprint $table) {
            $table->string('lat', 20)->nullable()->after('capacidad_total');
            $table->string('lng', 20)->nullable()->after('lat');
            $table->json('amenities')->nullable()->after('lng');
        });
    }

    public function down(): void
    {
        Schema::table('restaurantes', function (Blueprint $table) {
            $table->dropColumn(['lat', 'lng', 'amenities']);
        });
    }
};
