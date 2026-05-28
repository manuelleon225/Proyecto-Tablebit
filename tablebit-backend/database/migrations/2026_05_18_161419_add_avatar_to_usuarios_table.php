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
        if (!Schema::hasColumn('usuarios', 'avatar')) {
            Schema::table('usuarios', function (Blueprint $table) {
                $table->string('avatar')->nullable()->after('email');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('usuarios', 'avatar')) {
            Schema::table('usuarios', function (Blueprint $table) {
                $table->dropColumn('avatar');
            });
        }
    }
};
