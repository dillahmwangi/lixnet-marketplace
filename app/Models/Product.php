<?php
// File: app/Models/Product.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'title',
        'description',
        'price',
        'rating',
        'rating_count',
        'note',
        'image_path',
        'is_subscription',
        'subscription_tiers'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'rating' => 'decimal:1',
        'rating_count' => 'integer',
        'category_id' => 'integer',
        'is_subscription' => 'boolean',
        'subscription_tiers' => 'array',
    ];

    // CRITICAL FIX: Append subscription_tiers to JSON responses
    protected $appends = ['formatted_subscription_tiers'];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get formatted subscription tiers for JSON responses
     * This ensures subscription_tiers is always included in API responses
     */
    public function getFormattedSubscriptionTiersAttribute()
    {
        if (!$this->is_subscription) {
            return null;
        }

        // Return the subscription_tiers from database if exists
        if (!empty($this->subscription_tiers) && is_array($this->subscription_tiers)) {
            return $this->subscription_tiers;
        }

        // Fallback to default tiers if not set
        return [
            'free' => [
                'price' => 0,
                'features' => 'Basic features with limitations'
            ],
            'basic' => [
                'price' => $this->price,
                'features' => 'Standard features for small businesses'
            ],
            'premium' => [
                'price' => $this->price * 2,
                'features' => 'Advanced features for enterprises'
            ]
        ];
    }

    /**
     * Get subscription tiers as array (for internal use)
     */
    public function subscriptionTiers(): array
    {
        if (!$this->is_subscription) {
            return [];
        }

        return $this->subscription_tiers ?? [
            'free' => ['price' => 0, 'features' => 'Basic features'],
            'basic' => ['price' => $this->price, 'features' => 'Standard features'],
            'premium' => ['price' => $this->price * 2, 'features' => 'All features']
        ];
    }

    /**
     * Get price for a specific tier
     */
    public function getTierPrice(string $tier): ?float
    {
        $tiers = $this->subscriptionTiers();
        return isset($tiers[$tier]) ? (float) $tiers[$tier]['price'] : null;
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('title', 'LIKE', "%{$term}%")
                ->orWhere('description', 'LIKE', "%{$term}%");
        });
    }

    public function scopeByCategory($query, int $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function getFormattedPriceAttribute(): string
    {
        return 'KSh ' . number_format((float) $this->price, 0);
    }

    /**
     * Override toArray to ensure subscription_tiers is included
     */
    public function toArray()
    {
        $array = parent::toArray();
        
        // Rename formatted_subscription_tiers to subscription_tiers in output
        if (isset($array['formatted_subscription_tiers'])) {
            $array['subscription_tiers'] = $array['formatted_subscription_tiers'];
            unset($array['formatted_subscription_tiers']);
        }
        
        return $array;
    }
}