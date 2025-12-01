<?php
// File: app/Services/SSOTokenService.php

namespace App\Services;

use App\Models\User;
use App\Models\Subscription;
use App\Models\Product;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Log;
use Exception;

class SSOTokenService
{
    /**
     * Generate a short-lived SSO token for product access
     * 
     * @param User $user
     * @param string $productName (e.g., 'payroll', 'hr', 'accounting')
     * @param int $expirationSeconds (default 60 seconds)
     * @return string JWT token
     */
    public function generateProductAccessToken(
        User $user,
        string $productName,
        int $expirationSeconds = 60
    ): string {
        // Get product by name or ID
        $product = is_numeric($productName) 
            ? Product::find($productName)
            : Product::where('title', 'LIKE', "%{$productName}%")->first();

        if (!$product) {
            throw new Exception("Product '{$productName}' not found");
        }

        // Fetch user's subscription for this product
        $subscription = Subscription::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->where('status', 'active')
            ->first();

        // Determine subscription tier and features
        $tier = $subscription?->tier ?? 'free';
        $features = $this->getFeaturesToUnlock($product, $tier);

        // Build JWT payload
        $payload = [
            'user_id' => (int) $user->id,
            'email' => $user->email,
            'name' => $user->name,
            'product_id' => (int) $product->id,
            'product' => $product->title,
            'subscription_status' => $subscription ? 'active' : 'inactive',
            'tier' => $tier,
            'features' => $features,
            'iat' => now()->timestamp,
            'exp' => now()->addSeconds($expirationSeconds)->timestamp,
        ];

        // Sign the token using your app's secret key
        $token = JWT::encode(
            $payload,
            config('app.key'),
            'HS256'
        );

        Log::info('SSO Token Generated', [
            'user_id' => $user->id,
            'product' => $product->title,
            'tier' => $tier,
        ]);

        return $token;
    }

    /**
     * Get list of unlocked features based on tier
     * 
     * @param Product $product
     * @param string $tier
     * @return array
     */
    private function getFeaturesToUnlock(Product $product, string $tier): array
    {
        if (!$product->is_subscription || !$product->subscription_tiers) {
            return [];
        }

        $tiers = $product->subscription_tiers;
        
        if (isset($tiers[$tier]['features'])) {
            // If features is a string, split by pipe
            $features = $tiers[$tier]['features'];
            if (is_string($features)) {
                return array_map('trim', explode('|', $features));
            }
            return is_array($features) ? $features : [];
        }

        return [];
    }

    /**
     * Build the redirect URL to a product with SSO token
     * 
     * @param string $productDomain (e.g., 'http://localhost:8001')
     * @param string $token
     * @return string
     */
    public function buildProductRedirectUrl(string $productDomain, string $token): string
    {
        $baseUrl = rtrim($productDomain, '/');
        return $baseUrl . '/sso-auth?token=' . urlencode($token);
    }

    /**
     * Verify and decode a token
     * 
     * @param string $token
     * @return array|null
     */
    public function verifyAndDecodeToken(string $token): ?array
    {
        try {
            $decoded = JWT::decode(
                $token,
                new Key(config('app.key'), 'HS256')
            );

            return (array) $decoded;
        } catch (Exception $e) {
            Log::warning('Token verification failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Check if user has access to a product
     * 
     * @param User $user
     * @param int|string $productId
     * @return bool
     */
    public function userHasProductAccess(User $user, int|string $productId): bool
    {
        $product = is_numeric($productId) 
            ? Product::find($productId)
            : Product::where('title', 'LIKE', "%{$productId}%")->first();

        if (!$product) {
            return false;
        }

        // Check if user has active subscription
        $subscription = Subscription::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->where('status', 'active')
            ->exists();

        // Users can always access free tier
        return $subscription || true;
    }

    /**
     * Get user's subscription for a product
     * 
     * @param User $user
     * @param int|string $productId
     * @return Subscription|null
     */
    public function getUserSubscription(User $user, int|string $productId): ?Subscription
    {
        $product = is_numeric($productId) 
            ? Product::find($productId)
            : Product::where('title', 'LIKE', "%{$productId}%")->first();

        if (!$product) {
            return null;
        }

        return Subscription::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->where('status', 'active')
            ->first();
    }

    /**
     * Get product by ID or name
     * 
     * @param int|string $productId
     * @return Product|null
     */
    public function getProduct(int|string $productId): ?Product
    {
        return is_numeric($productId) 
            ? Product::find($productId)
            : Product::where('title', 'LIKE', "%{$productId}%")->first();
    }
}