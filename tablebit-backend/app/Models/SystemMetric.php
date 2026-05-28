<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class SystemMetric extends Model {
    protected $table = 'system_metrics';
    protected $fillable = ['date', 'metric_type', 'total_count', 'success_count', 'error_count', 'metadata'];
    protected $casts = ['date' => 'date', 'metadata' => 'array'];
}
