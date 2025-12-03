<?php

use App\Http\Controllers\Admin\AgentApplicationController as AdminAgentApplicationController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AgentApplicationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PesapalCallbackController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\JobApplicationController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\SSOProductController;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;



/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

/*
|--------------------------------------------------------------------------
| Public API Routes (Guest Access)
|--------------------------------------------------------------------------
*/

Route::middleware(['web', 'auth'])->get('/user', function (Request $request) {
    return $request->user();
});

// Categories - Public access
Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::get('/{category}', [CategoryController::class, 'show']);
    Route::get('/slug/{slug}', [CategoryController::class, 'showBySlug']);
});

// Products - Public access
// IMPORTANT: Specific routes BEFORE generic {product} route
Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::post('/', [ProductController::class, 'store'])->middleware(['auth', 'admin']);
    Route::get('/search', [ProductController::class, 'search']);
    Route::get('/filter', [ProductController::class, 'filterByCategory']);
    Route::get('/featured', [ProductController::class, 'featured']);
    // Generic route MUST be last
    Route::get('/{product}', [ProductController::class, 'show']);
    Route::put('/{product}', [ProductController::class, 'update'])->middleware(['auth', 'admin']);
    Route::delete('/{product}', [ProductController::class, 'destroy'])->middleware(['auth', 'admin']);
});

// Cart - Public view
Route::prefix('cart')->group(function () {
    Route::get('/view', [CartController::class, 'index']);
});

// Jobs - Public access
Route::prefix('jobs')->group(function () {
    Route::get('/', [JobController::class, 'index']);
    Route::get('/{job}', [JobController::class, 'show']);
});

// Job applications - Public access (guests can apply)
Route::prefix('job-applications')->group(function () {
    Route::post('/', [JobApplicationController::class, 'store']);
});

// Pesapal callback routes - Must be public for webhook access
Route::prefix('pesapal')->group(function () {
    // User browser redirect after payment completes (user-facing, redirects to order page)
    Route::get('/callback', [PesapalCallbackController::class, 'handleCallback'])->name('pesapal.callback');
    
    // Pesapal IPN webhook notifications (backend silent notification)
    Route::match(['get', 'post'], '/webhook', [PesapalCallbackController::class, 'handleWebhook'])->name('pesapal.webhook');
    
    // Payment confirmation page (user-facing, shows order status)
    Route::get('/confirm', [PesapalCallbackController::class, 'confirmPayment'])->name('pesapal.confirm');
});

/*
|--------------------------------------------------------------------------
| Customer API Routes (Authenticated)
|--------------------------------------------------------------------------
*/

