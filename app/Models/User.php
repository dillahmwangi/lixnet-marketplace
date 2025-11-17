<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'company',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the orders for the user.
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the user's completed orders.
     */
    public function completedOrders()
    {
        return $this->orders()->whereIn('status', ['completed', 'paid']);
    }

    /**
     * Get the user's pending orders.
     */
    public function pendingOrders()
    {
        return $this->orders()->where('status', 'pending');
    }

    /**
     * Get total amount spent by the user.
     */
    public function getTotalSpentAttribute()
    {
        return $this->completedOrders()->sum('total_amount');
    }

    /**
     * Get total number of orders.
     */
    public function getTotalOrdersAttribute()
    {
        return $this->orders()->count();
    }

    /**
     * Get the user's agent application.
     */
    public function agentApplication()
    {
        return $this->hasOne(AgentApplication::class);
    }

    /**
     * Get the user's agent.
     */
    public function agent()
    {
        return $this->hasOne(Agent::class);
    }

    /**
     * Check if user is an agent.
     */
    public function isAgent()
    {
        return $this->role === 'agent';
    }

    /**
     * Check if user has verified email.
     */
    public function hasVerifiedEmail()
    {
        return !is_null($this->email_verified_at);
    }

    /**
     * Get user's full display name.
     */
    public function getDisplayNameAttribute()
    {
        return $this->name ?: 'User #' . str_pad($this->id, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Scope a query to only include verified users.
     */
    public function scopeVerified($query)
    {
        return $query->whereNotNull('email_verified_at');
    }

    /**
     * Scope a query to only include users with orders.
     */
    public function scopeWithOrders($query)
    {
        return $query->has('orders');
    }
}
