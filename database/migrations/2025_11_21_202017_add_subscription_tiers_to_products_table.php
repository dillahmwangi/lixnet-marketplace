<?php
// File: database/migrations/2024_01_02_000000_add_subscription_tiers_to_products_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_subscription')->default(false)->after('price');
            $table->json('subscription_tiers')->nullable()->after('is_subscription');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['is_subscription', 'subscription_tiers']);
        });
    }
};