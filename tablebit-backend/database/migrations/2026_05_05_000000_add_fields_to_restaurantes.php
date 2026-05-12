<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurantes', function (Blueprint $table) {
            $table->text('descripcion')->nullable()->after('telefono');
            $table->string('imagen')->nullable()->after('descripcion');
            $table->string('ciudad')->nullable()->after('direccion');
            $table->string('tipo_comida')->nullable()->after('ciudad');
            $table->string('horario_apertura')->nullable()->after('tipo_comida');
            $table->string('horario_cierre')->nullable()->after('horario_apertura');
            $table->integer('capacidad_total')->nullable()->after('horario_cierre');
        });
    }

    public function down(): void
    {
        Schema::table('restaurantes', function (Blueprint $table) {
            $table->dropColumn([
                'descripcion', 'imagen', 'ciudad', 'tipo_comida',
                'horario_apertura', 'horario_cierre', 'capacidad_total',
            ]);
        });
    }
};
