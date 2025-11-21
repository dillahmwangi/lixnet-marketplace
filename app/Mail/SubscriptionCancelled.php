<?php
// File: app/Mail/SubscriptionCancelled.php

namespace App\Mail;

use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SubscriptionCancelled extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Subscription $subscription)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Subscription Cancelled - ' . $this->subscription->product->title
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.subscription-cancelled',
            with: [
                'user' => $this->subscription->user,
                'subscription' => $this->subscription,
                'product' => $this->subscription->product,
                'cancelledDate' => $this->subscription->cancelled_at->format('M d, Y'),
                'reason' => $this->subscription->cancellation_reason ?? 'No reason provided',
            ]
        );
    }
}