<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\PesapalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PesapalCallbackController extends Controller
{
    protected $pesapalService;

    public function __construct(PesapalService $pesapalService)
    {
        $this->pesapalService = $pesapalService;
    }

    /**
     * Handle Pesapal payment callback
     * POST /api/pesapal/callback
     */
    public function handleCallback(Request $request)
    {
        try {
            // Log the callback for debugging
            Log::info('Pesapal callback received', [
                'method' => $request->method(),
                'headers' => $request->headers->all(),
                'query' => $request->query(),
                'body' => $request->all()
            ]);

            // Get callback data - Pesapal can send data in query params or body
            $callbackData = $request->method() === 'GET' ? $request->query() : $request->all();

            if (!isset($callbackData['OrderTrackingId'])) {
                Log::error('Pesapal callback missing OrderTrackingId', $callbackData);
                return response()->json(['error' => 'Missing OrderTrackingId'], 400);
            }

            // Process the callback using Pesapal service
            $callbackResult = $this->pesapalService->processCallback($callbackData);

            if (!$callbackResult['success']) {
                Log::error('Failed to process Pesapal callback', $callbackResult);
                return response()->json(['error' => 'Callback processing failed'], 500);
            }

            // Find the order using payment reference (order tracking id)
            $order = Order::where('payment_reference', $callbackResult['order_tracking_id'])->first();

            if (!$order) {
                Log::error('Order not found for payment reference: ' . $callbackResult['order_tracking_id']);
                return response()->json(['error' => 'Order not found'], 404);
            }

            // Update order status based on payment result
            $updateData = [
                'status' => $callbackResult['order_status']
            ];

            // If payment was successful, add paid_at timestamp
            if ($callbackResult['order_status'] === 'paid') {
                $updateData['paid_at'] = now();
            }

            $order->update($updateData);

            Log::info('Order status updated from callback', [
                'order_id' => $order->id,
                'order_reference' => $order->order_reference,
                'old_status' => $order->getOriginal('status'),
                'new_status' => $callbackResult['order_status'],
                'payment_reference' => $callbackResult['order_tracking_id'],
                'payment_status_code' => $callbackResult['payment_status_code']
            ]);

            // Return success response to Pesapal
            return response()->json([
                'success' => true,
                'message' => 'Callback processed successfully',
                'order_status' => $callbackResult['order_status']
            ]);
        } catch (\Exception $e) {
            Log::error('Pesapal callback exception: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'error' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Handle payment confirmation page redirect
     * This is where users land after completing payment on Pesapal
     * GET /api/pesapal/confirm
     */
    public function confirmPayment(Request $request)
    {
        try {
            $orderTrackingId = $request->query('OrderTrackingId');
            $orderMerchantReference = $request->query('OrderMerchantReference');

            Log::info('Payment confirmation received', [
                'order_tracking_id' => $orderTrackingId,
                'merchant_reference' => $orderMerchantReference,
                'all_params' => $request->all()
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
                // Update order status if needed
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
                    'new_status' => $newStatus,
                    'payment_status_code' => $paymentStatusCode
                ]);

                if ($order->status !== $newStatus) {
                    $updateData = ['status' => $newStatus];
                    if ($newStatus === 'paid' && !$order->paid_at) {
                        $updateData['paid_at'] = now();
                    }
                    $order->update($updateData);
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
            Log::error('Payment confirmation exception: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return redirect(config('app.url') . '/checkout?payment=failed');
        }
    }
}