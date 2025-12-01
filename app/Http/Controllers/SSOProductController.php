<?php
// File: app/Http/Controllers/SSOProductController.php

namespace App\Http\Controllers;

use App\Services\SSOTokenService;
use App\Models\Product;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SSOProductController extends Controller
{
    protected $ssoTokenService;

    public function __construct(SSOTokenService $ssoTokenService)
    {
        $this->ssoTokenService = $ssoTokenService;
    }

    /**
     * Redirect user to a product with SSO token
     * 
     * GET/POST /api/sso/redirect/{productId}
     * 
     * @param Request $request
     * @param int $productId
     * @return RedirectResponse|JsonResponse
     */
    public function redirectToProduct(Request $request, int $productId): RedirectResponse|JsonResponse
    {
        try {
            $user = Auth::user();

            // Get product
            $product = Product::findOrFail($productId);

            // Verify user has access to this product
            if (!$this->ssoTokenService->userHasProductAccess($user, $productId)) {
                return $this->respondError(
                    'You do not have access to this product. Please subscribe first.',
                    403
                );
            }

            // Generate short-lived token (60 seconds)
            $token = $this->ssoTokenService->generateProductAccessToken(
                $user,
                $product->title,
                60
            );

            // Get product domain from config
            $productDomain = config("sso.products.{$productId}") 
                ?? env("PRODUCT_{$productId}_URL");

            if (!$productDomain) {
                // For localhost testing, use default
                $productDomain = "http://localhost:8001";
            }

            // Build redirect URL
            $redirectUrl = $this->ssoTokenService->buildProductRedirectUrl(
                $productDomain,
                $token
            );

            // Log the redirect
            Log::info('SSO Redirect', [
                'user_id' => $user->id,
                'product_id' => $productId,
                'product' => $product->title,
                'tier' => $this->ssoTokenService->getUserSubscription($user, $productId)?->tier ?? 'free',
                'redirect_url' => $redirectUrl,
            ]);

            // If requesting JSON response (for SPA frontend)
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'redirect_url' => $redirectUrl,
                    'product' => [
                        'id' => $product->id,
                        'title' => $product->title,
                    ],
                    'message' => "Redirecting to {$product->title}..."
                ]);
            }

            // Otherwise, perform HTTP redirect
            return redirect($redirectUrl);

        } catch (\Exception $e) {
            Log::error('SSO Redirect Error', [
                'product_id' => $productId,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->respondError(
                'Failed to access product. ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * Get available subscription products for authenticated user
     * 
     * GET /api/sso/available-products
     * 
     * @return JsonResponse
     */
    public function getAvailableProducts(): JsonResponse
    {
        try {
            $user = Auth::user();

            // Get all subscription products
            $products = Product::where('is_subscription', true)
                ->get()
                ->map(function ($product) use ($user) {
                    $subscription = Subscription::where('user_id', $user->id)
                        ->where('product_id', $product->id)
                        ->where('status', 'active')
                        ->first();

                    return [
                        'id' => $product->id,
                        'title' => $product->title,
                        'description' => $product->description,
                        'category' => $product->category?->name,
                        'rating' => $product->rating,
                        'rating_count' => $product->rating_count,
                        'has_subscription' => (bool) $subscription,
                        'tier' => $subscription?->tier ?? 'free',
                        'subscription_status' => $subscription?->status ?? 'inactive',
                        'subscription_id' => $subscription?->id,
                        'expires_at' => $subscription?->next_billing_date,
                        'available_tiers' => $product->subscription_tiers ?? [],
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $products,
                'count' => $products->count(),
            ]);

        } catch (\Exception $e) {
            Log::error('Get Available Products Error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve products',
            ], 500);
        }
    }

    /**
     * Get user's current subscriptions
     * 
     * GET /api/sso/my-subscriptions
     * 
     * @return JsonResponse
     */
    public function getMySubscriptions(): JsonResponse
    {
        try {
            $user = Auth::user();

            $subscriptions = Subscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->with('product')
                ->get()
                ->map(function ($subscription) {
                    return [
                        'id' => $subscription->id,
                        'product_id' => $subscription->product_id,
                        'product_title' => $subscription->product?->title,
                        'tier' => $subscription->tier,
                        'status' => $subscription->status,
                        'started_at' => $subscription->started_at,
                        'next_billing_date' => $subscription->next_billing_date,
                        'days_until_renewal' => $subscription->next_billing_date?->diffInDays(now()),
                        'is_expiring_soon' => $subscription->isExpiringSoon(7),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $subscriptions,
                'count' => $subscriptions->count(),
            ]);

        } catch (\Exception $e) {
            Log::error('Get My Subscriptions Error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve subscriptions',
            ], 500);
        }
    }

    /**
     * Validate an SSO token
     * Can be called by external products to verify tokens
     * 
     * POST /api/sso/validate-token
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function validateToken(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'token' => 'required|string'
            ]);

            $decoded = $this->ssoTokenService->verifyAndDecodeToken($request->token);

            if (!$decoded) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token is invalid or expired',
                ], 401);
            }

            Log::info('Token Validated', [
                'user_id' => $decoded['user_id'] ?? null,
                'product' => $decoded['product'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'data' => $decoded,
                'message' => 'Token is valid',
            ]);

        } catch (\Exception $e) {
            Log::error('Token Validation Error', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
            ], 500);
        }
    }

    /**
     * Simulate SSO login from external product (for localhost testing)
     * 
     * GET /sso-auth?token=JWT_TOKEN
     * This simulates what an external product would do
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function handleSSOLogin(Request $request): JsonResponse
    {
        try {
            $token = $request->query('token');

            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'No token provided',
                ], 400);
            }

            // Verify token
            $decoded = $this->ssoTokenService->verifyAndDecodeToken($token);

            if (!$decoded) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired token',
                ], 401);
            }

            Log::info('SSO Login Successful', [
                'user_id' => $decoded['user_id'],
                'product' => $decoded['product'],
                'tier' => $decoded['tier'],
            ]);

            return response()->json([
                'success' => true,
                'data' => $decoded,
                'message' => 'SSO authentication successful',
            ]);

        } catch (\Exception $e) {
            Log::error('SSO Login Error', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Authentication failed',
            ], 500);
        }
    }

    /**
     * Get product details with subscription info
     * 
     * GET /api/sso/product/{productId}
     * 
     * @param int $productId
     * @return JsonResponse
     */
    public function getProductDetails(int $productId): JsonResponse
    {
        try {
            $user = Auth::user();
            $product = Product::findOrFail($productId);

            $subscription = Subscription::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->where('status', 'active')
                ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $product->id,
                    'title' => $product->title,
                    'description' => $product->description,
                    'category' => $product->category?->name,
                    'rating' => $product->rating,
                    'rating_count' => $product->rating_count,
                    'subscription_tiers' => $product->subscription_tiers,
                    'user_subscription' => $subscription ? [
                        'id' => $subscription->id,
                        'tier' => $subscription->tier,
                        'status' => $subscription->status,
                        'started_at' => $subscription->started_at,
                        'next_billing_date' => $subscription->next_billing_date,
                    ] : null,
                    'user_tier' => $subscription?->tier ?? 'free',
                    'has_access' => $this->ssoTokenService->userHasProductAccess($user, $productId),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Get Product Details Error', [
                'product_id' => $productId,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }
    }

    /**
     * Helper: Standardized error response
     * 
     * @param string $message
     * @param int $statusCode
     * @return JsonResponse
     */
    private function respondError(string $message, int $statusCode = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], $statusCode);
    }
}