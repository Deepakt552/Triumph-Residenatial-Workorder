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
        Schema::create('maintenance_requests', function (Blueprint $table) {
            $table->id();
            $table->string('work_order_number')->nullable();
            $table->foreignId('building_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained()->nullOnDelete();
            $table->string('building_name')->nullable();
            $table->string('tenant_name');
            $table->string('tenant_email');
            $table->string('tenant_phone')->nullable();
            $table->string('property_address');
            $table->string('unit_number')->nullable();
            $table->string('city');
            $table->string('state');
            $table->string('zip_code');
            $table->text('work_requested');
            $table->string('priority')->default('B');  // A-Urgent, B-Routine, C-Low, PM-Preventive Maintenance
            $table->boolean('is_emergency')->default(false);
            $table->boolean('permission_to_enter')->default(false);
            $table->date('scheduled_date')->nullable();
            $table->string('scheduled_time')->nullable();
            $table->text('special_instructions')->nullable();
            $table->text('tenant_signature')->nullable(); // Base64 encoded signature
            $table->string('signature_file_path')->nullable(); // For uploaded signature files
            $table->text('property_images')->nullable(); // JSON encoded array of property image paths
            $table->string('status')->default('pending');
            $table->string('pdf_path')->nullable();
            
            // Office use fields
            $table->date('start_date')->nullable();
            $table->boolean('job_complete')->default(false);
            $table->text('incomplete_reason')->nullable();
            $table->string('will_return_date')->nullable();
            $table->decimal('labor_cost', 10, 2)->nullable();
            $table->decimal('material_cost', 10, 2)->nullable();
            $table->decimal('total_cost', 10, 2)->nullable();
            $table->string('chargeable_to')->nullable();
            $table->text('work_done')->nullable();
            $table->string('maintenance_person1')->nullable();
            $table->string('maintenance_person2')->nullable();
            $table->boolean('tenant_signature_received')->default(false);
            $table->timestamp('tenant_signature_date')->nullable();
            $table->timestamp('manager_signature_date')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_requests');
    }
}; 