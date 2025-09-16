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
            // Add selected_language column if it doesn't exist
            if (!Schema::hasColumn('maintenance_requests', 'selected_language')) {
                $table->string('selected_language', 10)->default('en')->nullable()->after('manager_signature_date');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('maintenance_requests', function (Blueprint $table) {
            // Drop the column if it exists
            if (Schema::hasColumn('maintenance_requests', 'selected_language')) {
                $table->dropColumn('selected_language');
            }
        });
    }
};
