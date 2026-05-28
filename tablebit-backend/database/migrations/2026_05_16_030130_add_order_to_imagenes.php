<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('imagenes', 'orden')) {
            Schema::table('imagenes', function (Blueprint $table) {
                $table->integer('orden')->default(0)->after('tamanio_kb');
            });
        }

        if (!Schema::hasColumn('restaurantes', 'logo')) {
            Schema::table('restaurantes', function (Blueprint $table) {
                $table->string('logo')->nullable()->after('imagen');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('imagenes', 'orden')) {
            Schema::table('imagenes', function (Blueprint $table) {
                $table->dropColumn('orden');
            });
        }
        if (Schema::hasColumn('restaurantes', 'logo')) {
            Schema::table('restaurantes', function (Blueprint $table) {
                $table->dropColumn('logo');
            });
        }
    }
};
