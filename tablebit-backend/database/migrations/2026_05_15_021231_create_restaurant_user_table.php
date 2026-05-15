<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurant_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurante_id')->constrained('restaurantes')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('usuarios')->onDelete('cascade');
            $table->string('role')->default('owner'); // owner, admin, staff
            $table->timestamps();
            $table->unique(['restaurante_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_user');
    }
};
