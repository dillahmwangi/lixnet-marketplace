<?php
// File: app/Console/Commands/SendSubscriptionReminders.php

namespace App\Console\Commands;

use App\Services\SubscriptionService;
use Illuminate\Console\Command;

class SendSubscriptionReminders extends Command
{
    protected $signature = 'subscriptions:send-reminders';
    
    protected $description = 'Send subscription renewal reminders for subscriptions expiring soon';

    public function __construct(private SubscriptionService $subscriptionService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('🔔 Checking and sending subscription reminders...');
        
        try {
            $this->subscriptionService->checkAndSendReminders();
            $this->info('✓ Subscription reminders sent successfully!');
            return 0;
        } catch (\Exception $e) {
            $this->error('✗ Error sending reminders: ' . $e->getMessage());
            return 1;
        }
    }
}