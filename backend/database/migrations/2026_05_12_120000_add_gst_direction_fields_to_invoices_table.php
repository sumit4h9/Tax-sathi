<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->string('direction', 16)->default('outbound');
            $table->string('tax_mode', 16)->default('intra_state');
            $table->decimal('cgst_percent', 5, 2)->nullable();
            $table->decimal('sgst_percent', 5, 2)->nullable();
            $table->decimal('igst_percent', 5, 2)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn([
                'direction',
                'tax_mode',
                'cgst_percent',
                'sgst_percent',
                'igst_percent',
            ]);
        });
    }
};
