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
        Schema::create('restaurantes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained('usuarios')->onDelete('cascade');
            $table->string('nombre');
            $table->string('direccion');
            $table->string('telefono')->nullable();

            $table->enum('estado', ['activo','inactivo'])->default('activo');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('restaurantes');
    }
};
