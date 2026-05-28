<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Alert extends Model {
    protected $table = 'alerts';
    protected $fillable = ['type', 'source', 'message', 'metadata', 'status', 'resolved_at'];
    protected $casts = ['metadata' => 'array', 'resolved_at' => 'datetime'];
}
