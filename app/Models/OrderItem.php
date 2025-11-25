<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'unit_price',
        'line_total',
        'subscription_tier'
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'line_total' => 'decimal:2',
        'quantity' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the order that owns this item
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the product for this item
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Calculate line total automatically
     */
    protected static function booted()
    {
        static::saving(function ($model) {
            if ($model->unit_price && $model->quantity) {
                $model->line_total = $model->unit_price * $model->quantity;
            }
        });
    }

    /**
     * Get the subtotal with tax calculation (if applicable)
     */
    public function getSubtotalAttribute(): float
    {
        return (float) $this->unit_price * $this->quantity;
    }

    /**
     * Calculate total price for this item
     */
    public function getTotalPrice()
    {
        return $this->unit_price * $this->quantity;
    }

    /**
     * Check if this item is for a subscription product
     */
    public function isSubscriptionItem(): bool
    {
        return $this->product->is_subscription ?? false;
    }

    /**
     * Get subscription tier for this item
     */
    public function getSubscriptionTier(): ?string
    {
        return $this->subscription_tier;
    }
}