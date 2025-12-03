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
    protected $notificationId;

    public function __construct()
    {
        $this->baseUrl = config('pesapal.base_url');
        $this->consumerKey = config('pesapal.consumer_key');
        $this->consumerSecret = config('pesapal.consumer_secret');
        $this->notificationId = config('pesapal.notification_id');
    }

    /**
     * Get access token from Pesapal
     */
    public function getAccessToken(): ?string
    {
        try {
            // Check if token exists in cache (tokens expire quickly)
            $cachedToken = Cache::get('pesapal_access_token');
            if ($cachedToken) {
                Log::info('Using cached Pesapal access token');
                return $cachedToken;
            }

            Log::info('Requesting new Pesapal access token');

            $response = Http::withoutVerifying()
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json'
                ])->post($this->baseUrl . 'Auth/RequestToken', [
                    'consumer_key' => $this->consumerKey,
                    'consumer_secret' => $this->consumerSecret
                ]);

            Log::info('Pesapal token response status: ' . $response->status());

            if ($response->successful()) {
                $data = $response->json();
                $token = $data['token'] ?? null;
                $expiryDate = $data['expiryDate'] ?? null;

                if (!$token) {
                    Log::error('No token in Pesapal response', $data);
                    return null;
                }

                // Cache token with expiry (default 1 hour)
                $cacheMinutes = 50; // Cache for 50 minutes
                if ($expiryDate) {
                    try {
                        $expiryTime = strtotime($expiryDate) - 300; // 5 min buffer
                        $cacheMinutes = max(1, ($expiryTime - time()) / 60);
                    } catch (\Exception $e) {
                        Log::warning('Could not parse token expiry date: ' . $expiryDate);
                    }
                }

                Cache::put('pesapal_access_token', $token, $cacheMinutes * 60);
                Log::info('Pesapal access token cached for ' . $cacheMinutes . ' minutes');

                return $token;
            }

            Log::error('Pesapal token request failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Pesapal token request exception: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            return null;
        }
    }

    /**
     * Submit order request to Pesapal
     * Sends two URLs:
     * - callback_url: Where Pesapal redirects USER (browser)
     * - notification_id: Where Pesapal sends IPN notifications (backend)
     */
    public function submitOrderRequest(array $orderData): array
    {
        try {
            Log::info('Submitting order to Pesapal', [
                'order_id' => $orderData['id'] ?? null,
                'amount' => $orderData['amount'] ?? null
            ]);

            $token = $this->getAccessToken();
            if (!$token) {
                Log::error('Failed to get access token for order submission');
                return [
                    'success' => false,
                    'error' => 'Failed to authenticate with Pesapal'
                ];
            }

            // Build the callback URL - This is where Pesapal redirects the USER
            // After payment, user's browser is redirected to this URL
            $callbackUrl = config('app.url') . '/api/pesapal/callback';

            // Prepare the payload
            $payload = [
                'id' => $orderData['id'],
                'currency' => $orderData['currency'] ?? 'KES',
                'amount' => (float)$orderData['amount'],
                'description' => $orderData['description'] ?? 'Payment for order',
                'callback_url' => $callbackUrl,  // User browser redirect URL
                'redirect_mode' => $orderData['redirect_mode'] ?? config('pesapal.redirect_mode'),
                'notification_id' => $this->notificationId,  // IPN webhook notification ID
            ];

            // Add billing address if provided
            if (!empty($orderData['billing_address'])) {
                $payload['billing_address'] = $orderData['billing_address'];
            }

            Log::info('Pesapal order request payload', [
                'callback_url' => $callbackUrl,
                'notification_id' => $this->notificationId,
                'amount' => $payload['amount'],
                'currency' => $payload['currency']
            ]);

            $response = Http::withoutVerifying()
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $token
                ])->post($this->baseUrl . 'Transactions/SubmitOrderRequest', $payload);

            Log::info('Pesapal submit order response status: ' . $response->status());
            Log::info('Pesapal submit order response', $response->json());

            if ($response->successful()) {
                $data = $response->json();
                
                if (empty($data['order_tracking_id']) || empty($data['redirect_url'])) {
                    Log::error('Pesapal response missing required fields', $data);
                    return [
                        'success' => false,
                        'error' => 'Invalid response from Pesapal'
                    ];
                }

                return [
                    'success' => true,
                    'order_tracking_id' => $data['order_tracking_id'],
                    'merchant_reference' => $data['merchant_reference'] ?? null,
                    'redirect_url' => $data['redirect_url']
                ];
            }

            $errorBody = $response->body();
            Log::error('Pesapal order submission failed', [
                'status' => $response->status(),
                'body' => $errorBody
            ]);

            return [
                'success' => false,
                'error' => 'Failed to submit order: ' . $errorBody
            ];
        } catch (\Exception $e) {
            Log::error('Pesapal order submission exception: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get transaction status from Pesapal
     */
    public function getTransactionStatus(string $orderTrackingId): array
    {
        try {
            Log::info('Getting transaction status from Pesapal', [
                'order_tracking_id' => $orderTrackingId
            ]);

            $token = $this->getAccessToken();
            if (!$token) {
                Log::error('Failed to get access token for status check');
                return [
                    'success' => false,
                    'error' => 'Failed to authenticate with Pesapal'
                ];
            }

            $response = Http::withoutVerifying()
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $token
                ])->get($this->baseUrl . 'Transactions/GetTransactionStatus', [
                    'orderTrackingId' => $orderTrackingId
                ]);

            Log::info('Pesapal transaction status response: ' . $response->status());

            if ($response->successful()) {
                $data = $response->json();
                
                Log::info('Transaction status retrieved', [
                    'order_tracking_id' => $orderTrackingId,
                    'payment_status_code' => $data['payment_status_code'] ?? null,
                    'payment_status_description' => $data['payment_status_description'] ?? null
                ]);

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
                    'status_code' => $data['status_code'] ?? null,
                    'merchant_reference' => $data['merchant_reference'] ?? null,
                    'payment_status_code' => $data['payment_status_code'] ?? 0,
                    'currency' => $data['currency'] ?? null
                ];
            }

            Log::error('Failed to get transaction status from Pesapal', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to get transaction status'
            ];
        } catch (\Exception $e) {
            Log::error('Pesapal transaction status exception: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Process payment callback/webhook from Pesapal
     * Maps Pesapal status codes to our order statuses
     */
    public function processCallback(array $callbackData): array
    {
        try {
            Log::info('Processing Pesapal callback/webhook', $callbackData);

            if (!isset($callbackData['OrderTrackingId'])) {
                Log::error('Callback missing OrderTrackingId', $callbackData);
                return [
                    'success' => false,
                    'error' => 'Missing OrderTrackingId'
                ];
            }

            $orderTrackingId = $callbackData['OrderTrackingId'];

            // Get transaction status to verify payment
            $transactionStatus = $this->getTransactionStatus($orderTrackingId);

            if (!$transactionStatus['success']) {
                Log::error('Failed to verify transaction from callback');
                return [
                    'success' => false,
                    'error' => 'Failed to verify transaction'
                ];
            }

            // Map Pesapal status codes to our order statuses
            // 0 = PENDING
            // 1 = COMPLETED/PAID
            // 2 = FAILED
            // 3 = REVERSED/CANCELLED
            $statusMapping = [
                0 => 'pending',
                1 => 'paid',
                2 => 'failed',
                3 => 'cancelled'
            ];

            // Handle empty string and null values properly
            $paymentStatusCode = $transactionStatus['payment_status_code'];
            
            // Convert empty string to 0
            if ($paymentStatusCode === '' || $paymentStatusCode === null) {
                $paymentStatusCode = 0;
            } else {
                $paymentStatusCode = (int)$paymentStatusCode;
            }

            $orderStatus = $statusMapping[$paymentStatusCode] ?? 'pending';

            Log::info('🔍 DIAGNOSTIC: Callback processed', [
                'order_tracking_id' => $orderTrackingId,
                'payment_status_code' => $paymentStatusCode,
                'payment_status_description' => $transactionStatus['payment_status_description'] ?? 'N/A',
                'confirmation_code' => $transactionStatus['confirmation_code'] ?? 'N/A',
                'order_status' => $orderStatus
            ]);

            return [
                'success' => true,
                'order_tracking_id' => $orderTrackingId,
                'order_status' => $orderStatus,
                'payment_status_code' => $paymentStatusCode,
                'transaction_details' => $transactionStatus
            ];
        } catch (\Exception $e) {
            Log::error('Pesapal callback processing exception: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Register IPN URL with Pesapal to get notification ID
     * This notification ID should be added to .env as PESAPAL_NOTIFICATION_ID
     */
    public function registerIPN(): array
    {
        try {
            Log::info('========== REGISTERING IPN URL WITH PESAPAL ==========');

            $token = $this->getAccessToken();
            if (!$token) {
                Log::error('Failed to get access token for IPN registration');
                return [
                    'success' => false,
                    'error' => 'Failed to get access token'
                ];
            }

            // IPN webhook URL - Where Pesapal sends backend notifications
            $webhookUrl = config('app.url') . '/api/pesapal/webhook';
            
            Log::info('Registering IPN webhook URL', ['url' => $webhookUrl]);

            // Determine the correct IPN registration endpoint
            $isSandbox = config('pesapal.sandbox', true);
            $ipnEndpoint = $isSandbox 
                ? 'https://cybqa.pesapal.com/pesapalv3/api/URLSetup/RegisterIPN'
                : 'https://pay.pesapal.com/v3/api/URLSetup/RegisterIPN';

            $payload = [
                'url' => $webhookUrl,
                'ipn_notification_type' => 'GET'
            ];

            Log::info('IPN registration request', [
                'endpoint' => $ipnEndpoint,
                'payload' => $payload
            ]);

            $response = Http::withoutVerifying()
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $token
                ])->post($ipnEndpoint, $payload);

            Log::info('Pesapal IPN registration response status: ' . $response->status());
            Log::info('Pesapal IPN registration response', $response->json());

            if ($response->successful()) {
                $data = $response->json();
                
                // Check for errors in response
                if (isset($data['error']) && $data['error'] !== null) {
                    Log::error('IPN registration returned error', $data['error']);
                    return [
                        'success' => false,
                        'error' => $data['error']['message'] ?? 'IPN registration failed'
                    ];
                }
                
                Log::info('IPN registered successfully', [
                    'ipn_id' => $data['ipn_id'] ?? null,
                    'status' => $data['ipn_status_description'] ?? null
                ]);
                
                return [
                    'success' => true,
                    'notification_id' => $data['ipn_id'] ?? null,
                    'url' => $data['url'] ?? null,
                    'ipn_status' => $data['ipn_status'] ?? null,
                    'ipn_status_description' => $data['ipn_status_description'] ?? null,
                    'created_date' => $data['created_date'] ?? null,
                    'ipn_notification_type' => $data['ipn_notification_type_description'] ?? 'GET',
                    'message' => '✅ IPN registered successfully! Copy the ipn_id below to PESAPAL_NOTIFICATION_ID in your .env file'
                ];
            }

            Log::error('Failed to register IPN with Pesapal', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to register IPN (HTTP ' . $response->status() . '): ' . $response->body()
            ];
        } catch (\Exception $e) {
            Log::error('IPN registration exception: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Test Pesapal API connection
     */
    public function testConnection(): array
    {
        try {
            Log::info('Testing Pesapal API connection');

            $token = $this->getAccessToken();

            if ($token) {
                Log::info('✅ Pesapal connection test successful');
                return [
                    'success' => true,
                    'message' => 'Connected to Pesapal successfully',
                    'token_preview' => substr($token, 0, 20) . '...'
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to get access token'
            ];
        } catch (\Exception $e) {
            Log::error('Pesapal connection test failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}