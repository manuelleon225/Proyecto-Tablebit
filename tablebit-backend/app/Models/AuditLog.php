<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $table = 'audit_logs';
    protected $fillable = ['user_id', 'action', 'entity_type', 'entity_id', 'metadata', 'ip_address'];
    protected $casts = ['metadata' => 'array'];

    public function user()
    {
        return $this->belongsTo(Usuario::class);
    }
}
