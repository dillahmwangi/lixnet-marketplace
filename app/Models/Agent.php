<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Agent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'application_id',
        'agent_code',
        'is_active',
        'tier_id',
        'bank_name',
        'account_holder_name',
        'account_number',
        'branch_code',
        'swift_code',
        'bank_address',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($agent) {
            if (empty($agent->agent_code)) {
                $agent->agent_code = 'AGT-' . strtoupper(Str::random(8));
            }
        });
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function application()
    {
        return $this->belongsTo(AgentApplication::class, 'application_id');
    }

    public function commissions()
    {
        return $this->hasMany(Commission::class);
    }

    public function currentCommission()
    {
        return $this->hasOne(Commission::class)->latestOfMany();
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function tier()
    {
        return $this->belongsTo(AgentTier::class, 'agent_id');
    }
}
