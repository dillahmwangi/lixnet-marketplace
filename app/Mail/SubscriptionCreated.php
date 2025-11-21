<?php
// File: app/Mail/SubscriptionCreated.php

namespace App\Mail;

use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SubscriptionCreated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Subscription $subscription)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Subscription Activated - ' . $this->subscription->product->title
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.subscription-created',
            with: [
                'user' => $this->subscription->user,
                'subscription' => $this->subscription,
                'product' => $this->subscription->product,
                'nextBillingDate' => $this->subscription->next_billing_date->format('M d, Y'),
                'tierPrice' => $this->subscription->price > 0 
                    ? 'KSh ' . number_format($this->subscription->price, 0)
                    : 'FREE',
            ]
        );
    }
}