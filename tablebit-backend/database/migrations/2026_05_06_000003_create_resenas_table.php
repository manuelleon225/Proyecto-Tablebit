<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resenas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('restaurante_id')->constrained('restaurantes')->onDelete('cascade');
            $table->foreignId('reserva_id')->nullable()->constrained('reservas')->onDelete('set null');
            $table->tinyInteger('rating')->comment('1-5 estrellas');
            $table->text('comentario')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['cliente_id', 'restaurante_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resenas');
    }
};
