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
        Schema::table('maintenance_requests', function (Blueprint $table) {
            // Add translated fields
            $table->text('work_requested_original')->nullable()->after('work_requested');
            $table->text('work_requested_translated')->nullable()->after('work_requested_original');
            $table->text('special_instructions_original')->nullable()->after('special_instructions');
            $table->text('special_instructions_translated')->nullable()->after('special_instructions_original');
            $table->text('no_permission_reason_original')->nullable()->after('no_permission_reason');
            $table->text('no_permission_reason_translated')->nullable()->after('no_permission_reason_original');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('maintenance_requests', function (Blueprint $table) {
            $table->dropColumn([
                'work_requested_original',
                'work_requested_translated',
                'special_instructions_original',
                'special_instructions_translated',
                'no_permission_reason_original',
                'no_permission_reason_translated',
            ]);
        });
    }
};
