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

            // DIAGNOSTIC: Log full transaction details
            Log::info('🔍 DIAGNOSTIC: Full transaction details from Pesapal', [
                'transaction_details' => $callbackResult['transaction_details'] ?? [],
                'payment_status_code' => $callbackResult['payment_status_code'] ?? null,
                'order_status_from_mapping' => $callbackResult['order_status'] ?? null
            ]);

            // Find the order using payment reference
            $order = Order::where('payment_reference', $callbackResult['order_tracking_id'])->first();

            if (!$order) {
                Log::error('Order not found for payment reference: ' . $callbackResult['order_tracking_id']);
                return response()->json(['error' => 'Order not found'], 404);
            }

            DB::beginTransaction();

            try {
                // Determine final order status
                // In sandbox, Pesapal often doesn't return proper status codes
                // So we'll check payment_status_description as a fallback
                $finalOrderStatus = $callbackResult['order_status'];
                
                // DIAGNOSTIC: Check alternative status indicators
                $transactionDetails = $callbackResult['transaction_details'] ?? [];
                $paymentStatusDescription = $transactionDetails['payment_status_description'] ?? '';
                
                Log::info('🔍 DIAGNOSTIC: Status indicators', [
                    'payment_status_code' => $callbackResult['payment_status_code'],
                    'payment_status_description' => $paymentStatusDescription,
                    'status_code' => $transactionDetails['status_code'] ?? null,
                    'message' => $transactionDetails['message'] ?? null,
                    'confirmation_code' => $transactionDetails['confirmation_code'] ?? null
                ]);

                // Fallback: If we have a confirmation code or certain status descriptions, consider it paid
                if (!empty($transactionDetails['confirmation_code']) || 
                    stripos($paymentStatusDescription, 'completed') !== false ||
                    stripos($paymentStatusDescription, 'paid') !== false) {
                    Log::info('🔍 DIAGNOSTIC: Detected payment completion via confirmation code or description');
                    $finalOrderStatus = 'paid';
                }

                // Update order status
                $updateData = [
                    'status' => $finalOrderStatus
                ];

                if ($finalOrderStatus === 'paid') {
                    $updateData['paid_at'] = now();
                }

                $order->update($updateData);

                Log::info('Order status updated from callback', [
                    'order_id' => $order->id,
                    'order_reference' => $order->order_reference,
                    'new_status' => $finalOrderStatus,
                    'payment_reference' => $callbackResult['order_tracking_id'],
                    'reason' => 'Callback processing'
                ]);

                // If payment was successful, create subscriptions for subscription products
                if ($finalOrderStatus === 'paid') {
                    Log::info('✅ Payment confirmed, creating subscriptions from order', [
                        'order_id' => $order->id
                    ]);
                    $this->createSubscriptionsFromOrder($order);
                } else {
                    Log::warning('⚠️ Payment not confirmed, subscriptions NOT created', [
                        'order_id' => $order->id,
                        'order_status' => $finalOrderStatus
                    ]);
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Callback processed successfully',
                    'order_status' => $finalOrderStatus
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
                $paymentStatusCode = $transactionStatus['payment_status_code'] ?? 0;
                $paymentStatusDescription = $transactionStatus['payment_status_description'] ?? '';
                $confirmationCode = $transactionStatus['confirmation_code'] ?? null;

                Log::info('🔍 DIAGNOSTIC: Confirmation page transaction status', [
                    'payment_status_code' => $paymentStatusCode,
                    'payment_status_description' => $paymentStatusDescription,
                    'confirmation_code' => $confirmationCode
                ]);

                $statusMapping = [
                    0 => 'pending',
                    1 => 'paid',
                    2 => 'failed',
                    3 => 'cancelled'
                ];

                $paymentStatusCode = $paymentStatusCode === '' || $paymentStatusCode === null ? 0 : (int)$paymentStatusCode;
                $newStatus = $statusMapping[$paymentStatusCode] ?? 'pending';

                // Fallback: Check confirmation code and description
                if (!empty($confirmationCode) || 
                    stripos($paymentStatusDescription, 'completed') !== false ||
                    stripos($paymentStatusDescription, 'paid') !== false) {
                    Log::info('🔍 DIAGNOSTIC: Detected payment completion via confirmation code or description on confirmation page');
                    $newStatus = 'paid';
                }

                Log::info('Updating order status from confirmation', [
                    'order_id' => $order->id,
                    'old_status' => $order->status,
                    'new_status' => $newStatus,
                    'reason' => 'Confirmation page redirect'
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
                            Log::info('✅ Payment confirmed on confirmation page, creating subscriptions from order', [
                                'order_id' => $order->id
                            ]);
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
            // Load order items with products
            $order->load('items.product');

            Log::info('📄 Creating subscriptions from order', [
                'order_id' => $order->id,
                'order_reference' => $order->order_reference,
                'user_id' => $order->user_id,
                'items_count' => $order->items->count()
            ]);

            foreach ($order->items as $item) {
                $product = $item->product;

                Log::info('Processing order item for subscription', [
                    'order_item_id' => $item->id,
                    'product_id' => $product->id,
                    'product_title' => $product->title,
                    'is_subscription' => $product->is_subscription,
                    'subscription_tier' => $item->subscription_tier,
                    'unit_price' => $item->unit_price
                ]);

                // Check if product is a subscription product
                if (!$product->is_subscription) {
                    Log::info('❌ Product is not a subscription, skipping', [
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
                    Log::info('⚠️ User already has active subscription for this product', [
                        'subscription_id' => $existingSubscription->id,
                        'product_id' => $product->id,
                        'existing_tier' => $existingSubscription->tier
                    ]);
                    continue;
                }

                // Get tier from order item (selected by user), default to basic
                $selectedTier = $item->subscription_tier ?? 'basic';
                
                Log::info('Getting tier price', [
                    'product_id' => $product->id,
                    'selected_tier' => $selectedTier,
                    'available_tiers' => $product->subscription_tiers
                ]);

                // Get tier price from product
                $tierPrice = $product->getTierPrice($selectedTier);

                if ($tierPrice === null) {
                    Log::error('❌ Tier price not found for selected tier', [
                        'product_id' => $product->id,
                        'product_title' => $product->title,
                        'selected_tier' => $selectedTier,
                        'available_tiers' => $product->subscription_tiers
                    ]);
                    continue;
                }

                Log::info('Creating subscription with selected tier', [
                    'user_id' => $order->user_id,
                    'product_id' => $product->id,
                    'tier' => $selectedTier,
                    'price' => $tierPrice,
                    'currency' => $order->currency
                ]);

                // Create subscription with the tier selected by user
                $subscription = Subscription::create([
                    'user_id' => $order->user_id,
                    'product_id' => $product->id,
                    'tier' => $selectedTier,
                    'status' => 'active',
                    'price' => $tierPrice,
                    'currency' => $order->currency,
                    'subscription_reference' => Subscription::generateReference(),
                    'payment_reference' => $order->payment_reference,
                    'started_at' => now(),
                    'next_billing_date' => now()->addMonth()
                ]);

                // Send subscription confirmation email
                try {
                    $this->subscriptionService->sendSubscriptionCreatedEmail($subscription);
                    Log::info('📧 Subscription confirmation email sent', [
                        'subscription_id' => $subscription->id
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to send subscription email: ' . $e->getMessage());
                }

                Log::info('✅ Subscription created successfully from order', [
                    'subscription_id' => $subscription->id,
                    'subscription_reference' => $subscription->subscription_reference,
                    'order_id' => $order->id,
                    'order_reference' => $order->order_reference,
                    'product_id' => $product->id,
                    'product_title' => $product->title,
                    'tier' => $selectedTier,
                    'price' => $tierPrice,
                    'user_id' => $order->user_id,
                    'started_at' => $subscription->started_at->format('Y-m-d H:i:s'),
                    'next_billing_date' => $subscription->next_billing_date->format('Y-m-d H:i:s')
                ]);
            }

            Log::info('✅ Finished creating subscriptions from order', [
                'order_id' => $order->id,
                'total_items_processed' => $order->items->count()
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Error creating subscriptions from order: ' . $e->getMessage(), [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}