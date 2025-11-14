<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class PesapalService
{
    protected $baseUrl;
    protected $consumerKey;
    protected $consumerSecret;

    public function __construct()
    {
        $this->baseUrl = config('pesapal.base_url');
        $this->consumerKey = config('pesapal.consumer_key');
        $this->consumerSecret = config('pesapal.consumer_secret');
    }

    /**
     * Get access token from Pesapal
     */
    public function getAccessToken(): ?string
    {
        try {
            // Check if token exists in cache
            $cachedToken = Cache::get('pesapal_access_token');
            if ($cachedToken) {
                return $cachedToken;
            }

            // Check if credentials are set
            if (!$this->consumerKey || !$this->consumerSecret ||
                $this->consumerKey === 'your_consumer_key_here' ||
                $this->consumerSecret === 'your_consumer_secret_here') {
                Log::error('Pesapal credentials not configured properly');
                return null;
            }

            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json'
            ])->post($this->baseUrl . '/api/Auth/RequestToken', [
                'consumer_key' => $this->consumerKey,
                'consumer_secret' => $this->consumerSecret
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $token = $data['token'];
                $expiryDate = $data['expiryDate'];

                // Cache token until it expires (minus 5 minutes for safety)
                $expiryTime = strtotime($expiryDate) - 300;
                $cacheMinutes = ($expiryTime - time()) / 60;

                Cache::put('pesapal_access_token', $token, $cacheMinutes);

                return $token;
            }

            Log::error('Pesapal token request failed', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Pesapal token request exception: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Register IPN URL with Pesapal
     */
    public function registerIPN(): array
    {
        try {
            $token = $this->getAccessToken();
            if (!$token) {
                return ['success' => false, 'error' => 'Failed to get access token'];
            }

            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $token
            ])->post($this->baseUrl . '/api/URLSetup/RegisterIPN', [
                'url' => config('app.url') . '/api/pesapal/callback',
                'ipn_notification_type' => 'GET'
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'notification_id' => $data['ipn_id'],
                    'url' => $data['url']
                ];
            }

            return [
                'success' => false,
                'error' => 'Failed to register IPN: ' . $response->body()
            ];
        } catch (\Exception $e) {
            Log::error('Pesapal IPN registration exception: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Submit order request to Pesapal
     */
    public function submitOrderRequest(array $orderData): array
    {
        try {
            $token = $this->getAccessToken();
            if (!$token) {
                return ['success' => false, 'error' => 'Failed to get access token'];
            }

            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $token
            ])->post($this->baseUrl . '/api/Transactions/SubmitOrderRequest', $orderData);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'order_tracking_id' => $data['order_tracking_id'],
                    'merchant_reference' => $data['merchant_reference'],
                    'redirect_url' => $data['redirect_url']
                ];
            }

            Log::error('Pesapal order request failed', [
                'status' => $response->status(),
                'response' => $response->body(),
                'order_data' => $orderData
            ]);

            return [
                'success' => false,
                'error' => 'Failed to submit order: ' . $response->body()
            ];
        } catch (\Exception $e) {
            Log::error('Pesapal order request exception: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get transaction status from Pesapal
     */
    public function getTransactionStatus(string $orderTrackingId): array
    {
        try {
            $token = $this->getAccessToken();
            if (!$token) {
                return ['success' => false, 'error' => 'Failed to get access token'];
            }

            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $token
            ])->get($this->baseUrl . '/api/Transactions/GetTransactionStatus', [
                'orderTrackingId' => $orderTrackingId
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'payment_method' => $data['payment_method'] ?? null,
                    'amount' => $data['amount'] ?? null,
                    'created_date' => $data['created_date'] ?? null,
                    'confirmation_code' => $data['confirmation_code'] ?? null,
                    'payment_status_description' => $data['payment_status_description'] ?? null,
                    'description' => $data['description'] ?? null,
                    'message' => $data['message'] ?? null,
                    'payment_account' => $data['payment_account'] ?? null,
                    'call_back_url' => $data['call_back_url'] ?? null,
                    'status_code' => $data['status_code'] ?? null,
                    'merchant_reference' => $data['merchant_reference'] ?? null,
                    'payment_status_code' => $data['payment_status_code'] ?? null,
                    'currency' => $data['currency'] ?? null
                ];
            }

            return [
                'success' => false,
                'error' => 'Failed to get transaction status: ' . $response->body()
            ];
        } catch (\Exception $e) {
            Log::error('Pesapal transaction status exception: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Process payment callback from Pesapal
     */
    public function processCallback(array $callbackData): array
    {
        try {
            if (!isset($callbackData['OrderTrackingId'])) {
                return ['success' => false, 'error' => 'Missing OrderTrackingId'];
            }

            $transactionStatus = $this->getTransactionStatus($callbackData['OrderTrackingId']);

            if (!$transactionStatus['success']) {
                return ['success' => false, 'error' => 'Failed to get transaction status'];
            }

            // Map Pesapal status codes to our order statuses
            $statusMapping = [
                0 => 'pending',    // PENDING
                1 => 'paid',       // COMPLETED/PAID
                2 => 'failed',     // FAILED
                3 => 'cancelled'   // REVERSED/CANCELLED
            ];

            $paymentStatusCode = $transactionStatus['payment_status_code'] ?? 0;
            $orderStatus = $statusMapping[$paymentStatusCode] ?? 'pending';

            return [
                'success' => true,
                'order_tracking_id' => $callbackData['OrderTrackingId'],
                'order_status' => $orderStatus,
                'payment_status_code' => $paymentStatusCode,
                'transaction_details' => $transactionStatus
            ];
        } catch (\Exception $e) {
            Log::error('Pesapal callback processing exception: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}
