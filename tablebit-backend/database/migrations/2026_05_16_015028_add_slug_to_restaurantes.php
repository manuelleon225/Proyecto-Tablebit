<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurantes', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('nombre');
        });

        // Generate slugs for existing restaurants
        $restaurantes = DB::table('restaurantes')->whereNull('slug')->get();
        foreach ($restaurantes as $rest) {
            $slug = Str::slug($rest->nombre);
            $base = $slug;
            $counter = 1;
            while (DB::table('restaurantes')->where('slug', $slug)->where('id', '!=', $rest->id)->exists()) {
                $slug = $base . '-' . $counter++;
            }
            DB::table('restaurantes')->where('id', $rest->id)->update(['slug' => $slug]);
        }

        // Keep nullable for backward compatibility (factories, etc.)
        // Slugs are auto-generated on create via model boot()
    }

    public function down(): void
    {
        Schema::table('restaurantes', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
