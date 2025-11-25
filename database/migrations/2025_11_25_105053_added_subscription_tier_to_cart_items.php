<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
{
    Schema::table('cart_items', function (Blueprint $table) {
        $table->string('subscription_tier')->nullable()->after('quantity');
    });
}

public function down()
{
    Schema::table('cart_items', function (Blueprint $table) {
        $table->dropColumn('subscription_tier');
    });
}
};
