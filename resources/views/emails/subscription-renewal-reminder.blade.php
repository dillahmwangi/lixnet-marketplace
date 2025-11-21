<!-- File: resources/views/emails/subscription-renewal-reminder.blade.php -->
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
            background-color: #FF9800; 
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
            border-left: 4px solid #FF9800; 
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
        .countdown { 
            font-size: 24px; 
            color: #FF9800; 
            font-weight: bold; 
            text-align: center; 
            margin: 20px 0; 
            padding: 20px;
            background-color: #fff3e0;
            border-radius: 5px;
        }
        h1 { margin: 0; }
        p { line-height: 1.6; }
        ul { line-height: 1.8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⏰ Subscription Renewal Reminder</h1>
        </div>
        <div class="content">
            <p>Hi {{ $user->name }},</p>
            
            <p>Your subscription to <strong>{{ $product->title }}</strong> ({{ ucfirst($subscription->tier) }} tier) will renew in <strong>{{ $daysUntilRenewal }} days</strong>.</p>

            <div class="countdown">
                {{ $daysUntilRenewal }} DAYS LEFT
            </div>

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
                    <span class="label">Monthly Cost:</span>
                    <span class="value">{{ $tierPrice }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Renewal Date:</span>
                    <span class="value">{{ $nextBillingDate }}</span>
                </div>
            </div>

            <p><strong>What happens next?</strong></p>
            <ul>
                <li>On {{ $nextBillingDate }}, your subscription will automatically renew for another month</li>
                <li>You will be charged {{ $tierPrice }} on the renewal date</li>
                <li>You can cancel anytime before the renewal date to avoid the charge</li>
            </ul>

            <p><strong>Want to cancel?</strong><br>
            You can cancel your subscription anytime from your account dashboard. Your access will continue until the end of your current billing period.</p>

            <div class="footer">
                <p>This is an automated email. Please do not reply directly to this email.</p>
                <p>&copy; {{ date('Y') }}. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>