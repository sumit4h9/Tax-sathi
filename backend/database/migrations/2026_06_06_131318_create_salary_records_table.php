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
        Schema::create('salary_records', function (Blueprint $table) {
            $table->id();
            $table->string('employee_id')->index(); // references users.id
            $table->integer('month');
            $table->integer('year');
            $table->decimal('absent_days', 10, 2)->default(0);
            $table->decimal('overtime_hours', 10, 2)->default(0);
            $table->decimal('final_salary', 10, 2)->default(0);
            $table->decimal('working_days', 10, 2)->default(0);
            $table->string('job_status')->default('In Progress'); // 'Completed' or 'In Progress'
            $table->timestamps();
            
            $table->unique(['employee_id', 'month', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salary_records');
    }
};
