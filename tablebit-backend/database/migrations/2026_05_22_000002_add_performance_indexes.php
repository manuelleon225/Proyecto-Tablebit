<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasIndex('imagenes', 'imagenes_restaurante_id_tipo_index')) {
            Schema::table('imagenes', function (Blueprint $table) {
                $table->index(['restaurante_id', 'tipo'], 'imagenes_restaurante_id_tipo_index');
            });
        }

        if (!Schema::hasIndex('reservas', 'reservas_restaurante_id_fecha_index')) {
            Schema::table('reservas', function (Blueprint $table) {
                $table->index(['restaurante_id', 'fecha'], 'reservas_restaurante_id_fecha_index');
            });
        }
    }

    public function down(): void
    {
        Schema::table('imagenes', function (Blueprint $table) {
            $table->dropIndex('imagenes_restaurante_id_tipo_index');
        });
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropIndex('reservas_restaurante_id_fecha_index');
        });
    }
};
