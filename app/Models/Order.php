<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'agent_id',
        'order_reference',
        'payment_reference',
        'full_name',
        'email',
        'phone',
        'company',
        'notes',
        'total_amount',
        'currency',
        'status',
        'paid_at',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the user that owns the order
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all order items
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get order items with product details
     */
    public function itemsWithProducts()
    {
        return $this->hasMany(OrderItem::class)->with('product.category');
    }

    /**
     * Get the agent if assigned
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    /**
     * Scope: Get orders by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope: Get pending orders
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope: Get paid orders
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    /**
     * Scope: Get failed orders
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Check if order is paid
     */
    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    /**
     * Check if order is pending payment
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if payment can be processed
     */
    public function canPay(): bool
    {
        return $this->status === 'pending' && $this->total_amount > 0;
    }

    /**
     * Mark order as paid
     */
    public function markAsPaid(): bool
    {
        return $this->update([
            'status' => 'paid',
            'paid_at' => now()
        ]);
    }

    /**
     * Mark order as failed
     */
    public function markAsFailed(): bool
    {
        return $this->update([
            'status' => 'failed'
        ]);
    }

    /**
     * Mark order as cancelled
     */
    public function markAsCancelled(): bool
    {
        return $this->update([
            'status' => 'cancelled'
        ]);
    }

    /**
     * Generate unique order reference
     */
    public static function generateReference(): string
    {
        do {
            $reference = 'ORD-' . strtoupper(\Illuminate\Support\Str::random(8)) . '-' . time();
        } while (self::where('order_reference', $reference)->exists());

        return $reference;
    }
}