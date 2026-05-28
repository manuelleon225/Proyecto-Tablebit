<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        if (!Schema::hasTable('alerts')) {
            Schema::create('alerts', function (Blueprint $table) {
                $table->id();
                $table->string('type'); // error, warning, critical
                $table->string('source'); // system, images, auth, api
                $table->string('message');
                $table->json('metadata')->nullable();
                $table->enum('status', ['active', 'resolved'])->default('active');
                $table->timestamp('resolved_at')->nullable();
                $table->timestamps();
                $table->index(['status', 'created_at']);
            });
        }
    }
    public function down(): void { Schema::dropIfExists('alerts'); }
};
