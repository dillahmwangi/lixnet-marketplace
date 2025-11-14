<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('agents', function (Blueprint $table) {
            $table->string('bank_name')->nullable()->after('is_active');
            $table->string('account_holder_name')->nullable()->after('bank_name');
            $table->string('account_number')->nullable()->after('account_holder_name');
            $table->string('branch_code')->nullable()->after('account_number');
            $table->string('swift_code')->nullable()->after('branch_code');
            $table->text('bank_address')->nullable()->after('swift_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agents', function (Blueprint $table) {
            $table->dropColumn([
                'bank_name',
                'account_holder_name',
                'account_number',
                'branch_code',
                'swift_code',
                'bank_address'
            ]);
        });
    }
};
