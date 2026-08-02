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
        Schema::table('users', function (Blueprint $table) {
            $table->string('employee_id')->nullable();
            $table->string('department')->nullable();
            $table->string('designation')->nullable();
            $table->decimal('salary', 10, 2)->nullable();
            $table->decimal('absent_deduction_per_day', 10, 2)->nullable();
            $table->decimal('overtime_rate_per_hour', 10, 2)->nullable();
            $table->date('joining_date')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'employee_id',
                'department',
                'designation',
                'salary',
                'absent_deduction_per_day',
                'overtime_rate_per_hour',
                'joining_date',
            ]);
        });
    }
};