Route::middleware(['web', 'auth', 'customer'])->group(function () {

    // Cart management - Authenticated customers
    Route::prefix('cart')->group(function () {
        Route::get('/get', [CartController::class, 'index']);
        Route::post('/add', [CartController::class, 'addItem']);
        Route::put('/items/{cartItem}', [CartController::class, 'updateItem']);
        Route::delete('/items/{cartItem}', [CartController::class, 'removeItem']);
        Route::delete('/clear', [CartController::class, 'clear']);
    });

    // Order management - Authenticated customers
    Route::prefix('orders')->group(function () {
        Route::get('/get', [OrderController::class, 'index']);
        Route::post('/', [OrderController::class, 'store']);
        Route::get('/{order}', [OrderController::class, 'show']);
        Route::post('/{order}/pay', [OrderController::class, 'initiatePayment']);
    });

    // User profile management - Authenticated customers
    Route::prefix('user')->group(function () {
        Route::get('/profile', [UserController::class, 'getProfile']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
        Route::get('/summary', [UserController::class, 'getUserSummary']);
        Route::get('/stats', [UserController::class, 'getUserStats']);
        Route::get('/orders', [UserController::class, 'getOrderHistory']);
        Route::delete('/account', [UserController::class, 'deleteAccount']);
        Route::put('/change-password', [UserController::class, 'changePassword']);
    });

    // Agent application management - Authenticated customers
    Route::prefix('agent-application')->group(function () {
        Route::get('/status', [AgentApplicationController::class, 'status']);
        Route::post('/submit', [AgentApplicationController::class, 'submit']);
    });

    // Subscription management - Authenticated customers
    Route::prefix('subscriptions')->group(function () {
        Route::get('/tiers/{product}', [SubscriptionController::class, 'getTiers']);
        Route::post('/', [SubscriptionController::class, 'subscribe']);
        Route::get('/', [SubscriptionController::class, 'getUserSubscriptions']);
        Route::get('/{id}', [SubscriptionController::class, 'show']);
        Route::post('/{id}/cancel', [SubscriptionController::class, 'cancel']);
        Route::post('/{id}/change-tier', [SubscriptionController::class, 'changeTier']);
    });

    // SSO Product Routes - Authenticated customers only
    Route::prefix('sso')->name('sso.')->group(function () {
        
        // Get available subscription products
        Route::get('/available-products', [SSOProductController::class, 'getAvailableProducts'])
            ->name('available-products');
        
        // Get user's current subscriptions
        Route::get('/my-subscriptions', [SSOProductController::class, 'getMySubscriptions'])
            ->name('my-subscriptions');
        
        // Get product details with subscription info
        Route::get('/product/{productId}', [SSOProductController::class, 'getProductDetails'])
            ->where('productId', '[0-9]+')
            ->name('product-details');
        
        // SSO Redirect - GET request (no CSRF needed for GET)
        // Frontend uses GET to avoid CSRF token issues
        Route::get('/redirect/{productId}', [SSOProductController::class, 'redirectToProduct'])
            ->where('productId', '[0-9]+')
            ->name('redirect-get');
        
        // SSO Redirect - POST request with CSRF bypass (fallback for POST)
        Route::post('/redirect/{productId}', [SSOProductController::class, 'redirectToProduct'])
            ->where('productId', '[0-9]+')
            ->name('redirect-post')
            ->withoutMiddleware('App\Http\Middleware\VerifyCsrfToken');
        
        // Validate SSO token - Can be called by external products
        // CSRF bypassed for external integration
        Route::post('/validate-token', [SSOProductController::class, 'validateToken'])
            ->name('validate-token')
            ->withoutMiddleware('App\Http\Middleware\VerifyCsrfToken');
    });

});

/*
|--------------------------------------------------------------------------
| Admin Only API Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['web', 'auth', 'verified', 'admin'])->prefix('admin')->group(function () {

    // Admin Dashboard
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);

    // Category management - Admin only
    Route::prefix('categories')->group(function () {
        Route::post('/', [CategoryController::class, 'store']);
        Route::put('/{category}', [CategoryController::class, 'update']);
        Route::delete('/{category}', [CategoryController::class, 'destroy']);
    });

    // User management - Admin only
    Route::prefix('users')->group(function () {
        Route::get('/', [AdminUserController::class, 'index'])->name('admin.users.index');
        Route::post('/', [AdminUserController::class, 'store'])->name('admin.users.store');
        Route::get('/{user}', [AdminUserController::class, 'show'])->name('admin.users.show');
        Route::put('/{user}', [AdminUserController::class, 'update'])->name('admin.users.update');
        Route::get('/{user}/orders', [AdminUserController::class, 'orders'])->name('admin.users.orders');
    });

    // Agent applications management - Admin only
    Route::prefix('agent-applications')->group(function () {
        Route::get('/list', [AdminAgentApplicationController::class, 'index'])->name('admin.agent-applications.index');
        Route::get('/details/{application}', [AdminAgentApplicationController::class, 'show'])->name('admin.agent-applications.show');
        Route::post('/{application}/approve', [AdminAgentApplicationController::class, 'approve'])->name('admin.agent-applications.approve');
        Route::post('/{application}/reject', [AdminAgentApplicationController::class, 'reject'])->name('admin.agent-applications.reject');
        Route::get('/{application}/documents/{documentType}', [AdminAgentApplicationController::class, 'downloadDocument'])->name('admin.agent-applications.download-documents');
    });

    // Job management - Admin only
    Route::prefix('jobs')->group(function () {
        Route::get('/', [JobController::class, 'adminIndex']);
        Route::post('/', [JobController::class, 'store']);
        Route::get('/{job}', [JobController::class, 'show']);
        Route::put('/{job}', [JobController::class, 'update']);
        Route::delete('/{job}', [JobController::class, 'destroy']);
    });

    // Job applications management - Admin only
    Route::prefix('job-applications')->group(function () {
        Route::get('/', [JobApplicationController::class, 'index']);
        Route::get('/{application}', [JobApplicationController::class, 'show']);
        Route::put('/{application}', [JobApplicationController::class, 'update']);
        Route::delete('/{application}', [JobApplicationController::class, 'destroy']);
        Route::get('/{application}/download-resume', [JobApplicationController::class, 'downloadResume']);
    });

});