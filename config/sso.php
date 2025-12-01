<?php
/**
 * FILE: config/sso.php
 * 

 */

return [

    /*
    |--------------------------------------------------------------------------
    | External Product URLs
    |--------------------------------------------------------------------------
    |
    | Configure the URLs for your external products
    | Key = Product ID (from your database)
    | Value = Product Domain URL
    |
    | For localhost testing, use:
    |  - 'http://localhost:8001' for Payroll
    |  - 'http://localhost:8002' for HR
    |  - 'http://localhost:8003' for Accounting
    |
    */

    'products' => [
        // Product ID => URL
        1 => env('PRODUCT_1_URL', 'http://localhost:8001'),
        2 => env('PRODUCT_2_URL', 'http://localhost:8002'),
        3 => env('PRODUCT_3_URL', 'http://localhost:8003'),
        4 => env('PRODUCT_4_URL', 'http://localhost:8001'),
        5 => env('PRODUCT_5_URL', 'http://localhost:8002'),
        6 => env('PRODUCT_6_URL', 'http://localhost:8001'),
        7 => env('PRODUCT_7_URL', 'http://localhost:8002'),
        8 => env('PRODUCT_8_URL', 'http://localhost:8003'),
        9 => env('PRODUCT_9_URL', 'http://localhost:8001'),
    ],

    /*
    |--------------------------------------------------------------------------
    | SSO Token Configuration
    |--------------------------------------------------------------------------
    |
    | token_expiration: How long tokens are valid (in seconds)
    | Typical range: 30-120 seconds for one-time handoff
    |
    */

    'token_expiration' => env('SSO_TOKEN_EXPIRATION', 60),

    /*
    |--------------------------------------------------------------------------
    | Feature Mappings by Product and Tier
    |--------------------------------------------------------------------------
    |
    | This maps features to tiers for each product
    | These are displayed when user logs in via SSO
    |
    | Note: Features are now pulled from Product.subscription_tiers
    | This configuration can serve as fallback
    |
    */

    'features' => [
        // Features will be dynamically loaded from Product model
        // This is kept for backward compatibility
    ],

    /*
    |--------------------------------------------------------------------------
    | Simulation Mode (for localhost testing)
    |--------------------------------------------------------------------------
    |
    | When true, enables special endpoints for testing
    | NEVER enable this in production
    |
    */

    'simulation_mode' => env('SSO_SIMULATION_MODE', true),

];