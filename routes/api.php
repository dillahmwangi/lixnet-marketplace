<?php

use App\Http\Controllers\Admin\AgentApplicationController as AdminAgentApplicationController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\Agent\DashboardController;
use App\Http\Controllers\Agent\SalesController;
use App\Http\Controllers\AgentApplicationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PesapalCallbackController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Public API Routes (Guest Access)
|--------------------------------------------------------------------------
*/

Route::middleware(['web', 'auth'])->get('/user', function (Request $request) {
    return $request->user();
});

// Categories
Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::get('/{category}', [CategoryController::class, 'show']);
    Route::get('/slug/{slug}', [CategoryController::class, 'showBySlug']);
});

// Products
Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/search', [ProductController::class, 'search']);
    Route::get('/filter', [ProductController::class, 'filterByCategory']);
    Route::get('/featured', [ProductController::class, 'featured']);
    Route::get('/{product}', [ProductController::class, 'show']);
});

Route::prefix('cart')->group(function () {
    Route::get('/view', [CartController::class, 'index']);
});

// Pesapal callback routes (must be public for webhook access)
Route::prefix('pesapal')->group(function () {
    Route::match(['get', 'post'], '/callback', [PesapalCallbackController::class, 'handleCallback']);
    Route::get('/confirm', [PesapalCallbackController::class, 'confirmPayment']);
});

/*
|--------------------------------------------------------------------------
| Customer API Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['web', 'auth', 'customer'])->group(function () {
    // Cart management
    Route::prefix('cart')->group(function () {
        Route::get('/get', [CartController::class, 'index']);
        Route::post('/add', [CartController::class, 'addItem']);
        Route::put('/items/{cartItem}', [CartController::class, 'updateItem']);
        Route::delete('/items/{cartItem}', [CartController::class, 'removeItem']);
        Route::delete('/clear', [CartController::class, 'clear']);
    });

    // Order management
    Route::prefix('orders')->group(function () {
        Route::get('/get', [OrderController::class, 'index']);
        Route::post('/', [OrderController::class, 'store']);
        Route::get('/{order}', [OrderController::class, 'show']);
        Route::post('/{order}/pay', [OrderController::class, 'initiatePayment']);
    });

    // User management
    Route::prefix('user')->group(function () {
        Route::get('/profile', [UserController::class, 'getProfile']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
        Route::get('/summary', [UserController::class, 'getUserSummary']);
        Route::get('/stats', [UserController::class, 'getUserStats']);
        Route::get('/orders', [UserController::class, 'getOrderHistory']);
        Route::delete('/account', [UserController::class, 'deleteAccount']);
        Route::put('/change-password', [UserController::class, 'changePassword']);
    });

    // Agent application management
    Route::prefix('agent-application')->group(function () {
        Route::get('/status', [AgentApplicationController::class, 'status']);
        Route::post('/submit', [AgentApplicationController::class, 'submit']);
    });
});

/*
|--------------------------------------------------------------------------
| Agent Only API Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['web', 'auth', 'agent'])->prefix('agent')->name('agent.')->group(function () {
    // Dashboard
    Route::get('dashboard-ui', [DashboardController::class, 'index'])->name('dashboard-ui');

    // Sales
    Route::get('sales-data', [SalesController::class, 'index'])->name('sales.index');
    Route::get('sales-data/{orderId}', [SalesController::class, 'show'])->name('sales.show');
});

/*
|--------------------------------------------------------------------------
| Admin Only API Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['web', 'auth', 'verified', 'admin'])->prefix('admin')->group(function () {
    // Dashboard
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);

    // Category management (admin only)
    Route::prefix('categories')->group(function () {
        Route::post('/', [CategoryController::class, 'store']);
        Route::put('/{category}', [CategoryController::class, 'update']);
        Route::delete('/{category}', [CategoryController::class, 'destroy']);
    });

    // Product management (admin only)
    Route::prefix('products')->group(function () {
        Route::post('/', [ProductController::class, 'store']);
        Route::put('/{product}', [ProductController::class, 'update']);
        Route::delete('/{product}', [ProductController::class, 'destroy']);
    });

    // User management (admin only)
    Route::prefix('users')->group(function () {
        Route::get('/', [AdminUserController::class, 'index'])->name('admin.users.index');
        Route::post('/', [AdminUserController::class, 'store'])->name('admin.users.store');
        Route::get('/{user}', [AdminUserController::class, 'show'])->name('admin.users.show');
        Route::put('/{user}', [AdminUserController::class, 'update'])->name('admin.users.update');
        Route::get('/{user}/orders', [AdminUserController::class, 'orders'])->name('admin.users.orders');
    });

    //Agent management (admin only)
    Route::prefix('agent-applications')->group(function () {
        Route::get('/list', [AdminAgentApplicationController::class, 'index'])->name('admin.agent-applications.index');
        Route::get('/details/{application}', [AdminAgentApplicationController::class, 'show'])->name('admin.agent-applications.show');
        Route::post('/{application}/approve', [AdminAgentApplicationController::class, 'approve'])->name('admin.agent-applications.approve');
        Route::post('/{application}/reject', [AdminAgentApplicationController::class, 'reject'])->name('admin.agent-applications.reject');
        Route::get('/{application}/documents/{documentType}', [AdminAgentApplicationController::class, 'downloadDocument'])->name('admin.agent-applications.download-documents');
    });
});
