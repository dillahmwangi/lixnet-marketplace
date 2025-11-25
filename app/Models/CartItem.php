<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    protected $fillable = [
        'cart_id',
        'product_id',
        'quantity',
        'subscription_tier',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    /**
     * Get the cart that owns the cart item.
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * Get the product that belongs to the cart item.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Calculate the total price for this cart item.
     */
    public function getTotalPriceAttribute(): float
    {
        return $this->quantity * $this->product->price;
    }

    /**
     * Update the quantity of the cart item.
     */
    public function updateQuantity(int $quantity): bool
    {
        if ($quantity <= 0) {
            return $this->delete();
        }

        return $this->update(['quantity' => $quantity]);
    }

    /**
     * Update the subscription tier for this cart item.
     */
    public function updateSubscriptionTier(string $tier): bool
    {
        return $this->update(['subscription_tier' => $tier]);
    }

    /**
     * Get subscription tier (if any).
     */
    public function getSubscriptionTier(): ?string
    {
        return $this->subscription_tier;
    }

    /**
     * Check if this item is for a subscription product.
     */
    public function isSubscriptionItem(): bool
    {
        return $this->product->is_subscription ?? false;
    }
}