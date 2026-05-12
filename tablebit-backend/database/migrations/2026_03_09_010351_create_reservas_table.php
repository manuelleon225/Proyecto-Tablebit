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
         Schema::create('reservas', function (Blueprint $table) {
            $table->id();

            $table->foreignId('cliente_id')
                  ->constrained('usuarios')
                  ->onDelete('cascade');

            $table->foreignId('restaurante_id')
                  ->constrained('restaurantes')
                  ->onDelete('cascade');

            $table->foreignId('mesa_id')
                  ->constrained('mesas')
                  ->onDelete('cascade');

            $table->date('fecha');
            $table->time('hora');

            $table->integer('duracion'); 
            $table->integer('cantidad_personas');

            $table->string('tipo_evento')->nullable();
            $table->text('notas')->nullable();

            $table->enum('estado', [
                'pendiente_confirmacion',
                'confirmada',
                'cancelada',
                'finalizada'
            ])->default('pendiente_confirmacion');

            $table->timestamps();
    });
   }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};
