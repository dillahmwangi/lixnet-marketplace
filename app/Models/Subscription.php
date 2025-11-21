<?php
// File: app/Models/Subscription.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'product_id',
        'tier',
        'status',
        'price',
        'currency',
        'subscription_reference',
        'payment_reference',
        'started_at',
        'next_billing_date',
        'renewal_reminded_at',
        'cancelled_at',
        'expires_at',
        'cancellation_reason'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'started_at' => 'datetime',
        'next_billing_date' => 'datetime',
        'renewal_reminded_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isPaid(): bool
    {
        return $this->price == 0 || !is_null($this->payment_reference);
    }

    public function isExpiringSoon(int $days = 7): bool
    {
        return $this->next_billing_date->diffInDays(now()) <= $days && $this->status === 'active';
    }

    public function getDaysUntilRenewal(): int
    {
        return $this->next_billing_date->diffInDays(now());
    }

    public static function generateReference(): string
    {
        do {
            $reference = 'SUB-' . strtoupper(\Illuminate\Support\Str::random(8)) . '-' . time();
        } while (self::where('subscription_reference', $reference)->exists());

        return $reference;
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeExpiringSoon($query, int $days = 7)
    {
        return $query->where('status', 'active')
            ->whereDate('next_billing_date', '<=', now()->addDays($days))
            ->whereDate('next_billing_date', '>=', now());
    }

    public function scopeNeedsRenewal($query)
    {
        return $query->where('status', 'active')
            ->whereDate('next_billing_date', '<=', now());
    }
}