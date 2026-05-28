<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('imagenes', 'metadata')) {
            Schema::table('imagenes', function (Blueprint $table) {
                $table->json('metadata')->nullable()->after('orden');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('imagenes', 'metadata')) {
            Schema::table('imagenes', function (Blueprint $table) {
                $table->dropColumn('metadata');
            });
        }
    }
};
