<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        if (!Schema::hasTable('system_metrics')) {
            Schema::create('system_metrics', function (Blueprint $table) {
                $table->id();
                $table->date('date')->index();
                $table->string('metric_type');
                $table->integer('total_count')->default(0);
                $table->integer('success_count')->default(0);
                $table->integer('error_count')->default(0);
                $table->json('metadata')->nullable();
                $table->timestamps();
                $table->unique(['date', 'metric_type']);
            });
        }
    }
    public function down(): void { Schema::dropIfExists('system_metrics'); }
};
