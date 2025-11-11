<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Pesapal Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Pesapal payment gateway integration
    |
    */

    // For sandbox: https://pesapalapi.azurewebsites.net/api/
    // For live: https://pesapal.com/api/
    'base_url' => env('PESAPAL_BASE_URL', 'https://pesapalapi.azurewebsites.net/api/'),

    'consumer_key' => env('PESAPAL_CONSUMER_KEY', 'qkio1BGGYAXTu2JOfm7XSXNruoZsrqEW'),

    'consumer_secret' => env('PESAPAL_CONSUMER_SECRET', 'osGQ364R49cXKeOYSpaOnT++rHs='),

    'notification_id' => env('PESAPAL_NOTIFICATION_ID', '40bb4b87-7656-4d75-a2f6-b36e88a1d69f'),

    /*
    |--------------------------------------------------------------------------
    | Callback URLs
    |--------------------------------------------------------------------------
    */

    'callback_url' => env('APP_URL') . '/api/pesapal/callback',

    'confirmation_url' => env('APP_URL') . '/api/pesapal/confirm',

    /*
    |--------------------------------------------------------------------------
    | Default Settings
    |--------------------------------------------------------------------------
    */

    'default_currency' => env('PESAPAL_DEFAULT_CURRENCY', 'KES'),

    'redirect_mode' => 'PARENT_WINDOW', // or 'TOP_WINDOW'

    /*
    |--------------------------------------------------------------------------
    | Environment Settings
    |--------------------------------------------------------------------------
    */

    'sandbox' => env('PESAPAL_SANDBOX', true),

    'debug' => env('PESAPAL_DEBUG', env('APP_DEBUG', false)),

    /*
    |--------------------------------------------------------------------------
    | Test Credentials
    |--------------------------------------------------------------------------
    */
    'test_credentials' => [
        'mpesa' => [
            'phone' => '254708374149',
            'pin' => '123456',
            'description' => 'Test M-Pesa number'
        ],
        'card' => [
            'number' => '5228-0343-8084-0343',
            'expiry' => '12/25',
            'cvv' => '123',
            'description' => 'Test card for sandbox'
        ],
        'bank' => [
            'description' => 'Any bank details work in sandbox mode'
        ]
    ],
];