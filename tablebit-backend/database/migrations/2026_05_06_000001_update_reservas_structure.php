<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('reservas', 'hora_fin')) {
            Schema::table('reservas', function (Blueprint $table) {
                $table->time('hora_fin')->nullable()->after('hora');
            });
        }

        if (!Schema::hasColumn('reservas', 'deleted_at')) {
            Schema::table('reservas', function (Blueprint $table) {
                $table->softDeletes()->after('updated_at');
            });
        }

        if (DB::getDriverName() === 'mysql') {
            $estadoValues = DB::select("SHOW COLUMNS FROM reservas WHERE Field = 'estado'");
            if ($estadoValues) {
                $currentType = $estadoValues[0]->Type;
                if (!str_contains($currentType, 'completada')) {
                    DB::statement("ALTER TABLE reservas MODIFY COLUMN estado ENUM('pendiente_confirmacion','confirmada','finalizada','pendiente','completada','cancelada','no_show') DEFAULT 'confirmada'");
                    DB::statement("UPDATE reservas SET estado = 'pendiente' WHERE estado = 'pendiente_confirmacion'");
                    DB::statement("UPDATE reservas SET estado = 'completada' WHERE estado = 'finalizada'");
                    DB::statement("ALTER TABLE reservas MODIFY COLUMN estado ENUM('pendiente','confirmada','completada','cancelada','no_show') DEFAULT 'confirmada'");
                }
            }
        }
    }

    public function down(): void
    {
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropColumn(['hora_fin']);
            $table->dropSoftDeletes();
        });
    }
};
