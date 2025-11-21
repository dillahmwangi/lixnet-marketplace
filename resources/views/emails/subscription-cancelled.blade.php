<!-- File: resources/views/emails/subscription-cancelled.blade.php -->
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
            background-color: #f44336; 
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
            border-left: 4px solid #f44336; 
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
        h1 { margin: 0; }
        p { line-height: 1.6; }
        ul { line-height: 1.8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Subscription Cancelled</h1>
        </div>
        <div class="content">
            <p>Hi {{ $user->name }},</p>
            
            <p>Your subscription to <strong>{{ $product->title }}</strong> has been successfully cancelled.</p>

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
                    <span class="label">Cancelled Date:</span>
                    <span class="value">{{ $cancelledDate }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Cancellation Reason:</span>
                    <span class="value">{{ $reason ?: 'Not provided' }}</span>
                </div>
            </div>

            <p><strong>What happens now?</strong></p>
            <ul>
                <li>Your access to {{ ucfirst($subscription->tier) }} tier features will end immediately</li>
                <li>You will not be charged again for this subscription</li>
                <li>You can resubscribe anytime to regain access</li>
            </ul>

            <p>We'd love to hear your feedback! If there's anything we can improve, please let us know.</p>

            <p>Best regards,<br>The Team</p>

            <div class="footer">
                <p>This is an automated email. Please do not reply directly to this email.</p>
                <p>&copy; {{ date('Y') }}. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>