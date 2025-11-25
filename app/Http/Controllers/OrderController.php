<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Services\PesapalService;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
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
     * Initiate payment for order with payment method selection
     */
    public function initiatePayment($id, Request $request): JsonResponse
    {
        try {
            // Validate payment method if provided
            $validator = Validator::make($request->all(), [
                'payment_method' => 'nullable|in:CARD,MPESA,BANK_TRANSFER'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid payment method',
                    'errors' => $validator->errors()
                ], 422);
            }

            Log::info('Initiating payment for order', [
                'order_id' => $id,
                'user_id' => Auth::id(),
                'payment_method' => $request->input('payment_method')
            ]);

            $order = Order::where('user_id', Auth::id())
                ->with('items.product')
                ->findOrFail($id);

            // Check if order can be paid
            if (!$order->canPay()) {
                Log::warning('Order cannot be paid', [
                    'order_id' => $order->id,
                    'status' => $order->status,
                    'amount' => $order->total_amount
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Order cannot be paid. Invalid status: ' . $order->status
                ], 400);
            }

            // Determine redirect mode based on payment method
            $paymentMethod = $request->input('payment_method', 'CARD');
            $redirectMode = $this->getRedirectModeForPaymentMethod($paymentMethod);

            // Prepare payment data for Pesapal
            $paymentData = [
                'id' => $order->order_reference,
                'currency' => $order->currency,
                'amount' => (float)$order->total_amount,
                'description' => "Payment for Order #{$order->order_reference}",
                'callback_url' => config('pesapal.callback_url'),
                'billing_address' => [
                    'email_address' => $order->email,
                    'phone_number' => $order->phone,
                    'first_name' => explode(' ', $order->full_name)[0] ?? '',
                    'last_name' => explode(' ', $order->full_name, 2)[1] ?? '',
                ]
            ];

            // Add payment method if stored in order
            if ($order->payment_method) {
                $paymentData['payment_method'] = $order->payment_method;
            }

            Log::info('Submitting order to PesaPal', [
                'order_id' => $order->id,
                'amount' => $order->total_amount,
                'currency' => $order->currency,
                'payment_method' => $paymentMethod,
                'redirect_mode' => $redirectMode
            ]);

            // Call Pesapal service to get payment URL
            $paymentResponse = $this->pesapalService->submitOrderRequest($paymentData);

            if (!$paymentResponse['success']) {
                Log::error('Failed to get payment URL from Pesapal', $paymentResponse);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to initiate payment',
                    'error' => $paymentResponse['error'] ?? 'Payment service error'
                ], 500);
            }

            // Update order with payment reference
            $order->update([
                'payment_reference' => $paymentResponse['order_tracking_id'],
                'payment_method' => $paymentMethod
            ]);

            Log::info('Payment initiated successfully', [
                'order_id' => $order->id,
                'order_tracking_id' => $paymentResponse['order_tracking_id'],
                'payment_method' => $paymentMethod
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment initiated successfully',
                'data' => [
                    'payment_url' => $paymentResponse['redirect_url'],
                    'order_tracking_id' => $paymentResponse['order_tracking_id'],
                    'payment_method' => $paymentMethod
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error initiating payment: ' . $e->getMessage(), [
                'exception' => $e
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate payment',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Map payment method to Pesapal redirect mode
     */
    protected function getRedirectModeForPaymentMethod(string $paymentMethod): string
    {
        $redirectModes = [
            'MPESA' => 'MPESA',
            'CARD' => 'CARD',
            'BANK_TRANSFER' => 'BANK_TRANSFER',
            'AIRTEL' => 'AIRTEL',
            'EQUITY' => 'EQUITY'
        ];

        return $redirectModes[$paymentMethod] ?? 'DEFAULT';
    }

    /**
     * Create order from checkout
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:20',
                'company' => 'nullable|string|max:255',
                'notes' => 'nullable|string|max:1000',
                'items' => 'required|array|min:1',
                'items.*.product_id' => 'required|exists:products,id',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.unit_price' => 'required|numeric|min:0',
                'items.*.subscription_tier' => 'nullable|string|in:free,basic,premium',
                'total_amount' => 'required|numeric|min:0',
                'currency' => 'required|string|in:KES,USD'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            try {
                // Generate unique order reference
                $orderReference = Order::generateReference();

                // Create order
                $order = Order::create([
                    'user_id' => Auth::id(),
                    'order_reference' => $orderReference,
                    'full_name' => $request->full_name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'company' => $request->company,
                    'notes' => $request->notes,
                    'total_amount' => $request->total_amount,
                    'currency' => $request->currency ?? 'KES',
                    'status' => 'pending',
                    'payment_method' => $request->payment_method ?? null,
                ]);

                // Create order items with subscription tier
                foreach ($request->items as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'line_total' => $item['quantity'] * $item['unit_price'],
                        'subscription_tier' => $item['subscription_tier'] ?? null,
                    ]);
                }

                // Clear user's cart after successful order creation
                Cart::where('user_id', Auth::id())->delete();

                DB::commit();

                // Load order with items and products for response
                $order->load(['items.product.category', 'user']);

                Log::info('Order created successfully', [
                    'order_id' => $order->id,
                    'order_reference' => $order->order_reference,
                    'user_id' => Auth::id(),
                    'items_count' => count($request->items)
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Order created successfully',
                    'data' => [
                        'order' => $order
                    ]
                ], 201);
            } catch (\Exception $e) {
                DB::rollback();
                Log::error('Error creating order items: ' . $e->getMessage());
                throw $e;
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Get user's orders
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 15);
            $status = $request->get('status');

            $query = Order::where('user_id', Auth::id())
                ->with(['items.product.category'])
                ->orderBy('created_at', 'desc');

            if ($status) {
                $query->where('status', $status);
            }

            $orders = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Orders retrieved successfully',
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving orders: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve orders',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Get single order
     */
    public function show($id): JsonResponse
    {
        try {
            $order = Order::where('user_id', Auth::id())
                ->with(['items.product.category', 'user'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Order retrieved successfully',
                'data' => [
                    'order' => $order
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving order: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
                'error' => config('app.debug') ? $e->getMessage() : 'Order not found'
            ], 404);
        }
    }

    /**
     * Get order by order reference
     */
    public function getByReference($reference): JsonResponse
    {
        try {
            $order = Order::where('order_reference', $reference)
                ->with(['items.product.category', 'user'])
                ->firstOrFail();

            // Check if user owns the order
            if ($order->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'message' => 'Order retrieved successfully',
                'data' => ['order' => $order]
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving order by reference: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }
    }

    /**
     * Create subscriptions from a paid order
     * This is called by PesapalCallbackController after payment confirmation
     */
    public function createSubscriptionsFromOrder(Order $order): void
    {
        try {
            $order->load('items.product');

            foreach ($order->items as $item) {
                $product = $item->product;

                // Skip if not a subscription product
                if (!$product->is_subscription) {
                    Log::info('Product is not a subscription, skipping', [
                        'product_id' => $product->id,
                        'product_title' => $product->title
                    ]);
                    continue;
                }

                // Check if user already has active subscription
                $existingSubscription = \App\Models\Subscription::where('user_id', $order->user_id)
                    ->where('product_id', $product->id)
                    ->where('status', 'active')
                    ->first();

                if ($existingSubscription) {
                    Log::info('User already has active subscription', [
                        'subscription_id' => $existingSubscription->id,
                        'product_id' => $product->id
                    ]);
                    continue;
                }

                // Use selected tier or default to basic
                $tier = $item->subscription_tier ?? 'basic';
                $tierPrice = $product->getTierPrice($tier);

                if ($tierPrice === null) {
                    Log::warning('Tier not found for product', [
                        'product_id' => $product->id,
                        'tier' => $tier
                    ]);
                    continue;
                }

                // Create subscription
                $subscription = \App\Models\Subscription::create([
                    'user_id' => $order->user_id,
                    'product_id' => $product->id,
                    'tier' => $tier,
                    'status' => 'active',
                    'price' => $tierPrice,
                    'currency' => $order->currency,
                    'subscription_reference' => \App\Models\Subscription::generateReference(),
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
                    'tier' => $tier,
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