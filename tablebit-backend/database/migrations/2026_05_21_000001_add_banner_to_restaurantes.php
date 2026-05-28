<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('restaurantes', 'banner')) {
            Schema::table('restaurantes', function (Blueprint $table) {
                $table->string('banner')->nullable()->after('logo');
            });
        }

        if (Schema::hasColumn('restaurantes', 'portada')) {
            Schema::table('restaurantes', function (Blueprint $table) {
                $table->dropColumn('portada');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('restaurantes', 'banner')) {
            Schema::table('restaurantes', function (Blueprint $table) {
                $table->dropColumn('banner');
            });
        }
    }
};
