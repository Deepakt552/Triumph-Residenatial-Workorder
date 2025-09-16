<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceRequest extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'work_order_number',
        'building_id',
        'property_id',
        'building_name',
        'unit_id',
        'unit_number',
        'tenant_name',
        'tenant_email',
        'tenant_phone',
        'property_address',
        'city',
        'state',
        'zip_code',
        'work_requested',
        'work_requested_original',
        'work_requested_translated',
        'priority',
        'is_emergency',
        'permission_to_enter',
        'no_permission_reason',
        'no_permission_reason_original',
        'no_permission_reason_translated',
        'scheduled_date',
        'scheduled_time',
        'special_instructions',
        'special_instructions_original',
        'special_instructions_translated',
        'tenant_signature',
        'signature_file_path',
        'is_digital_signature',
        'property_images',
        'status',
        'rejection_reason',
        'pdf_path',
        'email_delivery_status',
        'start_date',
        'job_complete',
        'incomplete_reason',
        'will_return_date',
        'labor_cost',
        'material_cost',
        'total_cost',
        'chargeable_to',
        'work_done',
        'maintenance_person1',
        'maintenance_person2',
        'tenant_signature_received',
        'tenant_signature_date',
        'manager_signature_date',
        'selected_language',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'permission_to_enter' => 'boolean',
        'is_emergency' => 'boolean',
        'is_digital_signature' => 'boolean',
        'job_complete' => 'boolean',
        'tenant_signature_received' => 'boolean',
        'labor_cost' => 'decimal:2',
        'material_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'scheduled_date' => 'date',
        'start_date' => 'date',
        'tenant_signature_date' => 'datetime',
        'manager_signature_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'property_images' => 'array',
        'selected_language' => 'string',
        'work_requested_original' => 'string',
        'work_requested_translated' => 'string',
        'special_instructions_original' => 'string',
        'special_instructions_translated' => 'string',
        'no_permission_reason_original' => 'string',
        'no_permission_reason_translated' => 'string',
        'email_delivery_status' => 'string',
        'rejection_reason' => 'string',
    ];
    
    /**
     * Get the building that owns the maintenance request.
     */
    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class);
    }
    
    /**
     * Get the property that owns the maintenance request.
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
    
    /**
     * Get the unit that owns the maintenance request.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }
    
    /**
     * Get the scheduled date and time combined.
     */
    public function getScheduledDateTimeAttribute(): ?string
    {
        if (!$this->scheduled_date) {
            return null;
        }
        
        $date = $this->scheduled_date->format('Y-m-d');
        return $this->scheduled_time ? "$date {$this->scheduled_time}" : $date;
    }
} 