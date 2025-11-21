<?php
// File: app/Services/SubscriptionService.php

namespace App\Services;

use App\Models\Subscription;
use App\Models\Product;
use App\Mail\SubscriptionCreated;
use App\Mail\SubscriptionRenewalReminder;
use App\Mail\SubscriptionCancelled;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SubscriptionService
{
    protected $pesapalService;

    public function __construct(PesapalService $pesapalService)
    {
        $this->pesapalService = $pesapalService;
    }

    /**
     * Create a new subscription for a user
     */
    public function createSubscription(
        int $userId,
        int $productId,
        string $tier,
        ?string $paymentReference = null
    ): ?Subscription {
        try {
            $product = Product::findOrFail($productId);

            if (!$product->is_subscription) {
                throw new \Exception('Product is not a subscription product');
            }

            $tierPrice = $product->getTierPrice($tier);
            if ($tierPrice === null) {
                throw new \Exception("Tier '{$tier}' does not exist for this product");
            }

            $subscription = Subscription::create([
                'user_id' => $userId,
                'product_id' => $productId,
                'tier' => $tier,
                'status' => 'active',
                'price' => $tierPrice,
                'currency' => 'KES',
                'subscription_reference' => Subscription::generateReference(),
                'payment_reference' => $paymentReference,
                'started_at' => now(),
                'next_billing_date' => now()->addMonth(),
            ]);

            Log::info('Subscription created', [
                'subscription_id' => $subscription->id,
                'user_id' => $userId,
                'product_id' => $productId,
                'tier' => $tier
            ]);

            return $subscription;
        } catch (\Exception $e) {
            Log::error('Error creating subscription: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Initiate payment for a paid subscription tier
     */
    public function initiateSubscriptionPayment(Subscription $subscription): array
    {
        try {
            if ($subscription->price == 0) {
                return [
                    'success' => true,
                    'message' => 'Free subscription activated',
                    'subscription' => $subscription
                ];
            }

            $paymentData = [
                'id' => $subscription->subscription_reference,
                'currency' => $subscription->currency,
                'amount' => (float)$subscription->price,
                'description' => "Subscription: {$subscription->product->title} ({$subscription->tier})",
                'callback_url' => config('pesapal.callback_url'),
                'billing_address' => [
                    'email_address' => $subscription->user->email,
                    'phone_number' => $subscription->user->phone,
                    'first_name' => explode(' ', $subscription->user->name)[0] ?? '',
                    'last_name' => explode(' ', $subscription->user->name, 2)[1] ?? '',
                ]
            ];

            $paymentResponse = $this->pesapalService->submitOrderRequest($paymentData);

            if (!$paymentResponse['success']) {
                return [
                    'success' => false,
                    'error' => $paymentResponse['error'] ?? 'Payment initiation failed'
                ];
            }

            $subscription->update([
                'payment_reference' => $paymentResponse['order_tracking_id']
            ]);

            return [
                'success' => true,
                'payment_url' => $paymentResponse['redirect_url'],
                'order_tracking_id' => $paymentResponse['order_tracking_id'],
                'subscription' => $subscription
            ];
        } catch (\Exception $e) {
            Log::error('Error initiating subscription payment: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Mark subscription as paid after payment confirmation
     */
    public function markSubscriptionAsPaid(Subscription $subscription): bool
    {
        return $subscription->update(['status' => 'active']);
    }

    /**
     * Send subscription creation email
     */
    public function sendSubscriptionCreatedEmail(Subscription $subscription): void
    {
        try {
            Mail::to($subscription->user->email)->send(
                new SubscriptionCreated($subscription)
            );

            Log::info('Subscription created email sent', [
                'subscription_id' => $subscription->id,
                'user_email' => $subscription->user->email
            ]);
        } catch (\Exception $e) {
            Log::error('Error sending subscription created email: ' . $e->getMessage());
        }
    }

    /**
     * Send subscription renewal reminder
     */
    public function sendRenewalReminder(Subscription $subscription, int $daysUntilRenewal): void
    {
        try {
            if ($subscription->renewal_reminded_at && 
                $subscription->renewal_reminded_at->diffInHours(now()) < 1) {
                return;
            }

            Mail::to($subscription->user->email)->send(
                new SubscriptionRenewalReminder($subscription, $daysUntilRenewal)
            );

            $subscription->update(['renewal_reminded_at' => now()]);

            Log::info('Renewal reminder email sent', [
                'subscription_id' => $subscription->id,
                'days_until_renewal' => $daysUntilRenewal
            ]);
        } catch (\Exception $e) {
            Log::error('Error sending renewal reminder: ' . $e->getMessage());
        }
    }

    /**
     * Cancel a subscription
     */
    public function cancelSubscription(
        Subscription $subscription,
        string $reason = ''
    ): bool {
        try {
            $subscription->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancellation_reason' => $reason
            ]);

            $this->sendCancellationEmail($subscription);

            Log::info('Subscription cancelled', [
                'subscription_id' => $subscription->id,
                'reason' => $reason
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Error cancelling subscription: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send subscription cancellation email
     */
    public function sendCancellationEmail(Subscription $subscription): void
    {
        try {
            Mail::to($subscription->user->email)->send(
                new SubscriptionCancelled($subscription)
            );

            Log::info('Subscription cancelled email sent', [
                'subscription_id' => $subscription->id,
                'user_email' => $subscription->user->email
            ]);
        } catch (\Exception $e) {
            Log::error('Error sending cancellation email: ' . $e->getMessage());
        }
    }

    /**
     * Renew a subscription for another month
     */
    public function renewSubscription(Subscription $subscription): bool
    {
        try {
            $subscription->update([
                'next_billing_date' => $subscription->next_billing_date->addMonth(),
                'status' => 'active'
            ]);

            Log::info('Subscription renewed', [
                'subscription_id' => $subscription->id,
                'next_billing_date' => $subscription->next_billing_date
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Error renewing subscription: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Check and send reminders for subscriptions expiring soon
     */
    public function checkAndSendReminders(): void
    {
        try {
            $threeDay = Subscription::expiringSoon(3)
                ->whereNull('renewal_reminded_at')
                ->get();

            foreach ($threeDay as $subscription) {
                $this->sendRenewalReminder($subscription, 3);
            }

            $sevenDay = Subscription::expiringSoon(7)
                ->where('renewal_reminded_at', null)
                ->orWhere('renewal_reminded_at', '<', now()->subDays(4))
                ->get();

            foreach ($sevenDay as $subscription) {
                $this->sendRenewalReminder($subscription, 7);
            }

            Log::info('Subscription reminders checked and sent');
        } catch (\Exception $e) {
            Log::error('Error checking subscription reminders: ' . $e->getMessage());
        }
    }

    /**
     * Get user's active subscriptions
     */
    public function getUserSubscriptions(int $userId, string $status = 'active'): array
    {
        return Subscription::where('user_id', $userId)
            ->where('status', $status)
            ->with('product')
            ->get()
            ->toArray();
    }
}