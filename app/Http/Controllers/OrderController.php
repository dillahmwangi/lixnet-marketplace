<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Services\PesapalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    protected $pesapalService;

    public function __construct(PesapalService $pesapalService)
    {
        $this->pesapalService = $pesapalService;
    }

    /**
     * Create order from checkout
     */
    public function store(Request $request)
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
                'total_amount' => 'required|numeric|min:0',
                'currency' => 'required|string|in:KES,USD',
                'payment_method' => 'nullable|string|in:pesapal'
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
                $orderReference = $this->generateOrderReference();

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
                    'payment_method' => $request->payment_method ?? 'pesapal',
                    'status' => 'pending',
                ]);

                // Create order items
                foreach ($request->items as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'line_total' => $item['quantity'] * $item['unit_price'],
                    ]);
                }

                // Clear user's cart after successful order creation
                Cart::where('user_id', Auth::id())->delete();

                DB::commit();

                // Load order with items and products for response
                $order->load(['items.product.category', 'user']);

                // Prepare payment data for Pesapal
                $paymentData = [
                    'id' => $order->order_reference,
                    'currency' => $order->currency,
                    'amount' => $order->total_amount,
                    'description' => "Payment for Order #{$order->order_reference}",
                    'callback_url' => config('app.url') . '/api/pesapal/confirm',
                    'redirect_mode' => 'PARENT_WINDOW',
                    'notification_id' => config('pesapal.notification_id'),
                    'billing_address' => [
                        'email_address' => $order->email,
                        'phone_number' => $order->phone,
                        'first_name' => explode(' ', $order->full_name)[0] ?? '',
                        'last_name' => explode(' ', $order->full_name, 2)[1] ?? '',
                    ]
                ];

                // Call Pesapal service to get payment URL
                $paymentResponse = $this->pesapalService->submitOrderRequest($paymentData);

                if (!$paymentResponse['success']) {
                    // For development/testing, return success with mock payment URL
                    if (config('app.debug') || config('pesapal.sandbox')) {
                        return response()->json([
                            'success' => true,
                            'message' => 'Order created successfully (Sandbox mode - payment simulation)',
                            'data' => [
                                'order' => $order,
                                'payment_url' => config('app.url') . '/orders?payment=success&order=' . $order->id,
                                'order_tracking_id' => 'SANDBOX-' . $order->order_reference
                            ]
                        ], 201);
                    }

                    return response()->json([
                        'success' => false,
                        'message' => 'Order created but payment initiation failed',
                        'error' => $paymentResponse['error'] ?? 'Payment service error',
                        'data' => [
                            'order' => $order
                        ]
                    ], 500);
                }

                // Update order with payment reference
                $order->update([
                    'payment_reference' => $paymentResponse['order_tracking_id']
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Order created and payment initiated successfully',
                    'data' => [
                        'order' => $order,
                        'payment_url' => $paymentResponse['redirect_url'],
                        'order_tracking_id' => $paymentResponse['order_tracking_id']
                    ]
                ], 201);
            } catch (\Exception $e) {
                DB::rollback();
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
    public function index(Request $request)
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
    public function show($id)
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
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
                'error' => config('app.debug') ? $e->getMessage() : 'Order not found'
            ], 404);
        }
    }

    /**
     * Initiate payment for order
     */
    public function initiatePayment($id)
    {
        try {
            $order = Order::where('user_id', Auth::id())
                ->findOrFail($id);

            // Check if order is in correct status
            if ($order->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Order cannot be paid. Invalid status: ' . $order->status
                ], 400);
            }

            // Prepare payment data for Pesapal
            $paymentData = [
                'id' => $order->order_reference,
                'currency' => $order->currency,
                'amount' => $order->total_amount,
                'description' => "Payment for Order #{$order->order_reference}",
                'callback_url' => config('app.url') . '/api/pesapal/confirm',
                'redirect_mode' => 'PARENT_WINDOW',
                'notification_id' => config('pesapal.notification_id'),
                'billing_address' => [
                    'email_address' => $order->email,
                    'phone_number' => $order->phone,
                    'first_name' => explode(' ', $order->full_name)[0] ?? '',
                    'last_name' => explode(' ', $order->full_name, 2)[1] ?? '',
                ]
            ];

            // Call Pesapal service to get payment URL
            $paymentResponse = $this->pesapalService->submitOrderRequest($paymentData);

            if (!$paymentResponse['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to initiate payment',
                    'error' => $paymentResponse['error'] ?? 'Payment service error'
                ], 500);
            }

            // Update order with payment reference
            $order->update([
                'payment_reference' => $paymentResponse['order_tracking_id']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment initiated successfully',
                'data' => [
                    'payment_url' => $paymentResponse['redirect_url'],
                    'order_tracking_id' => $paymentResponse['order_tracking_id']
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate payment',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Generate unique order reference
     */
    private function generateOrderReference(): string
    {
        do {
            $reference = 'ORD-' . strtoupper(Str::random(8)) . '-' . time();
        } while (Order::where('order_reference', $reference)->exists());

        return $reference;
    }
}
