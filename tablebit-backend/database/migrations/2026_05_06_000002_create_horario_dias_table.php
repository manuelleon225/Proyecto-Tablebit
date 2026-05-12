<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horario_dias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurante_id')->constrained('restaurantes')->onDelete('cascade');
            $table->enum('dia', ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']);
            $table->boolean('activo')->default(true);
            $table->time('hora_apertura')->nullable();
            $table->time('hora_cierre')->nullable();
            $table->time('hora_apertura_tarde')->nullable()->comment('Segundo turno (almuerzo/cena)');
            $table->time('hora_cierre_tarde')->nullable();
            $table->timestamps();

            $table->unique(['restaurante_id', 'dia']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horario_dias');
    }
};
