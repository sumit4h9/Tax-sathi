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
        // We will assign a fallback user_id to all existing records.
        $admin = \App\Models\User::where('role', 'admin')->first();
        if (!$admin) {
            return;
        }

        $tenantId = (string) $admin->id;

        // 1. Move staff to employees collection
        $staffUsers = \App\Models\User::where('role', 'staff')->get();
        foreach ($staffUsers as $staff) {
            $oldId = (string) $staff->id;
            $staffData = $staff->toArray();
            $staffData['_id'] = new \MongoDB\BSON\ObjectId($oldId);
            $staffData['user_id'] = $tenantId;
            unset($staffData['id']); // remove eloquent's appended string id
            
            \Illuminate\Support\Facades\DB::table('employees')->insert($staffData);
            
            // Delete from users collection
            $staff->delete();
        }

        // 2. Add user_id to existing business tables and fix attendance employee_id
        
        // Drop old unique index on attendances
        try {
            \Illuminate\Support\Facades\DB::connection()->getCollection('attendances')->dropIndex('user_id_1_date_1');
        } catch (\Exception $e) {
            // ignore
        }
        
        // Attendances: rename user_id to employee_id
        $attendances = \App\Models\Attendance::all();
        foreach ($attendances as $att) {
            $att->employee_id = $att->user_id;
            $att->user_id = $tenantId;
            $att->save();
        }

        // SalaryRecords
        \App\Models\SalaryRecord::query()->whereNull('user_id')->update([
            'user_id' => $tenantId,
        ]);

        // Invoices
        \App\Models\Invoice::query()->whereNull('user_id')->update([
            'user_id' => $tenantId,
        ]);

        // Firms
        \App\Models\Firm::query()->whereNull('user_id')->update([
            'user_id' => $tenantId,
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
