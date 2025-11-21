<!-- File: resources/views/emails/subscription-created.blade.php -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            color: #333; 
            margin: 0;
            padding: 0;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        .header { 
            background-color: #4CAF50; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            border-radius: 5px 5px 0 0; 
        }
        .content { 
            background-color: #f9f9f9; 
            padding: 20px; 
            border: 1px solid #ddd; 
            border-radius: 0 0 5px 5px; 
        }
        .details { 
            background-color: white; 
            padding: 15px; 
            margin: 15px 0; 
            border-left: 4px solid #4CAF50; 
        }
        .detail-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0; 
            border-bottom: 1px solid #eee; 
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .label { 
            font-weight: bold; 
            color: #555; 
        }
        .value { 
            color: #333; 
        }
        .footer { 
            text-align: center; 
            padding-top: 20px; 
            color: #999; 
            font-size: 12px; 
        }
        .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background-color: #4CAF50; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 15px 0; 
        }
        h1 { margin: 0; }
        p { line-height: 1.6; }
        ul { line-height: 1.8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✓ Subscription Activated</h1>
        </div>
        <div class="content">
            <p>Hi {{ $user->name }},</p>
            
            <p>Your subscription has been successfully activated!</p>

            <div class="details">
                <div class="detail-row">
                    <span class="label">Product:</span>
                    <span class="value">{{ $product->title }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Tier:</span>
                    <span class="value">{{ ucfirst($subscription->tier) }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Monthly Price:</span>
                    <span class="value">{{ $tierPrice }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Subscription Reference:</span>
                    <span class="value">{{ $subscription->subscription_reference }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Started Date:</span>
                    <span class="value">{{ $subscription->started_at->format('M d, Y') }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Next Billing Date:</span>
                    <span class="value">{{ $nextBillingDate }}</span>
                </div>
            </div>

            <p><strong>What's next?</strong></p>
            <ul>
                <li>Your subscription is now active and you have access to all {{ ucfirst($subscription->tier) }} tier features</li>
                <li>You will receive a renewal reminder 7 days and 3 days before your next billing date</li>
                <li>You can cancel your subscription anytime from your account dashboard</li>
            </ul>

            <p>If you have any questions, feel free to contact our support team.</p>

            <p>Best regards,<br>The Team</p>

            <div class="footer">
                <p>This is an automated email. Please do not reply directly to this email.</p>
                <p>&copy; {{ date('Y') }}. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>