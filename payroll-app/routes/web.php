<?php
/**
 * EXTERNAL PRODUCT APP - PORT 8001
 * This simulates a separate product application (like Payroll Software)
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Laravel project: laravel new payroll-app
 * 2. Replace routes/web.php with this code
 * 3. Create resources/views/sso-dashboard.blade.php
 * 4. Update .env: APP_PORT=8001, APP_URL=http://localhost:8001
 * 5. Run: php artisan serve --port=8001
 */

// FILE: routes/web.php in the EXTERNAL product app

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SSO Authentication Routes (External Product)
|--------------------------------------------------------------------------
*/

/**
 * Handle SSO redirect from marketplace
 * URL: http://localhost:8001/sso-auth?token=JWT_TOKEN
 */
Route::get('/sso-auth', function (Request $request) {
    try {
        $token = $request->query('token');

        if (!$token) {
            return view('sso-error', ['error' => 'No authentication token provided']);
        }

        // Get marketplace app key (must be the same!)
        $marketplaceKey = env('MARKETPLACE_APP_KEY', env('APP_KEY'));

        // Decode and verify JWT token
        $decoded = JWT::decode(
            $token,
            new Key($marketplaceKey, 'HS256')
        );

        // Store user data in session
        session([
            'sso_user' => $decoded,
            'user_id' => $decoded->user_id,
            'user_email' => $decoded->email,
            'user_name' => $decoded->name,
            'product_tier' => $decoded->tier,
            'product_features' => $decoded->features ?? [],
            'authenticated_via_sso' => true,
        ]);

        // Log the SSO login
        \Log::info('SSO Login Successful', [
            'user_id' => $decoded->user_id,
            'email' => $decoded->email,
            'product' => $decoded->product,
            'tier' => $decoded->tier,
        ]);

        return view('sso-dashboard');

    } catch (\Exception $e) {
        \Log::error('SSO Authentication Error: ' . $e->getMessage());
        return view('sso-error', ['error' => 'Invalid or expired token']);
    }
});

/**
 * Dashboard - Shows authenticated user information
 */
Route::get('/dashboard', function () {
    if (!session('authenticated_via_sso')) {
        return redirect('/sso-auth')->with('error', 'Not authenticated');
    }

    return view('sso-dashboard');
});

/**
 * Logout from SSO session
 */
Route::post('/logout', function () {
    session()->flush();
    return redirect('/')->with('message', 'Logged out successfully');
});

/**
 * Home page
 */
Route::get('/', function () {
    if (session('authenticated_via_sso')) {
        return redirect('/dashboard');
    }
    
    return view('home');
});

/**
 * Verify token endpoint (for debugging)
 */
Route::get('/verify-sso-token', function (Request $request) {
    $userData = session('sso_user');
    
    if (!$userData) {
        return response()->json(['error' => 'Not authenticated'], 401);
    }

    return response()->json([
        'authenticated' => true,
        'user' => $userData,
        'tier' => session('product_tier'),
        'features' => session('product_features'),
    ]);
});