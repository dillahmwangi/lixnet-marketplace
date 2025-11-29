<?php

use App\Models\AgentApplication;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Only Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Marketplace');
})->name('marketplace');

Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

Route::get('/sell-products', function () {
    return Inertia::render('SellProducts');
})->name('sell-products');

Route::get('/affiliate', function () {
    return Inertia::render('Affiliate');
})->name('affiliate');

Route::get('/help', function () {
    return Inertia::render('Help');
})->name('help');

Route::get('/careers', function () {
    return Inertia::render('Careers');
})->name('careers');

Route::get('/careers/{job}', function (App\Models\Job $job) {
    return Inertia::render('JobDetail', [
        'job' => $job,
    ]);
})->name('careers.show');

Route::get('/cart', function () {
    return Inertia::render('Cart');
})->name('cart');

// Add the checkout route here
Route::get('/checkout', function () {
    return Inertia::render('user/Checkout');
})->name('checkout');

// Product details route (singular /product to avoid API /products conflict)
Route::get('/product/{product}', function (App\Models\Product $product) {
    return Inertia::render('ProductDetails', [
        'product' => $product->load('category'),
    ]);
})->name('products.show');

// My subscriptions route
Route::get('/my-subscriptions', function () {
    return Inertia::render('UserSubscriptions');
})->middleware(['auth'])->name('subscriptions.index');

/*
|--------------------------------------------------------------------------
| Customer Only Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'customer'])->group(function () {

    Route::get('/account', function () {
        return Inertia::render('Account');
    })->name('account');

    Route::get('/profile', function () {
        return Inertia::render('user/Profile');
    })->name('profile');

    Route::get('/orders', function () {
        return Inertia::render('user/Orders');
    })->name('orders');

    Route::get('/sales-registration', function () {
        return Inertia::render('user/SalesRegistration');
    });
});

/*
|--------------------------------------------------------------------------
| Agent Only Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'agent'])->prefix('agent')->name('agent.')->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('agent/Dashboard');
    })->name('dashboard');

    Route::get('profile', function () {
        return Inertia::render('agent/Profile');
    })->name('profile');

    Route::get('sales', function () {
        return Inertia::render('agent/Sales');
    })->name('sales');

    Route::get('sales/{orderId}', function (string $orderId) {
        return Inertia::render('agent/SalesDetail', [
            'orderId' => $orderId,
        ]);
    })->name('sales.detail');
});


/*
|--------------------------------------------------------------------------
| Admin Only Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {

    Route::get('users-list', function () {
        return Inertia::render('admin/users');
    })->name('userlist');

    Route::get('users-list/{userId}', function (string $userId) {
        return Inertia::render('admin/user-details', [
            'userId' => $userId,
        ]);
    })->name('userdetails');

    Route::get('agent-applications', function () {
        return Inertia::render('admin/agent-applications/index');
    })->name('agent-applications');

    Route::get('agent-applications/{application}', function (AgentApplication $application) {
        return Inertia::render('admin/agent-applications/show', [
            'applicationId' => $application->id,
        ]);
    })->name('agent-applications.show');

    // Categories management
    Route::get('categories', function () {
        return Inertia::render('admin/categories');
    })->name('categories');

    Route::get('categories/create', function () {
        return Inertia::render('admin/category-create');
    })->name('categories.create');

    Route::get('categories/{category}/edit', function (App\Models\Category $category) {
        return Inertia::render('admin/category-edit', [
            'category' => $category,
        ]);
    })->name('categories.edit');

    // Products management
    Route::get('products', function () {
        return Inertia::render('admin/products');
    })->name('products');

    Route::get('products/create', function () {
        return Inertia::render('admin/product-create');
    })->name('products.create');

    Route::get('products/{product}/edit', function (App\Models\Product $product) {
        return Inertia::render('admin/product-edit', [
            'product' => $product->load('category'),
        ]);
    })->name('products.edit');

    // Jobs management
    Route::get('jobs', function () {
        return Inertia::render('admin/jobs');
    })->name('jobs');

    Route::get('jobs/create', function () {
        return Inertia::render('admin/job-create');
    })->name('jobs.create');

    Route::get('jobs/{job}/edit', function (App\Models\Job $job) {
        return Inertia::render('admin/job-edit', [
            'job' => $job,
        ]);
    })->name('jobs.edit');

    // Job applications management
    Route::get('job-applications', function () {
        return Inertia::render('admin/job-applications');
    })->name('job-applications');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__ . '/api.php';