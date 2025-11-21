<?php
// File: database/migrations/2024_01_01_000000_create_subscriptions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('tier')->default('free');
            $table->string('status')->default('active');
            $table->decimal('price', 10, 2);
            $table->string('currency')->default('KES');
            $table->string('subscription_reference')->unique();
            $table->string('payment_reference')->nullable();
            $table->dateTime('started_at');
            $table->dateTime('next_billing_date');
            $table->dateTime('renewal_reminded_at')->nullable();
            $table->dateTime('cancelled_at')->nullable();
            $table->dateTime('expires_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['user_id', 'status']);
            $table->index('next_billing_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};