<?php
// File: app/Console/Commands/ProcessSubscriptionRenewals.php

namespace App\Console\Commands;

use App\Models\Subscription;
use App\Services\SubscriptionService;
use App\Services\PesapalService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ProcessSubscriptionRenewals extends Command
{
    protected $signature = 'subscriptions:process-renewals';
    
    protected $description = 'Process automatic subscription renewals for subscriptions that reached their renewal date';

    public function __construct(
        private SubscriptionService $subscriptionService,
        private PesapalService $pesapalService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('🔄 Processing subscription renewals...');

        try {
            // Get all subscriptions that need renewal
            $subscriptionsNeedingRenewal = Subscription::needsRenewal()->get();

            $this->info("Found {$subscriptionsNeedingRenewal->count()} subscriptions needing renewal");

            foreach ($subscriptionsNeedingRenewal as $subscription) {
                $this->processSubscriptionRenewal($subscription);
            }

            $this->info('✓ Subscription renewals processed successfully!');
            return 0;
        } catch (\Exception $e) {
            $this->error('✗ Error processing renewals: ' . $e->getMessage());
            Log::error('Error processing subscription renewals: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Process renewal for a single subscription
     */
    private function processSubscriptionRenewal(Subscription $subscription): void
    {
        try {
            $subscription->load('user', 'product');

            // Log renewal attempt
            $this->line("Processing renewal for subscription {$subscription->subscription_reference}...");

            // If free tier, just extend the next billing date
            if ($subscription->price == 0) {
                $this->subscriptionService->renewSubscription($subscription);
                $this->info("✓ Free subscription renewed: {$subscription->subscription_reference}");
                return;
            }

            // For paid subscriptions, process payment
            $paymentData = [
                'id' => 'RENEWAL-' . $subscription->subscription_reference,
                'currency' => $subscription->currency,
                'amount' => (float)$subscription->price,
                'description' => "Subscription Renewal: {$subscription->product->title} ({$subscription->tier})",
                'callback_url' => config('pesapal.callback_url'),
                'billing_address' => [
                    'email_address' => $subscription->user->email,
                    'phone_number' => $subscription->user->phone,
                    'first_name' => explode(' ', $subscription->user->name)[0] ?? '',
                    'last_name' => explode(' ', $subscription->user->name, 2)[1] ?? '',
                ]
            ];

            $paymentResponse = $this->pesapalService->submitOrderRequest($paymentData);

            if ($paymentResponse['success']) {
                // Update subscription with new payment reference
                $subscription->update([
                    'payment_reference' => $paymentResponse['order_tracking_id']
                ]);

                $this->info("✓ Renewal payment initiated: {$subscription->subscription_reference}");
                Log::info("Subscription renewal payment initiated", [
                    'subscription_id' => $subscription->id,
                    'order_tracking_id' => $paymentResponse['order_tracking_id']
                ]);
            } else {
                $this->error("✗ Failed to process renewal payment: {$subscription->subscription_reference}");
                Log::error("Failed to process renewal payment", [
                    'subscription_id' => $subscription->id,
                    'error' => $paymentResponse['error']
                ]);

                // Mark as failed
                $subscription->update(['status' => 'failed']);
            }
        } catch (\Exception $e) {
            $this->error("✗ Error processing renewal: " . $e->getMessage());
            Log::error('Error processing subscription renewal', [
                'subscription_id' => $subscription->id,
                'error' => $e->getMessage()
            ]);

            // Mark as failed
            $subscription->update(['status' => 'failed']);
        }
    }
}