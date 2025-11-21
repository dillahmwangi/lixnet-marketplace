<?php
// File: app/Models/Product.php
// ADD THESE TO YOUR EXISTING PRODUCT MODEL

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

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function subscriptionTiers(): array
    {
        if (!$this->is_subscription) {
            return [];
        }

        return $this->subscription_tiers ?? [
            'free' => ['price' => 0, 'features' => 'Basic features'],
            'basic' => ['price' => 500, 'features' => 'Standard features'],
            'premium' => ['price' => 1500, 'features' => 'All features']
        ];
    }

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
}