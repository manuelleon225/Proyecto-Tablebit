<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mesas', function (Blueprint $table) {
            $table->unique(['restaurante_id', 'numero']);
        });

        Schema::table('reservas', function (Blueprint $table) {
            $table->index(['restaurante_id', 'fecha']);
            $table->index(['cliente_id', 'fecha']);
            $table->index(['fecha', 'hora']);
        });

        Schema::table('mesas', function (Blueprint $table) {
            $table->index(['restaurante_id', 'estado']);
        });

        Schema::table('resenas', function (Blueprint $table) {
            $table->index(['restaurante_id', 'rating']);
        });
    }

    public function down(): void
    {
        Schema::table('mesas', function (Blueprint $table) {
            $table->dropUnique(['restaurante_id', 'numero']);
            $table->dropIndex(['restaurante_id', 'estado']);
        });

        Schema::table('reservas', function (Blueprint $table) {
            $table->dropIndex(['restaurante_id', 'fecha']);
            $table->dropIndex(['cliente_id', 'fecha']);
            $table->dropIndex(['fecha', 'hora']);
        });

        Schema::table('resenas', function (Blueprint $table) {
            $table->dropIndex(['restaurante_id', 'rating']);
        });
    }
};
