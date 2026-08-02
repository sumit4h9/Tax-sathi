<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->index(['firm_id', 'date'], 'invoices_firm_id_date_index');
            $table->index('date', 'invoices_date_index');
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->index('date', 'attendances_date_index');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex('invoices_firm_id_date_index');
            $table->dropIndex('invoices_date_index');
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex('attendances_date_index');
        });
    }
};
