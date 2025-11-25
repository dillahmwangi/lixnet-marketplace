<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Subscription;
use App\Services\PesapalService;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class PesapalCallbackController extends Controller
{
    protected $pesapalService;
    protected $subscriptionService;

    public function __construct(
        PesapalService $pesapalService,
        SubscriptionService $subscriptionService
    ) {
        $this->pesapalService = $pesapalService;
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Handle Pesapal payment callback
     * POST /api/pesapal/callback
     */
    public function handleCallback(Request $request)
    {
        try {
            Log::info('Pesapal callback received', [
                'method' => $request->method(),
                'query' => $request->query(),
                'body' => $request->all()
            ]);

            // Get callback data
            $callbackData = $request->method() === 'GET' ? $request->query() : $request->all();

            if (!isset($callbackData['OrderTrackingId'])) {
                Log::error('Pesapal callback missing OrderTrackingId', $callbackData);
                return response()->json(['error' => 'Missing OrderTrackingId'], 400);
            }

            // Process the callback
            $callbackResult = $this->pesapalService->processCallback($callbackData);

            if (!$callbackResult['success']) {
                Log::error('Failed to process Pesapal callback', $callbackResult);
                return response()->json(['error' => 'Callback processing failed'], 500);
            }

            // Find the order using payment reference
            $order = Order::where('payment_reference', $callbackResult['order_tracking_id'])->first();

            if (!$order) {
                Log::error('Order not found for payment reference: ' . $callbackResult['order_tracking_id']);
                return response()->json(['error' => 'Order not found'], 404);
            }

            DB::beginTransaction();

            try {
                // Update order status
                $updateData = [
                    'status' => $callbackResult['order_status']
                ];

                if ($callbackResult['order_status'] === 'paid') {
                    $updateData['paid_at'] = now();
                }

                $order->update($updateData);

                Log::info('Order status updated from callback', [
                    'order_id' => $order->id,
                    'order_reference' => $order->order_reference,
                    'new_status' => $callbackResult['order_status'],
                    'payment_reference' => $callbackResult['order_tracking_id']
                ]);

                // If payment was successful, create subscriptions for subscription products
                if ($callbackResult['order_status'] === 'paid') {
                    $this->createSubscriptionsFromOrder($order);
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Callback processed successfully',
                    'order_status' => $callbackResult['order_status']
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error processing callback transaction: ' . $e->getMessage());
                throw $e;
            }
        } catch (\Exception $e) {
            Log::error('Pesapal callback exception: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Handle payment confirmation page redirect
     * GET /api/pesapal/confirm
     */
    public function confirmPayment(Request $request)
    {
        try {
            $orderTrackingId = $request->query('OrderTrackingId');
            $orderMerchantReference = $request->query('OrderMerchantReference');

            Log::info('Payment confirmation received', [
                'order_tracking_id' => $orderTrackingId,
                'merchant_reference' => $orderMerchantReference
            ]);

            if (!$orderTrackingId) {
                Log::warning('Confirmation missing OrderTrackingId');
                return redirect(config('app.url') . '/checkout?payment=failed');
            }

            // Find the order
            $order = Order::where('payment_reference', $orderTrackingId)->first();

            if (!$order) {
                Log::warning('Order not found during confirmation', ['order_tracking_id' => $orderTrackingId]);
                return redirect(config('app.url') . '/checkout?payment=failed');
            }

            // Get latest transaction status from Pesapal
            $transactionStatus = $this->pesapalService->getTransactionStatus($orderTrackingId);

            if ($transactionStatus['success']) {
                $statusMapping = [
                    0 => 'pending',
                    1 => 'paid',
                    2 => 'failed',
                    3 => 'cancelled'
                ];

                $paymentStatusCode = $transactionStatus['payment_status_code'] ?? 0;
                $newStatus = $statusMapping[$paymentStatusCode] ?? 'pending';

                Log::info('Updating order status from confirmation', [
                    'order_id' => $order->id,
                    'old_status' => $order->status,
                    'new_status' => $newStatus
                ]);

                DB::beginTransaction();

                try {
                    if ($order->status !== $newStatus) {
                        $updateData = ['status' => $newStatus];
                        if ($newStatus === 'paid' && !$order->paid_at) {
                            $updateData['paid_at'] = now();
                        }
                        $order->update($updateData);

                        // Create subscriptions if payment was successful
                        if ($newStatus === 'paid') {
                            $this->createSubscriptionsFromOrder($order);
                        }
                    }

                    DB::commit();
                } catch (\Exception $e) {
                    DB::rollBack();
                    Log::error('Error in confirmation transaction: ' . $e->getMessage());
                    throw $e;
                }
            }

            // Redirect to frontend with status
            $baseUrl = config('app.url');
            $redirectUrl = $baseUrl . '/orders/' . $order->id;

            if ($order->status === 'paid') {
                $redirectUrl .= '?payment=success';
            } elseif ($order->status === 'failed') {
                $redirectUrl .= '?payment=failed';
            } elseif ($order->status === 'cancelled') {
                $redirectUrl .= '?payment=cancelled';
            } else {
                $redirectUrl .= '?payment=pending';
            }

            Log::info('Redirecting user after payment confirmation', [
                'redirect_url' => $redirectUrl,
                'order_status' => $order->status
            ]);

            return redirect($redirectUrl);
        } catch (\Exception $e) {
            Log::error('Payment confirmation exception: ' . $e->getMessage());
            return redirect(config('app.url') . '/checkout?payment=failed');
        }
    }

    /**
     * Create subscriptions for subscription products in the order
     */
    private function createSubscriptionsFromOrder(Order $order): void
    {
        try {
            $order->load('items.product');

            foreach ($order->items as $item) {
                $product = $item->product;

                // Check if product is a subscription product
                if (!$product->is_subscription) {
                    Log::info('Product is not a subscription, skipping', [
                        'product_id' => $product->id,
                        'product_title' => $product->title
                    ]);
                    continue;
                }

                // Check if user already has an active subscription for this product
                $existingSubscription = Subscription::where('user_id', $order->user_id)
                    ->where('product_id', $product->id)
                    ->where('status', 'active')
                    ->first();

                if ($existingSubscription) {
                    Log::info('User already has active subscription for this product', [
                        'subscription_id' => $existingSubscription->id,
                        'product_id' => $product->id
                    ]);
                    continue;
                }

                // Get default tier (usually 'basic' or first available tier)
                $defaultTier = 'basic';
                $tierPrice = $product->getTierPrice($defaultTier);

                if ($tierPrice === null) {
                    Log::warning('Default tier not found for product', [
                        'product_id' => $product->id,
                        'default_tier' => $defaultTier
                    ]);
                    continue;
                }

                // Create subscription
                $subscription = Subscription::create([
                    'user_id' => $order->user_id,
                    'product_id' => $product->id,
                    'tier' => $defaultTier,
                    'status' => 'active',
                    'price' => $tierPrice,
                    'currency' => $order->currency,
                    'subscription_reference' => Subscription::generateReference(),
                    'payment_reference' => $order->payment_reference,
                    'started_at' => now(),
                    'next_billing_date' => now()->addMonth()
                ]);

                // Send subscription email
                $this->subscriptionService->sendSubscriptionCreatedEmail($subscription);

                Log::info('Subscription created from order', [
                    'subscription_id' => $subscription->id,
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'tier' => $defaultTier,
                    'user_id' => $order->user_id
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error creating subscriptions from order: ' . $e->getMessage(), [
                'order_id' => $order->id,
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}