<?php
// File: app/Http/Controllers/SubscriptionController.php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\Product;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class SubscriptionController extends Controller
{
    protected $subscriptionService;

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Get available subscription tiers for a product
     */
    public function getTiers($productId): JsonResponse
    {
        try {
            $product = Product::where('is_subscription', true)->findOrFail($productId);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'product' => $product,
                    'tiers' => $product->subscriptionTiers()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving subscription tiers: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Product not found or is not a subscription product'
            ], 404);
        }
    }

    /**
     * Create and initiate payment for a subscription
     */
    public function subscribe(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'product_id' => 'required|exists:products,id',
                'tier' => 'required|string|in:free,basic,premium'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $product = Product::where('is_subscription', true)
                ->findOrFail($request->product_id);

            $existing = Subscription::where('user_id', Auth::id())
                ->where('product_id', $request->product_id)
                ->where('status', 'active')
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'You already have an active subscription to this product',
                    'existing_subscription' => $existing
                ], 409);
            }

            $subscription = $this->subscriptionService->createSubscription(
                Auth::id(),
                $request->product_id,
                $request->tier
            );

            if (!$subscription) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create subscription'
                ], 500);
            }

            $paymentResult = $this->subscriptionService->initiateSubscriptionPayment($subscription);

            if (!$paymentResult['success']) {
                $subscription->delete();
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to initiate payment',
                    'error' => $paymentResult['error'] ?? 'Payment error'
                ], 500);
            }

            $this->subscriptionService->sendSubscriptionCreatedEmail($subscription);

            if ($subscription->price == 0) {
                return response()->json([
                    'success' => true,
                    'message' => 'Subscription activated successfully',
                    'data' => [
                        'subscription' => $subscription
                    ]
                ], 201);
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment initiated',
                'data' => [
                    'subscription' => $subscription,
                    'payment_url' => $paymentResult['payment_url'],
                    'order_tracking_id' => $paymentResult['order_tracking_id']
                ]
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error subscribing: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create subscription',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Get user's subscriptions
     */
    public function getUserSubscriptions(Request $request): JsonResponse
    {
        try {
            $status = $request->get('status', 'active');
            $subscriptions = Subscription::where('user_id', Auth::id())
                ->where('status', $status)
                ->with(['product', 'user'])
                ->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $subscriptions
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving subscriptions: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve subscriptions'
            ], 500);
        }
    }

    /**
     * Get single subscription details
     */
    public function show($id): JsonResponse
    {
        try {
            $subscription = Subscription::where('id', $id)
                ->where('user_id', Auth::id())
                ->with(['product', 'user'])
                ->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => [
                    'subscription' => $subscription,
                    'days_until_renewal' => $subscription->getDaysUntilRenewal(),
                    'is_expiring_soon' => $subscription->isExpiringSoon(),
                    'renewal_date' => $subscription->next_billing_date->format('Y-m-d H:i:s')
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving subscription: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Subscription not found'
            ], 404);
        }
    }

    /**
     * Cancel a subscription
     */
    public function cancel(Request $request, $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'reason' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $subscription = Subscription::where('id', $id)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            if (!$subscription->isActive()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only active subscriptions can be cancelled'
                ], 400);
            }

            $this->subscriptionService->cancelSubscription(
                $subscription,
                $request->input('reason', '')
            );

            return response()->json([
                'success' => true,
                'message' => 'Subscription cancelled successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error cancelling subscription: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel subscription'
            ], 500);
        }
    }

    /**
     * Upgrade/Downgrade subscription tier
     */
    public function changeTier(Request $request, $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'tier' => 'required|string|in:free,basic,premium'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $subscription = Subscription::where('id', $id)
                ->where('user_id', Auth::id())
                ->with('product')
                ->firstOrFail();

            if (!$subscription->isActive()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only active subscriptions can be changed'
                ], 400);
            }

            $newTier = $request->input('tier');
            $newPrice = $subscription->product->getTierPrice($newTier);

            if ($newPrice === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid tier selected'
                ], 400);
            }

            if ($subscription->tier === $newTier) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are already subscribed to this tier'
                ], 400);
            }

            // Cancel old subscription
            $subscription->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancellation_reason' => "Upgraded/Downgraded to {$newTier} tier"
            ]);

            // Create new subscription with new tier
            $newSubscription = $this->subscriptionService->createSubscription(
                Auth::id(),
                $subscription->product_id,
                $newTier
            );

            if (!$newSubscription) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to change subscription tier'
                ], 500);
            }

            // Initiate payment for new tier if different price
            $paymentResult = $this->subscriptionService->initiateSubscriptionPayment($newSubscription);

            if (!$paymentResult['success'] && $newPrice > 0) {
                $newSubscription->delete();
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to process payment for new tier',
                    'error' => $paymentResult['error'] ?? 'Payment error'
                ], 500);
            }

            $this->subscriptionService->sendSubscriptionCreatedEmail($newSubscription);

            return response()->json([
                'success' => true,
                'message' => 'Subscription tier changed successfully',
                'data' => [
                    'old_subscription' => $subscription,
                    'new_subscription' => $newSubscription,
                    'payment_url' => $paymentResult['payment_url'] ?? null
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error changing subscription tier: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to change subscription tier',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }
}